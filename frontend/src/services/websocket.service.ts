import { WS_BASE_URL } from '../config/constants';
import { authService } from './api/auth.service';

export type WebSocketMessageHandler = (message: any) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private userId: number | null = null;
  private listeners: Set<WebSocketMessageHandler> = new Set();
  private reconnectTimeout: any = null;
  private isExplicitlyClosed = false;

  public async connect(userId: number): Promise<void> {
    if (this.socket && this.userId === userId && this.socket.readyState === WebSocket.OPEN) {
      return;
    }
    this.disconnect();
    this.userId = userId;
    this.isExplicitlyClosed = false;

    try {
      const { ticket } = await authService.getWebSocketTicket();
      const wsUrl = `${WS_BASE_URL}/ws/${userId}`;
      this.socket = new WebSocket(wsUrl, ['hrms-ticket', ticket]);

      this.socket.onopen = () => {
        // Connected
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.listeners.forEach((handler) => handler(data));
        } catch {
          this.listeners.forEach((handler) => handler(event.data));
        }
      };

      this.socket.onclose = (event) => {
        if (!this.isExplicitlyClosed) {
          // Reconnect after 5 seconds
          this.reconnectTimeout = setTimeout(() => {
            if (this.userId) {
              this.connect(this.userId);
            }
          }, 5000);
        }
      };

      this.socket.onerror = () => {
        // Socket error handled in onclose
      };
    } catch {
      // Failed to get ws ticket, retry in 10s
      if (!this.isExplicitlyClosed) {
        this.reconnectTimeout = setTimeout(() => {
          if (this.userId) {
            this.connect(this.userId);
          }
        }, 10000);
      }
    }
  }

  public disconnect(): void {
    this.isExplicitlyClosed = true;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.userId = null;
  }

  public subscribe(handler: WebSocketMessageHandler): () => void {
    this.listeners.add(handler);
    return () => {
      this.listeners.delete(handler);
    };
  }
}

export const wsService = new WebSocketService();
