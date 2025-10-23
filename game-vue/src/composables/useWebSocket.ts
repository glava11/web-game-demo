import { ref, onUnmounted, watch } from "vue";
import type { GameMessage, ScoreSubmission } from "../types/game.types";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080";

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

  function connect() {
    try {
      ws.value = new WebSocket(WS_URL);

      ws.value.onopen = () => {
        console.log("WebSocket connected");
        connected.value = true;
        error.value = null;
        // isReconnecting.value = false;
        stopReconnectCycle();
      };

      ws.value.onclose = () => {
        console.log("WebSocket disconnected");
        connected.value = false;
        // isReconnecting.value = true;
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

  function disconnect() {
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

  function send(message: GameMessage) {
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket not connected");
    }
  }

  function submitScore(submission: ScoreSubmission) {
    send({
      type: "SCORE_SUBMIT",
      payload: submission,
    });
  }

  // Message handlers - to be set by components
  const messageHandlers = new Map<string, (payload: unknown) => void>();

  function onMessage(type: string, handler: (payload: unknown) => void) {
    messageHandlers.set(type, handler);
  }

  function handleMessage(message: GameMessage) {
    const handler = messageHandlers.get(message.type);
    if (handler && message.payload) {
      handler(message.payload);
    }
  }

  // Reconnect
  watch(connected, (isConnected) => {
    if (!isConnected) {
      // start the outer cycle that opens 1-minute reconnect windows every 5 minutes
      startReconnectCycle();
    } else {
      // connected -> stop any running timers/intervals
      stopReconnectCycle();
      console.log("Reconnection succeeded!");
    }
  });

  function startReconnectCycle() {
    // already running outer cycle?
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

  function startReconnectWindow() {
    // already running window?
    if (reconnectTimer.value !== null) return;

    isReconnecting.value = true;
    console.log(
      "Starting reconnect attempts window for",
      RECONNECT_INTERVAL / 1000,
      "s",
    );

    // attempt immediately
    connect();

    // then attempt every RECONNECT_ATTEMPT_MS
    reconnectTimer.value = window.setInterval(() => {
      console.log("Attempting to reconnect...");
      connect();
    }, RECONNECT_INTERVAL);

    // stop the attempts after RECONNECT_WINDOW_MS
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
      // keep isReconnecting true until either outer cycle restarts window or a connection is established
      isReconnecting.value = false;
    }, ACTIVE_TIMER);
  }

  function stopReconnectCycle() {
    // clear outer interval
    if (reconnecWindowtInterval.value !== null) {
      clearInterval(reconnecWindowtInterval.value);
      reconnecWindowtInterval.value = null;
    }
    // clear running reconnect attempts
    if (reconnectTimer.value !== null) {
      clearInterval(reconnectTimer.value);
      reconnectTimer.value = null;
    }
    // clear reconnect window timeout
    if (activeTimer.value !== null) {
      clearTimeout(activeTimer.value);
      activeTimer.value = null;
    }
    isReconnecting.value = false;
  }

  // Cleanup on component unmount
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
