import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Builds dynamic WebSocket URL for Blinkit (8000) and Zepto (8001):
 * - On HTTP (localhost or LAN Wi-Fi IP): connects DIRECTLY to port 8000 (Blinkit) or 8001 (Zepto)
 *   so Vite proxy order bugs can NEVER cause a 403 Forbidden!
 * - On HTTPS (Cloudflare / ngrok / Tailscale tunnel): uses Vite's same-origin proxy (/ws or /ws-zepto).
 */
export function getDefaultWsUrl(pathOrStore = '/ws') {
  const isZepto =
    String(pathOrStore).toLowerCase().includes('zepto') ||
    String(pathOrStore).includes('8001');

  if (typeof window !== 'undefined') {
    const isSecure = window.location.protocol === 'https:';
    if (isSecure) {
      return `wss://${window.location.host}${isZepto ? '/ws-zepto' : '/ws'}`;
    }
    const host = window.location.hostname || 'localhost';
    const port = isZepto ? 8001 : 8000;
    return `ws://${host}:${port}/ws`;
  }

  return isZepto ? 'ws://localhost:8001/ws' : 'ws://localhost:8000/ws';
}

/**
 * WebSocket Management Hook with Auto-Reconnect, Instant Store Switching (8000 <-> 8001),
 * Status Tracking, and Demo Simulation Mode fallback.
 */
export function useWebSocket({
  url,
  store,
  onMessage,
  autoReconnect = true,
  reconnectInterval = 3000,
  maxRetries = 10,
} = {}) {
  // Determine whether this connection is for Zepto (8001) or Blinkit (8000)
  const resolvedUrl = (() => {
    if (store) return getDefaultWsUrl(store);
    if (url) {
      // If App.jsx passed a relative path or proxy URL like ws://localhost:3000/ws-zepto on HTTP,
      // convert it to direct port 8001 / 8000 when on HTTP to avoid Vite 403 proxy errors!
      if (
        typeof window !== 'undefined' &&
        window.location.protocol === 'http:' &&
        (url.includes('/ws-zepto') || url.includes(':3000/ws'))
      ) {
        return getDefaultWsUrl(url);
      }
      return url;
    }
    return getDefaultWsUrl('/ws');
  })();

  const [status, setStatus] = useState('disconnected'); // 'connecting' | 'connected' | 'disconnected' | 'error'
  const [retryCount, setRetryCount] = useState(0);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const wsRef = useRef(null);
  const currentUrlRef = useRef(resolvedUrl);
  const reconnectTimeoutRef = useRef(null);
  const onMessageRef = useRef(onMessage);
  const messageQueueRef = useRef([]);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const connect = useCallback(() => {
    if (isDemoMode) {
      setStatus('connected');
      return;
    }

    // If already open/connecting to the EXACT SAME URL, do nothing.
    // Otherwise (if switching between 8000 Blinkit and 8001 Zepto), close the old socket first!
    if (wsRef.current) {
      if (
        currentUrlRef.current === resolvedUrl &&
        (wsRef.current.readyState === WebSocket.OPEN ||
          wsRef.current.readyState === WebSocket.CONNECTING)
      ) {
        return;
      }
      // Cleanly detach old socket handlers so it doesn't trigger a false 'disconnected' or old reconnect
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.onclose = null;
      try {
        wsRef.current.close();
      } catch (_) { }
      wsRef.current = null;
    }

    currentUrlRef.current = resolvedUrl;
    setStatus('connecting');
    console.log('[ElderEase WS] Connecting to:', resolvedUrl);

    try {
      const ws = new WebSocket(resolvedUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (wsRef.current !== ws) return;
        console.log('[ElderEase WS] Connected to:', resolvedUrl);
        setStatus('connected');
        setRetryCount(0);

        // Flush any messages that were typed/clicked while switching stores!
        while (messageQueueRef.current.length > 0) {
          const msg = messageQueueRef.current.shift();
          ws.send(JSON.stringify(msg));
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (onMessageRef.current) {
            onMessageRef.current(data);
          }
        } catch {
          if (onMessageRef.current) {
            onMessageRef.current({
              sender: 'bot',
              text: event.data,
              timestamp: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
            });
          }
        }
      };

      ws.onerror = (error) => {
        if (wsRef.current !== ws) return;
        console.warn('[ElderEase WS] Error on', resolvedUrl, error);
        setStatus('error');
      };

      ws.onclose = () => {
        if (wsRef.current !== ws) return;

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
  }, [resolvedUrl, autoReconnect, reconnectInterval, maxRetries, isDemoMode]);

  useEffect(() => {
    connect();

    return () => {
      clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onerror = null;
        wsRef.current.onclose = null;
        try {
          wsRef.current.close();
        } catch (_) { }
        wsRef.current = null;
      }
    };
  }, [connect]);

  const sendMessage = useCallback(
    (payload) => {
      const messageObj =
        typeof payload === 'string'
          ? { sender: 'user', text: payload, timestamp: new Date().toISOString() }
          : payload;

      if (isDemoMode) {
        return true;
      }

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(messageObj));
        return true;
      } else {
        console.info('[ElderEase WS] Socket connecting/switching — queuing message:', messageObj);
        messageQueueRef.current.push(messageObj);
        return true;
      }
    },
    [isDemoMode]
  );

  const reconnect = useCallback(() => {
    setRetryCount(0);
    clearTimeout(reconnectTimeoutRef.current);
    if (wsRef.current) {
      wsRef.current.onclose = null;
      try {
        wsRef.current.close();
      } catch (_) { }
      wsRef.current = null;
    }
    connect();
  }, [connect]);

  const enableDemoMode = useCallback(() => {
    setIsDemoMode(true);
    setStatus('connected');
    if (wsRef.current) {
      wsRef.current.onclose = null;
      try {
        wsRef.current.close();
      } catch (_) { }
      wsRef.current = null;
    }
  }, []);

  return {
    status,
    activeUrl: resolvedUrl,
    retryCount,
    isDemoMode,
    sendMessage,
    reconnect,
    enableDemoMode,
  };
}