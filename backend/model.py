from typing import Tuple
from pathlib import Path
import torch
from PIL import Image
import numpy as np
import cv2
from torchvision import transforms, models


# Default class names; adjust if your model uses different ordering
CLASS_NAMES = ["Normal", "Tuberculosis"]

# Model file path: expects file placed at backend/model/best_model.pth
MODEL_PATH = Path(__file__).resolve().parent / "model" / "best_model.pth"


def _build_fallback_architecture(num_classes: int = 2):
    """Create DenseNet121 and adapt classifier head to match your training."""
    model = models.densenet121(weights=None)
    in_features = model.classifier.in_features
    model.classifier = torch.nn.Sequential(
        torch.nn.Linear(in_features, 256),
        torch.nn.ReLU(),
        torch.nn.Dropout(0.4),
        torch.nn.Linear(256, num_classes),
    )
    return model


def load_model():
    """
    Load and return the PyTorch model from MODEL_PATH.
    Attempts torchscript first; falls back to a ResNet18 state_dict.
    """
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    if MODEL_PATH.exists():
        # Try TorchScript
        try:
            ts_model = torch.jit.load(str(MODEL_PATH), map_location=device)
            ts_model.eval()
            return ts_model.to(device)
        except Exception:
            # Fallback: regular PyTorch state dict with ResNet18
            model = _build_fallback_architecture(num_classes=len(CLASS_NAMES))
            state = torch.load(str(MODEL_PATH), map_location=device)
            # Allow non-strict to accommodate head name mismatches
            model.load_state_dict(state, strict=False)
            model.eval()
            return model.to(device)
    # If not found, raise helpful error
    raise FileNotFoundError(f"Model weights not found at: {MODEL_PATH}")


_preprocess = transforms.Compose(
    [
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ]
)


def preprocess_image(image_file, apply_clahe: bool = True) -> Tuple[torch.Tensor, Image.Image]:
    """
    Read and preprocess the uploaded image bytes into a tensor the model expects.
    Steps:
      1) Convert to RGB
      2) Auto-orient using EXIF if present
      3) Optional CLAHE contrast enhancement
      4) Resize -> Tensor -> Normalize

    Returns (tensor, oriented_enhanced_pil_image) for downstream heatmap generation.
    """
    img = Image.open(image_file).convert("RGB")

    # Auto-rotate using EXIF orientation when available
    try:
        exif = getattr(img, "_getexif", lambda: None)()
        if exif is not None:
            orientation = exif.get(274)
            if orientation == 3:
                img = img.rotate(180, expand=True)
            elif orientation == 6:
                img = img.rotate(270, expand=True)
            elif orientation == 8:
                img = img.rotate(90, expand=True)
    except Exception:
        # ignore EXIF issues
        pass

    # Optional: CLAHE for contrast enhancement (operates in LAB space)
    if apply_clahe:
        img_cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
        lab = cv2.cvtColor(img_cv, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        cl = clahe.apply(l)
        merged = cv2.merge((cl, a, b))
        img_cv = cv2.cvtColor(merged, cv2.COLOR_LAB2BGR)
        img = Image.fromarray(cv2.cvtColor(img_cv, cv2.COLOR_BGR2RGB))

    # Resize + normalize
    tensor = _preprocess(img).unsqueeze(0)  # shape: [1, 3, 224, 224]
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    return tensor.to(device), img


def predict(model, input_tensor: torch.Tensor) -> Tuple[str, float]:
    """Run the model prediction and return (label, confidence)."""
    with torch.no_grad():
        logits = model(input_tensor)
        if isinstance(logits, (list, tuple)):
            logits = logits[0]
        probs = torch.softmax(logits, dim=1)
        confidence, idx = probs.max(dim=1)
        label = CLASS_NAMES[int(idx)] if int(idx) < len(CLASS_NAMES) else str(int(idx))
        return label, float(confidence)


