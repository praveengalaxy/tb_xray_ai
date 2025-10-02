from pathlib import Path
from typing import Any, Optional, Tuple
import numpy as np
from PIL import Image
import cv2
import torch


def _find_last_conv_layer(model: torch.nn.Module) -> Optional[torch.nn.Module]:
    last_conv = None
    for module in model.modules():
        if isinstance(module, torch.nn.Conv2d):
            last_conv = module
    return last_conv


def _compute_gradcam(model: torch.nn.Module, input_tensor: torch.Tensor, target_layer: torch.nn.Module, target_index: Optional[int] = None) -> np.ndarray:
    activations: Optional[torch.Tensor] = None
    gradients: Optional[torch.Tensor] = None

    def forward_hook(_module, _inp, output):
        nonlocal activations
        activations = output.detach()

    def backward_hook(_module, grad_in, grad_out):
        nonlocal gradients
        gradients = grad_out[0].detach()

    handle_fwd = target_layer.register_forward_hook(forward_hook)
    # Prefer full backward hook for better compatibility (PyTorch 2+)
    if hasattr(target_layer, "register_full_backward_hook"):
        handle_bwd = target_layer.register_full_backward_hook(backward_hook)
    else:
        handle_bwd = target_layer.register_backward_hook(backward_hook)  # type: ignore[attr-defined]

    try:
        model.zero_grad(set_to_none=True)
        logits = model(input_tensor)
        if isinstance(logits, (list, tuple)):
            logits = logits[0]
        if target_index is None:
            target_index = int(torch.argmax(logits, dim=1))
        target_score = logits[:, target_index]
        target_score.backward()

        assert activations is not None and gradients is not None, "Hooks did not capture activations/gradients"

        # Global average pooling over spatial dims for weights
        weights = gradients.mean(dim=(2, 3), keepdim=True)
        cam = (weights * activations).sum(dim=1, keepdim=True)  # [B,1,H,W]
        cam = torch.relu(cam)

        # Normalize to [0,1]
        cam -= cam.min()
        if cam.max() > 0:
            cam /= cam.max()

        cam_np = cam.squeeze().cpu().numpy().astype(np.float32)  # [H,W]
        cam_np = (cam_np * 255).astype(np.uint8)
        return cam_np
    except Exception:
        # On any failure, fall back to placeholder heatmap
        b, _, h, w = input_tensor.shape
        grid_x, grid_y = np.meshgrid(
            np.linspace(-1, 1, w, dtype=np.float32),
            np.linspace(-1, 1, h, dtype=np.float32),
        )
        radius = np.sqrt(grid_x ** 2 + grid_y ** 2)
        heat = np.clip(1.0 - radius, 0.0, 1.0)
        return (heat * 255).astype(np.uint8)
    finally:
        handle_fwd.remove()
        handle_bwd.remove()


def generate_gradcam_heatmap(pil_image: Image.Image, model: Any, input_tensor: torch.Tensor) -> np.ndarray:
    """Generate a Grad-CAM heatmap using the model's last Conv2d if available; else fallback."""
    if isinstance(model, torch.nn.Module):
        target_layer = _find_last_conv_layer(model)
        if target_layer is not None:
            return _compute_gradcam(model, input_tensor, target_layer)

    # Fallback placeholder heatmap sized to original image
    width, height = pil_image.size
    grid_x, grid_y = np.meshgrid(
        np.linspace(-1, 1, width, dtype=np.float32),
        np.linspace(-1, 1, height, dtype=np.float32),
    )
    radius = np.sqrt(grid_x ** 2 + grid_y ** 2)
    heat = np.clip(1.0 - radius, 0.0, 1.0)
    heat = (heat * 255).astype(np.uint8)
    return heat


def colorize_heatmap(heatmap_gray: np.ndarray) -> np.ndarray:
    """
    Apply a colormap to a single-channel heatmap. Returns BGR image for OpenCV.
    """
    return cv2.applyColorMap(heatmap_gray, cv2.COLORMAP_JET)


def overlay_heatmap_on_image(pil_image: Image.Image, heatmap_bgr: np.ndarray, alpha: float = 0.4) -> np.ndarray:
    """
    Overlay the colored heatmap on the original image.
    Returns BGR image suitable for saving via OpenCV.
    """
    rgb = np.array(pil_image.convert("RGB"))
    bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    heatmap_resized = cv2.resize(heatmap_bgr, (bgr.shape[1], bgr.shape[0]))
    overlay = cv2.addWeighted(bgr, 1.0, heatmap_resized, alpha, 0)
    return overlay


def save_heatmap(heatmap_gray: np.ndarray, save_path: Path, original_image: Optional[Image.Image] = None, alpha: float = 0.4) -> None:
    """Save a colored heatmap; overlay on original if provided."""
    save_path.parent.mkdir(parents=True, exist_ok=True)
    colored = colorize_heatmap(heatmap_gray)
    if original_image is not None:
        overlaid = overlay_heatmap_on_image(original_image, colored, alpha=alpha)
        cv2.imwrite(str(save_path), overlaid)
    else:
        cv2.imwrite(str(save_path), colored)


