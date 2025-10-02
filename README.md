# TB X-ray AI - Tuberculosis Detection with Explainable AI

A comprehensive web application that uses deep learning to detect tuberculosis in chest X-ray images, providing explainable AI insights through Grad-CAM heatmaps and medical explanations.

## 🏥 Overview

This project combines state-of-the-art computer vision with medical AI to provide:
- **Automated TB Detection** using DenseNet121 deep learning model
- **Explainable AI** with Grad-CAM heatmaps showing model attention
- **Medical Explanations** via Google Gemini AI for both doctors and patients
- **Modern Web Interface** built with React, TypeScript, and TailwindCSS
- **RESTful API** with FastAPI backend

## 🚀 Features

### Core Functionality
- **Image Upload**: Drag-and-drop or click-to-upload X-ray images
- **AI Prediction**: Real-time TB detection with confidence scores
- **Heatmap Visualization**: Grad-CAM overlays showing suspicious regions
- **Medical Explanations**: Separate explanations for medical professionals and patients
- **Responsive Design**: Works on desktop and mobile devices

### Technical Features
- **Preprocessing Pipeline**: EXIF orientation correction, CLAHE contrast enhancement
- **Model Architecture**: DenseNet121 with custom classifier head
- **API Integration**: Google Gemini for medical explanations
- **Static File Serving**: Automatic heatmap generation and storage
- **Error Handling**: Graceful fallbacks and user-friendly error messages

## 📊 Model Training & Performance

### Training Process (`xray_model.ipynb`)
The model training is documented in `xray_model.ipynb` which includes:

#### **Architecture Details**
- **Base Model**: DenseNet121 (pre-trained on ImageNet)
- **Custom Classifier Head**: 
  ```python
  nn.Sequential(
      nn.Linear(num_features, 256),
      nn.ReLU(),
      nn.Dropout(0.4),
      nn.Linear(256, 2)  # Normal vs Tuberculosis
  )
  ```
- **Input Size**: 224x224 pixels
- **Optimizer**: Adam with learning rate scheduling
- **Loss Function**: CrossEntropyLoss

#### **Training Configuration**
- **Batch Size**: Optimized for available GPU memory
- **Epochs**: Early stopping based on validation loss
- **Data Augmentation**: Random rotation, horizontal flip, brightness/contrast adjustment
- **Validation Split**: 80/20 train-validation split
- **Preprocessing Pipeline**:
  ```python
  transforms.Compose([
      transforms.Resize((224, 224)),
      transforms.ToTensor(),
      transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
  ])
  ```

#### **Training Features in Notebook**
- **Grad-CAM Implementation**: Custom class for generating attention heatmaps
- **Model Visualization**: Architecture inspection and parameter counting
- **Performance Metrics**: Accuracy, precision, recall, F1-score tracking
- **Loss Curves**: Training and validation loss visualization
- **Confusion Matrix**: Classification performance analysis
- **Sample Predictions**: Visual inspection of model outputs
- **Heatmap Generation**: Grad-CAM visualization for interpretability

#### **Dataset Preparation**
- **Source**: NIAID dataset + custom collection
- **Total Samples**: 6,000 images (3,000 Normal + 3,000 TB)
- **Split Strategy**: Stratified splitting to maintain class balance
- **Quality Control**: Manual inspection and cleaning of dataset
- **Format**: PNG/JPG images with consistent preprocessing

#### **Model Performance Metrics**
- **Training Accuracy**: >95% on training set
- **Validation Accuracy**: >90% on held-out validation set
- **Test Performance**: Evaluated on independent test set
- **Confidence Thresholding**: Optimized for clinical relevance
- **Grad-CAM Quality**: Attention maps correlate with radiologist annotations

#### **Training Environment**
- **Framework**: PyTorch with CUDA acceleration
- **Hardware**: GPU training (specify if available: RTX 3080/4090, etc.)
- **Training Time**: ~2-4 hours depending on hardware
- **Model Size**: ~30MB saved weights
- **Deployment**: Optimized for inference with batch size 1

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **TailwindCSS** for styling
- **shadcn/ui** component library
- **React Router** for navigation
- **React Query** for state management

### Backend
- **FastAPI** for API server
- **PyTorch** for deep learning
- **OpenCV** for image processing
- **Google Gemini API** for medical explanations
- **Pillow** for image handling

### Development
- **TypeScript** for type safety
- **ESLint** for code quality
- **CORS** enabled for cross-origin requests

## 📁 Project Structure

```
tb_xray_ai/
├── backend/                 # FastAPI backend
│   ├── main.py             # API routes and server setup
│   ├── model.py            # DenseNet model loading and prediction
│   ├── utils.py            # Grad-CAM and image processing utilities
│   ├── gemini.py           # Google Gemini API integration
│   └── model/              # Trained model weights
│       └── best_model.pth  # DenseNet121 trained weights
├── src/                    # React frontend
│   ├── components/ui/      # shadcn/ui components
│   ├── pages/              # Application pages
│   │   ├── Index.tsx       # Landing page
│   │   └── Prediction.tsx  # TB detection interface
│   ├── hooks/              # Custom React hooks
│   └── lib/                # Utility functions
├── public/                 # Static assets
├── backend/static/         # Generated heatmaps
│   └── heatmaps/           # AI-generated heatmap images
├── xray_model.ipynb        # Model training notebook
├── requirements.txt        # Python dependencies
├── package.json           # Node.js dependencies
└── README.md              # Project documentation
```

## 🚀 Quick Start

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **Google Gemini API Key** (free tier available)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd tb_xray_ai
```

### 2. Backend Setup
```bash
# Install Python dependencies
pip install fastapi uvicorn torch torchvision opencv-python Pillow requests python-multipart google-generativeai

# Add your model file
# Place your best_model.pth in backend/model/best_model.pth

# Set up environment variables (optional)
# Create .env file with:
# GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Frontend Setup
```bash
# Install Node.js dependencies
npm install

# Create environment file
# Create .env file with:
VITE_API_URL=http://localhost:8000
```

### 4. Get Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API Key" → "Create API key"
4. Copy the API key (starts with `AIza...`)
5. Add to `backend/gemini.py` or set as environment variable

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 6. Access the Application
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📖 Usage Guide

### For Users
1. **Navigate to Prediction Page**: Click "Check X-Ray" on the homepage
2. **Upload X-Ray Image**: Drag and drop or click to select a chest X-ray
3. **Review Image**: Verify the uploaded image is correct
4. **Analyze**: Click "Analyze X-Ray" to run AI detection
5. **View Results**: 
   - See prediction (Normal/Tuberculosis) and confidence
   - Examine heatmap showing suspicious regions
   - Read medical explanations for professionals and patients

### For Developers
- **API Endpoint**: `POST /predict` accepts multipart form data with `image` field
- **Response Format**:
```json
{
  "prediction": "Tuberculosis",
  "confidence": 0.92,
  "heatmap_url": "/static/heatmaps/heatmap_123.png",
  "explanation_doctor": "Technical medical explanation...",
  "explanation_patient": "Simple patient-friendly explanation..."
}
```

## 🔧 Configuration

### Model Configuration
- **Model Path**: Update `MODEL_PATH` in `backend/model.py`
- **Class Names**: Modify `CLASS_NAMES` array for different labels
- **Architecture**: Adjust `_build_fallback_architecture()` for different models

### API Configuration
- **CORS Origins**: Update `allow_origins` in `backend/main.py`
- **Gemini Model**: Change `GEMINI_API_URL` in `backend/gemini.py`
- **Image Processing**: Modify preprocessing pipeline in `backend/model.py`

### Frontend Configuration
- **API URL**: Set `VITE_API_URL` in `.env`
- **Styling**: Update `src/index.css` for theme customization
- **Components**: Modify `src/components/ui/` for UI changes

## 🧪 Testing & Model Reproduction

### Reproducing Model Training
To retrain the model using the provided notebook:

1. **Open Jupyter Notebook**:
   ```bash
   jupyter notebook xray_model.ipynb
   ```

2. **Install Training Dependencies**:
   ```bash
   pip install torch torchvision matplotlib seaborn scikit-learn jupyter
   ```

3. **Prepare Dataset**:
   - Download from the [cleaned dataset](https://drive.google.com/drive/folders/1Z7LVK9Aar3kxPP3QJlUXoxnaFwRg1CxQ?usp=sharing)
   - Organize into `train/Normal/` and `train/Tuberculosis/` folders
   - Update paths in the notebook cell 1

4. **Run Training**:
   - Execute cells sequentially
   - Monitor training progress and validation metrics
   - Save the best model as `best_model.pth`

5. **Model Evaluation**:
   - Review Grad-CAM visualizations
   - Analyze confusion matrix and performance metrics
   - Test on sample images for qualitative assessment

### Backend Testing
```bash
# Test API health
curl http://localhost:8000/health

# Test prediction endpoint
curl -F "image=@path/to/xray.png" http://localhost:8000/predict
```

### Frontend Testing
- Open browser developer tools (F12)
- Check console for API responses and errors
- Verify image upload and display functionality

## 📊 Dataset Information

The model is trained on a comprehensive chest X-ray dataset:
- **Source**: [Cleaned TB Dataset](https://drive.google.com/drive/folders/1Z7LVK9Aar3kxPP3QJlUXoxnaFwRg1CxQ?usp=sharing)
- **Classes**: Normal (3,000 samples) and Tuberculosis (3,000 samples)
- **Preprocessing**: Standardized to 224x224 pixels with ImageNet normalization

### Important Note
The model performs optimally on the specific dataset it was trained on. For real-world deployment, comprehensive training on diverse X-ray images from various equipment, demographics, and clinical settings would be essential for robust performance.

## 🚨 Limitations & Disclaimers

- **Medical Disclaimer**: This tool is for research and educational purposes only
- **Not for Diagnosis**: Results should not replace professional medical diagnosis
- **Dataset Bias**: Model performance may vary on images from different sources
- **Confidence Thresholds**: Low confidence results require additional medical review

## 🔮 Future Enhancements

- [ ] Multi-class classification (Normal, TB, Pneumonia, etc.)
- [ ] Batch processing for multiple images
- [ ] Model versioning and A/B testing
- [ ] User authentication and history
- [ ] Integration with PACS systems
- [ ] Mobile app development
- [ ] Real-time video analysis
- [ ] Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Dataset**: NIAID and custom TB dataset contributors
- **Model Architecture**: DenseNet121 by Facebook Research
- **UI Components**: shadcn/ui component library
- **AI Explanations**: Google Gemini API
- **Medical Guidance**: Healthcare professionals and researchers

## 📞 Support

For questions, issues, or contributions:
- **Issues**: Create a GitHub issue
- **Discussions**: Use GitHub Discussions
- **Email**: [praveen.hebbal2004@gmail.com]
-**visit**:[https://my-portfolio-one-theta-42.vercel.app/]

---

**Built with ❤️ for advancing medical AI and improving healthcare accessibility.**