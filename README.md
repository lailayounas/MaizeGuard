🌽 Maize Guard AI
 
An AI-Powered Smart Agriculture Platform for Maize Disease Detection and Intelligent Farming Assistance.

Maize Guard AI is a modern full-stack AI platform designed to help farmers, agriculture students, and researchers detect maize leaf diseases instantly using Deep Learning and conversational AI.

The system combines a custom-trained TensorFlow/Keras CNN model with Google Gemini AI to provide:

Accurate disease prediction
Confidence analysis
Treatment recommendations
Prevention guidance
Smart farming assistance
🚀 Features
🔐 Authentication System
Secure user registration & login
Firebase Authentication
Protected dashboard access
🤖 AI Disease Detection

Upload maize leaf images and detect:

Blight
Common Rust
Grey Leaf Spot
Healthy Leaves
🧠 Smart AI Chatbot

Integrated with Gemini AI for:

Disease explanation
Treatment suggestions
Prevention strategies
Farming guidance
📊 Prediction History
Save previous predictions
Store uploaded images
Review diagnosis history anytime
📱 Mobile Friendly
Fully responsive UI
Progressive Web App (PWA)
Android APK support
iOS Add-to-Home-Screen support
🎨 Modern UI/UX
Clean agriculture-inspired design
Glassmorphism effects
Smooth animations
ChatGPT-style chatbot interface
🛠 Tech Stack
Frontend
Next.js
React
Tailwind CSS
Framer Motion
Backend
FastAPI
Python
Artificial Intelligence
TensorFlow / Keras
CNN Image Classification Model
Database & Cloud
Firebase Authentication
Firebase Firestore
Firebase Storage
Conversational AI
Google Gemini API
⚙️ System Workflow
User Login/Register
        ↓
Upload Maize Leaf Image
        ↓
Frontend Sends Image to FastAPI Backend
        ↓
Image Preprocessing
        ↓
CNN Model Predicts Disease
        ↓
Prediction + Confidence Returned
        ↓
Gemini AI Generates Treatment Advice
        ↓
Result Saved in Firebase
        ↓
Displayed in Chatbot Dashboard
📂 Project Structure
Maize-Guard/
│
├── frontend/
│
├── backend/
│   ├── model/
│   │   └── Maizeplant_disease_model.h5
│   ├── main.py
│   └── requirements.txt
│
├── notebooks/
│   └── corn-maize-disease-classification.ipynb
│
└── README.md
🧪 AI Model Details

The CNN model was trained on maize leaf datasets and classifies images into four categories:

Class	Description
Blight	Leaf disease causing lesions
Common Rust	Rust fungal infection
Grey Leaf Spot	Grey fungal leaf infection
Healthy	Disease-free maize leaf
🔥 Key Highlights
Real-time AI disease prediction
Custom-trained CNN model
Gemini-powered chatbot assistance
FastAPI AI backend
Firebase cloud integration
Production-ready architecture
Mobile responsive design
📸 Application Screens
Home Page
Login/Register
AI Chatbot Dashboard
Image Upload Interface
Disease Prediction Results
Prediction History
📚 Final Year Project

This project was developed as a Final Year Project focused on:

Artificial Intelligence
Deep Learning
Smart Agriculture
Full Stack Development
Cloud Computing
AI Chatbot Systems
👨‍💻 Future Improvements
Multi-crop disease detection
Offline AI prediction using TensorFlow Lite
IoT farming sensor integration
Multi-language support
Real-time agricultural analytics
📄 License

This project is developed for educational and research purposes.
