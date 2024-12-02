import toast from "react-hot-toast";
import { WS_BACKEND_URL } from "./config";
import {
  APP_ERROR_WEB_SOCKET_CODE,
  USER_CLOSE_WEB_SOCKET_CODE,
} from "./constants";
import { FullGenerationSettings } from "./types";

const ERROR_MESSAGE =
  "Error generating code. Check the Developer Console AND the backend logs for details. Feel free to open a Github issue.";

const CANCEL_MESSAGE = "Code generation cancelled";

type WebSocketResponse = {
  type: "chunk" | "status" | "setCode" | "error";
  value: string;
  variantIndex: number;
};
import toast from "react-hot-toast";
import { WS_BACKEND_URL } from "./config";
import {
  APP_ERROR_WEB_SOCKET_CODE,
  USER_CLOSE_WEB_SOCKET_CODE,
} from "./constants";
import { FullGenerationSettings } from "./types";

type WebSocketResponse = {
  type: "chunk" | "status" | "setCode" | "error";
  value: string;
  variantIndex: number;
};

function initializeWebSocket(
  wsRef: React.MutableRefObject<WebSocket | null>,
  params: FullGenerationSettings
) {
  const wsUrl = `${WS_BACKEND_URL}/generate-code`;
  console.log("Connecting to backend @ ", wsUrl);

  const ws = new WebSocket(wsUrl);
  wsRef.current = ws;

  ws.addEventListener("open", () => {
    ws.send(JSON.stringify(params));
  });

  return ws;
}

/**
 * Handles incoming WebSocket messages and triggers appropriate callbacks
 * based on the message type.
 *
 * @param ws - The WebSocket instance to listen for messages on.
 * @param onChange - Callback function to handle "chunk" type messages,
 *                   receiving the chunk data and variant index.
 * @param onSetCode - Callback function to handle "setCode" type messages,
 *                    receiving the complete code and variant index.
 * @param onStatusUpdate - Callback function to handle "status" type messages,
 *                         receiving the status update and variant index.
 */function handleWebSocketMessage(
  ws: WebSocket,
  onChange: (chunk: string, variantIndex: number) => void,
  onSetCode: (code: string, variantIndex: number) => void,
  onStatusUpdate: (status: string, variantIndex: number) => void
) {
  ws.addEventListener("message", async (event: MessageEvent) => {
    const response = JSON.parse(event.data) as WebSocketResponse;
// Check if the WebSocket response type is "chunk".
// If true, call the `onChange` callback with the chunk data and variant index.
if (response.type === "chunk") {
  onChange(response.value, response.variantIndex);
} 
// Check if the WebSocket response type is "status".
// If true, call the `onStatusUpdate` callback with the status update and variant index.
else if (response.type === "status") {
  onStatusUpdate(response.value, response.variantIndex);
} 
// Check if the WebSocket response type is "setCode".
// If true, call the `onSetCode` callback with the complete code and variant index.
else if (response.type === "setCode") {
  onSetCode(response.value, response.variantIndex);
} 
// Check if the WebSocket response type is "error".
// If true, log the error to the console and display an error toast notification.
else if (response.type === "error") {
  console.error("Error generating code", response.value);
  toast.error(response.value);
}
  });



function handleWebSocketCloseAndError(
  ws: WebSocket,
  onCancel: () => void,
  onComplete: () => void
) {
  ws.addEventListener("close", (event) => {
    console.log("Connection closed", event.code, event.reason);
    if (event.code === USER_CLOSE_WEB_SOCKET_CODE) {
      toast.success("Code generation cancelled");
      onCancel();
    } else if (event.code === APP_ERROR_WEB_SOCKET_CODE) {
      console.error("Known server error", event);
      onCancel();
    } else if (event.code !== 1000) {
      console.error("Unknown server or connection error", event);
      toast.error("Error generating code. Check the Developer Console AND the backend logs for details. Feel free to open a Github issue.");
      onCancel();
    } else {
      onComplete();
    }
  });

  ws.addEventListener("error", (error) => {
    console.error("WebSocket error", error);
    toast.error("Error generating code. Check the Developer Console AND the backend logs for details. Feel free to open a Github issue.");
  });
}

export function generateCode(
  wsRef: React.MutableRefObject<WebSocket | null>,
  params: FullGenerationSettings,
  onChange: (chunk: string, variantIndex: number) => void,
  onSetCode: (code: string, variantIndex: number) => void,
  onStatusUpdate: (status: string, variantIndex: number) => void,
  onCancel: () => void,
  onComplete: () => void
) {
  const ws = initializeWebSocket(wsRef, params);
  handleWebSocketMessage(ws, onChange, onSetCode, onStatusUpdate);
  handleWebSocketCloseAndError(ws, onCancel, onComplete);
}

  ws.addEventListener("close", (event) => {
    console.log("Connection closed", event.code, event.reason);
    if (event.code === USER_CLOSE_WEB_SOCKET_CODE) {
      toast.success(CANCEL_MESSAGE);
      onCancel();
    } else if (event.code === APP_ERROR_WEB_SOCKET_CODE) {
      console.error("Known server error", event);
      onCancel();
    } else if (event.code !== 1000) {
      console.error("Unknown server or connection error", event);
      toast.error(ERROR_MESSAGE);
      onCancel();
    } else {
      onComplete();
    }
  });

  ws.addEventListener("error", (error) => {
    console.error("WebSocket error", error);
    toast.error(ERROR_MESSAGE);
  });
}
