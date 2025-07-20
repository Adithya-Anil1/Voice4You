# 🗣️ Voice4You

🤖 **Personalized Voice Assistant for Elderly, Blind and Alzheimer's Patients**

---

## 🌟 Overview

Voice4You is an intelligent, compassionate voice assistant application designed to empower independence and enhance daily life for elderly individuals, those with visual impairments, and Alzheimer's patients. Through AI-powered conversation, real-time object detection, and smart reminders, Voice4You becomes a trusted companion in navigating everyday challenges.

---

## ✨ Key Features

### 🎙️ **Voice Control & Recognition**
- 🔊 Real-time speech recognition using Web Speech API
- 🧠 Natural language processing with Google Gemini AI
- 🎵 Voice feedback for all interactions
- 📢 Support for intuitive voice commands

### 📸 **Smart Camera Integration**
- 🔍 Live camera feed with intelligent object detection
- 🎯 YOLOv4-based real-time object recognition
- 📣 Voice announcements for detected objects
- 📷 Easy screenshot capture functionality

### ⏰ **Intelligent Reminder System**
- 🎤 Voice-activated reminder creation
- 🕐 Time-based notifications with IST timezone support
- 💾 Persistent storage using localStorage
- 🔔 Visual and audio reminder alerts

### 💬 **AI-Powered Conversation**
- 🤖 Powered by Google Gemini AI
- 🧩 Context-aware, intelligent responses
- 👥 Elderly-friendly, concise communication
- ⚡ Real-time chat interface

---

## 🛠️ Tech Stack

### 🎨 **Frontend Technologies**
- ⚛️ **React 18** with TypeScript
- ⚡ **Vite** for lightning-fast build tooling
- 🎨 **Tailwind CSS** for beautiful styling
- 🔄 **Zustand** for efficient state management
- 🎯 **Lucide React** for crisp icons
- 📅 **date-fns** for smart date manipulation

### 🔧 **Backend Technologies**
- 🐍 **Python FastAPI** for robust WebSocket server
- 👁️ **OpenCV** for advanced computer vision
- 🎯 **YOLOv4** for precise object detection
- 🗣️ **pyttsx3** for natural text-to-speech
- 🚀 **uvicorn** for high-performance ASGI server

---

## 📁 Project Structure

```
🏠 Voice4You-main/
├── 📂 src/
│   ├── 🧩 components/
│   │   ├── 📹 CameraFeed.tsx         # Camera integration component
│   │   ├── 💬 Chat.tsx               # Interactive chat interface
│   │   ├── ⏰ ReminderSystem.tsx     # Main reminder interface
│   │   ├── ➕ ReminderForm.tsx       # Add new reminders
│   │   ├── 📋 ReminderList.tsx       # Display reminders
│   │   ├── 🎙️ VoiceControl.tsx       # Voice recognition controls
│   │   └── 🔌 WebSocketProvider.tsx  # WebSocket connection manager
│   ├── 🎣 hooks/
│   │   ├── ⏰ useReminders.ts        # Reminder management logic
│   │   ├── 🗣️ useVoiceCommands.ts    # Voice command processing
│   │   └── 🔌 useWebSocket.ts        # WebSocket connection hook
│   ├── 🏪 store/
│   │   └── 📦 useStore.ts            # Zustand state management
│   ├── ⚙️ config/
│   │   └── 🤖 ai.ts                  # Google Gemini AI configuration
│   ├── 🚀 App.tsx                    # Main application component
│   └── 🎯 main.tsx                   # Application entry point
├── 🔧 backend/
│   ├── 🐍 main.py                    # FastAPI backend server
│   ├── 📦 requirements.txt           # Python dependencies
│   └── 📝 coco.names                 # COCO dataset class names
├── 🧠 models/
│   ├── ⚙️ yolov4.cfg                 # YOLOv4 configuration
│   └── 📝 coco.names                 # Object class definitions
├── 🌐 static/
│   └── 📄 index.html                 # Camera interface
├── 🖥️ server.py                      # Main object detection server
└── 📋 package.json                   # Node.js dependencies
```

---

## 🚀 Installation Guide

### 📋 Prerequisites
- 🟢 Node.js 18+ and npm
- 🐍 Python 3.8+
- 📹 Webcam/camera device
- 🎙️ Microphone

### 🎨 Frontend Setup

1. **📦 Install dependencies:**
   ```bash
   npm install
   ```

2. **🔑 Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **🚀 Start the development server:**
   ```bash
   npm run dev
   ```

### 🔧 Backend Setup

1. **📦 Install Python dependencies:**
   ```bash
   pip install -r backend/requirements.txt
   ```

2. **🔍 Additional requirements for object detection:**
   ```bash
   pip install opencv-python-headless numpy pyttsx3
   ```

3. **🌐 Start the backend server:**
   ```bash
   python backend/main.py
   ```

4. **👁️ Start the object detection server:**
   ```bash
   python server.py
   ```

---

## ⚙️ Configuration

### ⚡ **Vite Configuration**
The `vite.config.ts` includes:
- ⚛️ React plugin setup
- 🔄 Proxy configuration for backend API
- 🖥️ Development server settings on port 5173

### 🤖 **AI Configuration**
Configure Google Gemini AI in `src/config/ai.ts`:
- 🔑 API key validation
- 🚀 Model initialization
- 📝 Response generation with concise formatting

---

## 🎤 Voice Commands Reference

### 📹 **Camera Control**
- 🔍 *"Open camera"* / *"Start camera"* / *"Show camera"*
- ❌ *"Close camera"* / *"Stop camera"* / *"Hide camera"*

### ⏰ **Reminders**
- ➕ *"Remind me to [task] at [time]"*
- 📋 *"Show reminders"* / *"My reminders"*
- ✨ *"Add reminder"*

### 💬 **General Queries**
- 🕐 *"What time is it?"* / *"Current time"*
- ❓ *"Help"* / *"What can you do?"*
- 🛑 *"Stop"* (stops speaking and listening)
- 🤔 Any general question (processed by AI)

---

## 🔄 State Management

The application uses Zustand for efficient state management:

```typescript
interface State {
  🔌 socket: WebSocket | null;
  ✅ isConnected: boolean;
  💬 messages: Message[];
  👁️ detectedObjects: string[];
  🗣️ isSpeaking: boolean;
  // ... action methods
}
```

---

## 👁️ Object Detection Capabilities

Our intelligent object detection system features:
- 🎯 **YOLOv4** model with COCO dataset
- 🔢 **80+ object classes** for comprehensive recognition
- ⚡ **Real-time processing** at 10 FPS
- 🔊 **Voice feedback** for detected objects
- 📊 **Confidence scoring** for maximum accuracy

**🏷️ Supported objects include:** person, bicycle, car, motorcycle, airplane, bus, train, truck, boat, traffic light, fire hydrant, and 70+ more everyday objects.

---

## 🌐 API Endpoints

### 🔌 **WebSocket Endpoints**
- `ws://localhost:8000/ws` - 🚀 Main WebSocket connection
- `ws://localhost:3000/ws` - 👁️ Object detection WebSocket

### 🌍 **HTTP Endpoints**
- `GET /health` - ✅ Health check
- `GET /static/index.html` - 📹 Camera interface

---

## 🌐 Browser Support

### 🔧 **Required Browser APIs**
- 🎙️ **Web Speech API** for voice recognition
- 📹 **MediaDevices API** for camera access
- 🔌 **WebSocket** for real-time communication
- 🗣️ **SpeechSynthesis API** for text-to-speech
- 🔔 **Notification API** for reminder alerts

### ✅ **Supported Browsers**
- 🟢 Chrome 25+ (recommended)
- 🟠 Firefox 44+
- 🔵 Safari 14.1+
- 🟣 Edge 79+

---

## 👨‍💻 Development

### 📜 **Available Scripts**

```bash
🚀 npm run dev          # Start development server
📦 npm run build        # Build for production
👀 npm run preview      # Preview production build
🔍 npm run lint         # Run ESLint
```

### 🐍 **Backend Scripts**

```bash
🌐 python backend/main.py    # Start WebSocket server
👁️ python server.py          # Start object detection server
```

---

## ♿ Accessibility Features

### 👴 **For Elderly Users**
- 🔍 Large, clear UI components
- 🎵 Voice-guided interactions
- 🎯 Simple command structure
- 🔊 Audio feedback for all actions

### 👁️ **For Blind Users**
- 🧭 Complete voice navigation
- 📖 Screen reader compatibility
- 📣 Audio descriptions of detected objects
- ⌨️ Keyboard-friendly interface

### 🧠 **For Alzheimer's Patients**
- ⏰ Consistent reminder system
- 🔄 Simple, repetitive interactions
- 🔊 Clear audio prompts
- 🧠 Memory assistance through voice

---

## 🔐 Security & Privacy

- 💾 Local storage for reminders (no cloud sync)
- 🔒 Secure WebSocket connections
- 🛡️ No personal data transmission
- 🏠 Local AI processing where possible

---

## 🔧 Troubleshooting

### ⚠️ **Common Issues**

1. **🎙️ Microphone not working:**
   - ✅ Check browser permissions
   - 🔌 Ensure microphone is connected
   - 🔄 Try refreshing the page

2. **📹 Camera not opening:**
   - 🚫 Check popup blocker settings
   - ✅ Verify camera permissions
   - 🖥️ Ensure backend server is running

3. **🗣️ Voice commands not recognized:**
   - 🗣️ Speak clearly and slowly
   - 📊 Check microphone levels
   - ✅ Verify Web Speech API support

4. **👁️ Object detection not working:**
   - 🖥️ Ensure `server.py` is running on port 3000
   - ✅ Check camera permissions
   - 📦 Verify YOLOv4 model files are downloaded

---





