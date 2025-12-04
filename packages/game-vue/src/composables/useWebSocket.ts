import { ref, onUnmounted, watch } from "vue";
import type { GameMessage, ScoreSubmission } from "@quicky-finger/shared";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080";
console.log("import.meta.env.VITE_WS_URL: ", WS_URL);
console.log("import.meta.env.PROD: ", import.meta.env.PROD);

export function useWebSocket() {
  const ws = ref<WebSocket | null>(null);
  const connected = ref(false);
  const error = ref<string | null>(null);

  const reconnecWindowtInterval = ref<number | null>(null);
  const activeTimer = ref<number | null>(null);
  const reconnectTimer = ref<number | null>(null);
  const isReconnecting = ref(false);
  const RECONNECT_WINDOW_INTERVAL: number = 300000;
  const ACTIVE_TIMER: number = 60000;
  const RECONNECT_INTERVAL: number = 3000;

  function connect(): void {
    try {
      ws.value = new WebSocket(WS_URL);

      ws.value.onopen = () => {
        console.log("WebSocket connected");
        connected.value = true;
        error.value = null;
        stopReconnectCycle();
      };

      ws.value.onclose = () => {
        console.log("WebSocket disconnected");
        connected.value = false;
      };

      ws.value.onerror = (event) => {
        console.error("WebSocket error:", event);
        error.value = "Connection error";
      };

      ws.value.onmessage = (event) => {
        try {
          const message: GameMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (err) {
          console.error("Failed to parse message:", err);
        }
      };
    } catch (err) {
      error.value = "Failed to connect";
      console.error("Connection failed:", err);
    }
  }

  function disconnect(): void {
    if (ws.value) {
      try {
        ws.value.onopen = null;
        ws.value.onclose = null;
        ws.value.onerror = null;
        ws.value.onmessage = null;

        ws.value.close();
      } catch (err) {
        console.error("Failed to disconnect gracefully:", err);
      }
      ws.value = null;
    }
    messageHandlers.clear();
    connected.value = false;
  }

  function send(message: GameMessage): void {
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket not connected");
    }
  }

  function submitScore(submission: ScoreSubmission): void {
    send({
      type: "SCORE_SUBMIT",
      payload: submission,
    });
  }

  const messageHandlers = new Map<string, (payload: unknown) => void>();

  function onMessage(type: string, handler: (payload: unknown) => void) {
    messageHandlers.set(type, handler);
  }

  function handleMessage(message: GameMessage): void {
    const handler = messageHandlers.get(message.type);
    if (handler && message.payload) {
      handler(message.payload);
    }
  }

  // Reconnect
  watch(connected, (isConnected) => {
    if (!isConnected) {
      startReconnectCycle();
    } else {
      stopReconnectCycle();
      console.log("Reconnection succeeded!");
    }
  });

  function startReconnectCycle(): void {
    if (reconnecWindowtInterval.value !== null) return;

    console.log(
      "Starting reconnect cycle (every",
      RECONNECT_WINDOW_INTERVAL / 1000,
      "s)",
    );
    // start a reconnect window immediately
    startReconnectWindow();

    // then schedule repeating windows every OUTER_INTERVAL_MS
    reconnecWindowtInterval.value = window.setInterval(() => {
      startReconnectWindow();
    }, RECONNECT_WINDOW_INTERVAL);
  }

  function startReconnectWindow(): void {
    if (reconnectTimer.value !== null) return;

    isReconnecting.value = true;
    console.log(
      "Starting reconnect attempts window for",
      RECONNECT_INTERVAL / 1000,
      "s",
    );

    // attempt immediately
    connect();

    // then attempt every RECONNECT_INTERVAL
    reconnectTimer.value = window.setInterval(() => {
      console.log("Attempting to reconnect...");
      connect();
    }, RECONNECT_INTERVAL);

    // stop the attempts after ACTIVE_TIMER
    activeTimer.value = window.setTimeout(() => {
      console.log("Reconnect attempts window ended");
      if (reconnectTimer.value !== null) {
        clearInterval(reconnectTimer.value);
        reconnectTimer.value = null;
      }
      if (activeTimer.value !== null) {
        clearTimeout(activeTimer.value);
        activeTimer.value = null;
      }
      isReconnecting.value = false;
    }, ACTIVE_TIMER);
  }

  function stopReconnectCycle(): void {
    if (reconnecWindowtInterval.value !== null) {
      clearInterval(reconnecWindowtInterval.value);
      reconnecWindowtInterval.value = null;
    }
    if (reconnectTimer.value !== null) {
      clearInterval(reconnectTimer.value);
      reconnectTimer.value = null;
    }
    if (activeTimer.value !== null) {
      clearTimeout(activeTimer.value);
      activeTimer.value = null;
    }
    isReconnecting.value = false;
  }

  onUnmounted(() => {
    disconnect();
    stopReconnectCycle();
  });

  return {
    connected,
    error,
    connect,
    disconnect,
    send,
    submitScore,
    onMessage,
    isReconnecting,
  };
}
