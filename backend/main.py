from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import json
import logging
from typing import Set
import asyncio

# Configure logging
logging.basicConfig(level=logging.INFO)
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

@app.get("/health")
async def health_check():
    return JSONResponse({"status": "healthy"})

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
                logger.info(f"Received message type: {message.get('type')}")
                
                if message.get("type") == "voice_command":
                    # Echo back the voice command for processing
                    await websocket.send_json({
                        "type": "voice_command",
                        "text": message.get("text", ""),
                        "status": "received"
                    })
                
            except json.JSONDecodeError:
                logger.error("Invalid JSON received")
                await websocket.send_json({
                    "type": "error",
                    "message": "Invalid message format"
                })
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
        host="0.0.0.0",
        port=8000,
        log_level="info",
        access_log=True,
        timeout_keep_alive=65,
        ws_ping_interval=20,
        ws_ping_timeout=20
    )