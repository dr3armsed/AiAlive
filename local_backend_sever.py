# local_backend_server.py

"""
OracleAI_925 Local Backend Server for Electron Integration (Python/FastAPI)
-----------------------------------------------------------------------------
This module serves as the critical bridge between the Electron-based React frontend
and the OracleAI_925 Offline Core Plugin (oracle_api_plugin.py).

It creates a lightweight FastAPI web server that runs *locally* within the Electron
application's bundle. The React frontend will make HTTP requests to this local server,
which in turn will invoke the methods of the loaded OracleAPIPlugin instance.

This architecture enables the entire OracleAI_925 application to operate completely
offline, leveraging your powerful Python backend with a modern web-based UI.

Key Features:
- FastAPI Integration: Efficient and modern web framework for local API endpoints.
- Plugin Hosting: Instantiates and manages the OracleAPIPlugin lifecycle.
- Endpoint Mapping: Maps frontend HTTP requests to plugin method calls.
- Offline Operation: All communication is local (localhost), no internet required.
- Electron Compatibility: Designed to be easily spawned as a child process by Electron's main process.
"""

from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, Union, List
import uvicorn
import sys
import os
import asyncio # For async operations if needed

# Add the directory containing oracle_api_plugin.py to the Python path
# This assumes local_backend_server.py is in the same directory as oracle_api_plugin.py
# or in a place where it can find your other core modules (exec_tools, file_tools, oracle_925, ai_agent).
# Adjust sys.path.insert(0, ...) if your project structure is different.
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

try:
    from oracle_api_plugin import create_oracle_plugin_instance, OracleAPIPlugin
    # Ensure ai_agent's global _AI_PROVIDERS is properly configured by the plugin init
    # No explicit action needed here, as OracleAPIPlugin's __init__ handles this now.
except ImportError as e:
    print(f"FATAL ERROR: Could not import oracle_api_plugin.py. Ensure it's in the same directory or PYTHONPATH: {e}")
    sys.exit(1)

# --- FastAPI Application Setup ---
app = FastAPI(
    title="OracleAI_925 Local Backend API",
    description="Local server for the OracleAI_925 Offline Core Plugin, designed for Electron integration.",
    version="2025.0.1_Local_Backend"
)

# --- Plugin Instance (Singleton within this server process) ---
# We instantiate the plugin once when the server starts.
try:
    oracle_plugin: OracleAPIPlugin = create_oracle_plugin_instance()
    # Call the plugin's initialize method to set up its internal state
    oracle_plugin.initialize()
    print("Local Backend Server: OracleAPIPlugin initialized successfully.")
except Exception as e:
    print(f"FATAL ERROR: Failed to initialize OracleAPIPlugin: {e}")
    sys.exit(1)

# --- Request Models for FastAPI Endpoints ---

class ChatRequest(BaseModel):
    user_id: str
    message: str

class CodeExecutionRequest(BaseModel):
    code: str
    language: str = "python"
    timeout: float = 8.0

class FileOperationRequest(BaseModel):
    filepath: str
    content: Optional[Union[str, bytes]] = None
    binary: bool = False
    atomic: bool = True # For write operations

class PluginActivationRequest(BaseModel):
    plugin_name: str
    args: List[Any] = []
    kwargs: Dict[str, Any] = {}

# --- API Endpoints ---

@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    """
    Handles chat messages, forwarding them to the OracleAI_925 plugin.
    """
    try:
        response = oracle_plugin.chat_with_oracle(req.user_id, req.message)
        return JSONResponse({"response": response})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OracleAI Chat Error: {e}")

@app.post("/execute-code")
async def execute_code_endpoint(req: CodeExecutionRequest):
    """
    Handles code execution requests, forwarding them to the OracleAI_925 plugin.
    """
    try:
        result = oracle_plugin.execute_code(req.code, req.language, req.timeout)
        return JSONResponse(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Code Execution Error: {e}")

@app.post("/file-read")
async def file_read_endpoint(req: FileOperationRequest):
    """
    Handles file read requests.
    Content is returned as base64 for binary, or plain text for text files.
    """
    try:
        content = oracle_plugin.read_file(req.filepath, req.binary)
        if content is None:
            raise HTTPException(status_code=404, detail=f"File not found or unreadable: {req.filepath}")

        if req.binary:
            import base64
            # For binary, encode to base64 to send over JSON
            return JSONResponse({"content_base64": base64.b64encode(content).decode('utf-8')})
        else:
            return JSONResponse({"content": content})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File Read Error: {e}")

@app.post("/file-write")
async def file_write_endpoint(req: FileOperationRequest):
    """
    Handles file write requests. Expects content as plain string or base64 for binary.
    """
    try:
        if req.content is None:
            raise HTTPException(status_code=400, detail="Content is required for file write operation.")

        content_to_write = req.content
        if req.binary and isinstance(req.content, str):
            import base64
            # If binary content is sent as base64 string, decode it
            content_to_write = base64.b64decode(req.content.encode('utf-8'))

        success = oracle_plugin.write_file(req.filepath, content_to_write, req.binary, req.atomic)
        if not success:
            raise HTTPException(status_code=500, detail="File write operation failed at plugin level.")
        return JSONResponse({"message": "File written successfully", "success": True})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File Write Error: {e}")

@app.get("/status")
async def status_endpoint():
    """
    Retrieves the current operational status and diagnostics of the OracleAI_925 plugin.
    """
    try:
        status_info = oracle_plugin.get_status()
        return JSONResponse(status_info)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Status Retrieval Error: {e}")

@app.post("/activate-conceptual-plugin")
async def activate_conceptual_plugin_endpoint(req: PluginActivationRequest):
    """
    Activates a conceptual internal plugin within the OracleAI_925 plugin.
    """
    try:
        result = oracle_plugin.activate_conceptual_plugin(req.plugin_name, *req.args, **req.kwargs)
        if result is None:
            raise HTTPException(status_code=404, detail=f"Conceptual plugin '{req.plugin_name}' not found.")
        return JSONResponse({"result": result})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Conceptual Plugin Activation Error: {e}")


# --- Server Startup ---
if __name__ == "__main__":
    # The default port for development. In Electron, this might be dynamically assigned.
    PORT = int(os.environ.get("LOCAL_SERVER_PORT", 8000))
    HOST = os.environ.get("LOCAL_SERVER_HOST", "127.0.0.1") # Loopback address

    print(f"Starting OracleAI_925 Local Backend Server on http://{HOST}:{PORT}")
    print("This server is intended to run as a child process within an Electron application.")
    print("DO NOT expose this server directly to the public internet.")

    # You might want to add logging configuration here for FastAPI/Uvicorn
    # logging.basicConfig(level=logging.INFO)

    uvicorn.run(app, host=HOST, port=PORT, log_level="info")

    # This code will only be reached if the server is shut down gracefully.
    print("Local Backend Server: Shutting down OracleAPIPlugin.")
    oracle_plugin.shutdown()
