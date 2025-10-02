from pathlib import Path
from typing import Optional
import base64
import os
import requests

# Use official Gemini SDK for better compatibility
import google.generativeai as genai


# Gemini API key - add your key directly here
GEMINI_API_KEY = "AIzaSyAhUzAbbY4IyUWVDgUjzlW0CWuMG4lFHRc"

# Gemini API endpoint - using gemini-pro-vision which supports images
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent"


def _encode_image_to_base64(file_path: Path) -> str:
    with open(file_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


def list_available_models() -> None:
    """List all available Gemini models and their capabilities."""
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        print("🔍 Available Gemini models:")
        print("-" * 50)
        
        for model in genai.list_models():
            print(f"📋 {model.name}")
            print(f"   Methods: {model.supported_generation_methods}")
            
            # Check if model supports images
            if 'generateContent' in model.supported_generation_methods:
                # Check if model supports multimodal (images + text)
                if hasattr(model, 'input_token_limit') and 'vision' in model.name.lower():
                    print(f"   ✅ SUPPORTS IMAGES - Good for TB heatmap analysis")
                elif 'vision' in model.name.lower() or 'pro-vision' in model.name.lower():
                    print(f"   ✅ SUPPORTS IMAGES - Good for TB heatmap analysis")
                else:
                    print(f"   📝 Text only")
            print()
            
    except Exception as e:
        print(f"❌ Error listing models: {e}")

def test_gemini_connection() -> bool:
    """Test if Gemini API is accessible and find best model for images."""
    if not GEMINI_API_KEY:
        print("❌ GEMINI_API_KEY not found")
        return False
    
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        
        # List available models first
        list_available_models()
        
        # Try to find the best model for images
        # Note: Even though models don't explicitly show "vision", some newer models support images
        best_model = None
        
        # Priority order for models that likely support images
        preferred_models = [
            "models/gemini-2.5-flash",  # Latest and fastest
            "models/gemini-2.5-pro",    # Most capable
            "models/gemini-2.0-flash",  # Stable version
            "models/gemini-pro-latest", # Fallback
        ]
        
        # Check if preferred models are available
        available_models = [model.name for model in genai.list_models()]
        
        for preferred in preferred_models:
            if preferred in available_models:
                best_model = preferred
                break
        
        if best_model:
            print(f"✅ Selected best available model: {best_model}")
            print(f"ℹ️  Note: Will test image support during actual usage")
            global GEMINI_API_URL
            GEMINI_API_URL = best_model
            return True
        else:
            print("❌ No suitable model found")
            return False
            
    except Exception as e:
        print(f"❌ Gemini API connection failed: {e}")
        return False


def get_explanation_from_gemini(heatmap_path: Path, prediction: str, confidence: float) -> dict:
    """
    Send the heatmap image to Gemini with prediction/confidence and return structured explanations.

    Returns dict with 'explanation_doctor' and 'explanation_patient' keys.
    """
    if not GEMINI_API_KEY or not GEMINI_API_URL:
        # Placeholder fallback when API key is not configured
        return {
            "explanation_doctor": (
                f"Grad-CAM heatmap analysis for {prediction} prediction (confidence: {confidence:.1%}). "
                "Highlighted regions indicate areas of high model attention, potentially corresponding to "
                "pulmonary opacities, consolidation patterns, or cavitary lesions consistent with tuberculosis. "
                "Correlate these findings with clinical presentation and consider additional imaging if confidence is low."
            ),
            "explanation_patient": (
                f"The AI analysis shows {prediction.lower()} findings with {confidence:.1%} confidence. "
                "The colored areas highlight regions where the AI detected patterns that may indicate tuberculosis. "
                "Please consult with your healthcare provider for proper diagnosis and treatment planning."
            )
        }

    try:
        print(f"🔍 Using Gemini model: {GEMINI_API_URL}")
        print(f"🔍 Image file exists: {heatmap_path.exists()}")
        
        # Configure Gemini
        genai.configure(api_key=GEMINI_API_KEY)
        
        # Load the model
        model = genai.GenerativeModel(GEMINI_API_URL)
        
        # Load and prepare the image
        import PIL.Image
        image = PIL.Image.open(heatmap_path)
        
        prompt = f"""You are a medical assistant AI. I will provide you:
1. A chest X-ray image with an overlaid Grad-CAM heatmap.
2. The model's prediction: {prediction}
3. The confidence score: {confidence:.3f}

Your task:
- Explain what the highlighted regions in the heatmap mean, in simple language.
- Relate those highlighted areas to possible tuberculosis indicators or normal structures in the lungs.
- Provide two levels of explanation:
  (a) For doctors: a more technical interpretation of why the model focused on those lung regions.
  (b) For patients: a simple, reassuring explanation of what the highlighted regions suggest, without technical jargon.
- If confidence is low (below 0.7), clearly say that the result may not be reliable and that further medical examination is needed.
- Keep the tone professional, clear, and supportive.

Please respond in this exact JSON format:
{{"explanation_doctor": "technical explanation here", "explanation_patient": "simple explanation here"}}"""

        # Generate content with image
        response = model.generate_content([prompt, image])
        text = response.text
        
        if not text:
            raise ValueError("Empty response from Gemini")
        
        # Try to parse as JSON
        import json
        try:
            # First, try to find JSON in the text if it's wrapped in other text
            if '"explanation_doctor"' in text and '"explanation_patient"' in text:
                # Extract JSON part from the response
                start_idx = text.find('{')
                end_idx = text.rfind('}') + 1
                if start_idx != -1 and end_idx != -1:
                    json_str = text[start_idx:end_idx]
                    parsed = json.loads(json_str)
                    if "explanation_doctor" in parsed and "explanation_patient" in parsed:
                        print(f"✅ Successfully parsed JSON response")
                        return parsed
            
            # If direct JSON parsing fails, try parsing the whole text
            parsed = json.loads(text)
            if "explanation_doctor" in parsed and "explanation_patient" in parsed:
                print(f"✅ Successfully parsed JSON response")
                return parsed
                
        except json.JSONDecodeError as e:
            print(f"⚠️ JSON parsing failed: {e}")
            
            # Try to extract content manually from the response
            if '"explanation_doctor"' in text:
                try:
                    # Extract doctor explanation
                    doctor_start = text.find('"explanation_doctor": "') + len('"explanation_doctor": "')
                    doctor_end = text.find('", "explanation_patient"')
                    doctor_text = text[doctor_start:doctor_end].replace('\\"', '"')
                    
                    # Extract patient explanation  
                    patient_start = text.find('"explanation_patient": "') + len('"explanation_patient": "')
                    patient_end = text.find('"}')
                    if patient_end == -1:
                        patient_end = len(text)
                    patient_text = text[patient_start:patient_end].replace('\\"', '"').rstrip('"}')
                    
                    return {
                        "explanation_doctor": doctor_text,
                        "explanation_patient": patient_text
                    }
                except Exception as extract_error:
                    print(f"⚠️ Manual extraction failed: {extract_error}")
            
            # If not JSON, split the text into doctor/patient sections
            if "For doctors:" in text and "For patients:" in text:
                parts = text.split("For doctors:")
                if len(parts) > 1:
                    doctor_part = parts[1].split("For patients:")[0].strip()
                    patient_part = parts[1].split("For patients:")[1].strip() if len(parts[1].split("For patients:")) > 1 else text
                    return {
                        "explanation_doctor": doctor_part,
                        "explanation_patient": patient_part
                    }
        
        # Fallback: use same text for both
        print(f"⚠️ Using fallback - same text for both sections")
        return {
            "explanation_doctor": text,
            "explanation_patient": text
        }
        
    except Exception as e:
        print(f"❌ Gemini API error: {e}")
        # Return fallback explanations on any error
        return {
            "explanation_doctor": (
                f"Grad-CAM analysis for {prediction} (confidence: {confidence:.1%}). "
                "AI explanation service temporarily unavailable. Correlate heatmap findings with clinical presentation."
            ),
            "explanation_patient": (
                f"The AI analysis indicates {prediction.lower()} with {confidence:.1%} confidence. "
                "Please consult your healthcare provider for proper medical evaluation and diagnosis."
            )
        }


