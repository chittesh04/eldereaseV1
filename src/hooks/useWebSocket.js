import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * WebSocket Management Hook with Auto-Reconnect,
 * Status Tracking, and Demo Simulation Mode fallback.
 */
export function useWebSocket({
  url = 'ws://localhost:8000/ws',
  onMessage,
  autoReconnect = true,
  reconnectInterval = 3000,
  maxRetries = 10,
} = {}) {
  const [status, setStatus] = useState('disconnected'); // 'connecting' | 'connected' | 'disconnected' | 'error'
  const [retryCount, setRetryCount] = useState(0);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const connect = useCallback(() => {
    if (isDemoMode) {
      setStatus('connected');
      return;
    }

    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    setStatus('connecting');

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected to', url);
        setStatus('connected');
        setRetryCount(0);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (onMessageRef.current) {
            onMessageRef.current(data);
          }
        } catch {
          // If message is plain text
          if (onMessageRef.current) {
            onMessageRef.current({
              sender: 'bot',
              text: event.data,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            });
          }
        }
      };

      ws.onerror = (error) => {
        console.warn('WebSocket error:', error);
        setStatus('error');
      };

      ws.onclose = () => {
        setStatus('disconnected');
        wsRef.current = null;

        if (autoReconnect && !isDemoMode) {
          setRetryCount((prev) => {
            if (prev < maxRetries) {
              clearTimeout(reconnectTimeoutRef.current);
              reconnectTimeoutRef.current = setTimeout(() => {
                connect();
              }, reconnectInterval);
              return prev + 1;
            }
            return prev;
          });
        }
      };
    } catch (err) {
      console.error('Failed to initialize WebSocket:', err);
      setStatus('disconnected');
    }
  }, [url, autoReconnect, reconnectInterval, maxRetries, isDemoMode]);

  useEffect(() => {
    connect();

    return () => {
      clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((payload) => {
    const messageObj = typeof payload === 'string' 
      ? { sender: 'user', text: payload, timestamp: new Date().toISOString() } 
      : payload;

    if (isDemoMode) {
      // Demo simulator mode when no server is running
      return true;
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(messageObj));
      return true;
    } else {
      console.warn('WebSocket is not open. Message not sent via socket.');
      return false;
    }
  }, [isDemoMode]);

  const reconnect = useCallback(() => {
    setRetryCount(0);
    clearTimeout(reconnectTimeoutRef.current);
    if (wsRef.current) {
      wsRef.current.close();
    }
    connect();
  }, [connect]);

  const enableDemoMode = useCallback(() => {
    setIsDemoMode(true);
    setStatus('connected');
    if (wsRef.current) {
      wsRef.current.close();
    }
  }, []);

  return {
    status,
    retryCount,
    isDemoMode,
    sendMessage,
    reconnect,
    enableDemoMode,
  };
}
