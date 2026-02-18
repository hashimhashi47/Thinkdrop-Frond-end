
import { useEffect, useRef, useState } from 'react';

const SOCKET_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/admin/ws';

export const useSocket = () => {
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef(null);
    const listenersRef = useRef(new Map());

    useEffect(() => {
        // Connect to WebSocket
        const socket = new WebSocket(SOCKET_URL);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log('WebSocket Connected');
            setIsConnected(true);
        };

        socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                // Expecting message structure: { type: "eventName", data: ... } or { event: "eventName", ... }
                // Adapting to user request: backend sends "dashboard" event.
                // Assuming message.type is the event name.
                const eventName = message.type || message.event;

                if (eventName && listenersRef.current.has(eventName)) {
                    listenersRef.current.get(eventName).forEach(callback => callback(message.data || message));
                }
            } catch (error) {
                console.error('WebSocket message parse error:', error);
            }
        };

        socket.onclose = () => {
            console.log('WebSocket Disconnected');
            setIsConnected(false);
        };

        socket.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };

        return () => {
            socket.close();
        };
    }, []);

    const on = (eventName, callback) => {
        if (!listenersRef.current.has(eventName)) {
            listenersRef.current.set(eventName, new Set());
        }
        listenersRef.current.get(eventName).add(callback);

        // Return unsubscribe function
        return () => {
            if (listenersRef.current.has(eventName)) {
                listenersRef.current.get(eventName).delete(callback);
                if (listenersRef.current.get(eventName).size === 0) {
                    listenersRef.current.delete(eventName);
                }
            }
        };
    };

    return { isConnected, on };
};
