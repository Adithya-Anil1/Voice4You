from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
import uvicorn
import json
import logging
import cv2
import numpy as np
import base64
from typing import Set
import os
from pathlib import Path
import urllib.request
import pyttsx3
import asyncio

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store active WebSocket connections
active_connections: Set[WebSocket] = set()

class ObjectDetector:
    def __init__(self):
        self.conf_threshold = 0.45
        self.nms_threshold = 0.4
        self.engine = pyttsx3.init()
        self.detected_objects_memory = set()
        self.init_model()

    def init_model(self):
        # Model files URLs - Using YOLOv4
        model_files = {
            'config': ('yolov4.cfg', 'https://raw.githubusercontent.com/AlexeyAB/darknet/master/cfg/yolov4.cfg'),
            'weights': ('yolov4.weights', 'https://github.com/AlexeyAB/darknet/releases/download/darknet_yolo_v3_optimal/yolov4.weights'),
            'classes': ('coco.names', 'https://raw.githubusercontent.com/AlexeyAB/darknet/master/data/coco.names')
        }
        
        # Create 'models' directory if it doesn't exist
        os.makedirs('models', exist_ok=True)
        
        # Download files if they don't exist
        for file_key, (filename, url) in model_files.items():
            filepath = os.path.join('models', filename)
            if not os.path.exists(filepath):
                logger.info(f"Downloading {filename}...")
                urllib.request.urlretrieve(url, filepath)

        # Load class names
        with open('models/coco.names', 'r') as f:
            self.classes = f.read().strip().split('\n')

        # Load YOLO network
        self.net = cv2.dnn.readNetFromDarknet('models/yolov4.cfg', 'models/yolov4.weights')
        
        # Try to use GPU if available
        try:
            self.net.setPreferableBackend(cv2.dnn.DNN_BACKEND_CUDA)
            self.net.setPreferableTarget(cv2.dnn.DNN_TARGET_CUDA)
            logger.info("Using CUDA backend")
        except:
            self.net.setPreferableBackend(cv2.dnn.DNN_BACKEND_OPENCV)
            logger.info("Using CPU backend")
        
        # Get output layer names
        layer_names = self.net.getLayerNames()
        self.output_layers = [layer_names[i - 1] for i in self.net.getUnconnectedOutLayers()]

    def detect_objects(self, frame):
        height, width = frame.shape[:2]
        
        blob = cv2.dnn.blobFromImage(frame, 1/255.0, (416, 416), swapRB=True, crop=False)
        self.net.setInput(blob)
        outs = self.net.forward(self.output_layers)
        
        class_ids = []
        confidences = []
        boxes = []
        
        for out in outs:
            for detection in out:
                scores = detection[5:]
                class_id = np.argmax(scores)
                confidence = scores[class_id]
                
                if confidence > self.conf_threshold:
                    center_x = int(detection[0] * width)
                    center_y = int(detection[1] * height)
                    w = int(detection[2] * width)
                    h = int(detection[3] * height)
                    x = int(center_x - w/2)
                    y = int(center_y - h/2)
                    boxes.append([x, y, w, h])
                    confidences.append(float(confidence))
                    class_ids.append(class_id)

        indexes = cv2.dnn.NMSBoxes(boxes, confidences, self.conf_threshold, self.nms_threshold)
        
        results = []
        current_objects = set()
        
        if len(indexes) > 0:
            indexes = indexes.flatten()
            for i in indexes:
                label = self.classes[class_ids[i]]
                confidence = confidences[i]
                results.append(f"{label} ({confidence:.2f})")
                current_objects.add(label)
                
                # Voice feedback for new objects
                if label not in self.detected_objects_memory:
                    self.engine.say(label)
                    self.engine.runAndWait()
                    self.detected_objects_memory.add(label)
        
        # Clean up objects that are no longer detected
        self.detected_objects_memory = self.detected_objects_memory.intersection(current_objects)
        
        return results

# Global detector instance
detector = None

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def root():
    return RedirectResponse(url="/static/index.html")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.on_event("startup")
async def startup_event():
    global detector
    try:
        detector = ObjectDetector()
        logger.info("Object detection model initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing object detection model: {e}")

def process_frame(frame_data: str):
    try:
        encoded_data = frame_data.split(',')[1]
        nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            logger.error("Failed to decode image")
            return []

        return detector.detect_objects(img)
    except Exception as e:
        logger.error(f"Error processing frame: {e}")
        return []

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    try:
        await websocket.accept()
        active_connections.add(websocket)
        logger.info("Client connected")
        
        while True:
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
                
                if message.get("type") == "frame_data":
                    detected_objects = process_frame(message["data"])
                    if detected_objects:
                        await websocket.send_json({
                            "type": "detection_result",
                            "objects": detected_objects
                        })
                
            except json.JSONDecodeError:
                logger.error("Invalid JSON received")
            except Exception as e:
                logger.error(f"Error processing message: {e}")
                break
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        if websocket in active_connections:
            active_connections.remove(websocket)
        logger.info("Client disconnected")

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=3000,
        log_level="debug"
    )