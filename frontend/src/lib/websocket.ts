import { useUIStore } from '@/store';
import type { Notification } from '@/types';

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private userId: string | null = null;

  constructor() {
    this.handleStorageChange = this.handleStorageChange.bind(this);
    window.addEventListener('storage', this.handleStorageChange);
  }

  connect(userId: string) {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.userId = userId;
    this.isConnecting = true;

    try {
      // Connect to WebSocket server
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
      this.ws = new WebSocket(`${wsUrl}/notifications/${userId}`);

      this.ws.onopen = () => {
        console.log('WebSocket connected for notifications');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const notification: Notification = JSON.parse(event.data);
          this.handleNotification(notification);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.isConnecting = false;
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.isConnecting = false;
    }
  }

  private handleNotification(notification: Notification) {
    // Add notification to UI store
    const { addNotification } = useUIStore.getState();
    
    addNotification({
      type: this.getNotificationType(notification.type),
      title: notification.title,
      message: notification.message,
    });

    // Show browser notification if permission is granted
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
      });
    }

    // Play notification sound
    this.playNotificationSound();
  }

  private getNotificationType(notificationType: string): 'success' | 'error' | 'warning' | 'info' {
    switch (notificationType) {
      case 'donation_confirmation':
        return 'success';
      case 'security_alert':
        return 'error';
      case 'streamer_update':
        return 'info';
      case 'marketing':
        return 'warning';
      default:
        return 'info';
    }
  }

  private playNotificationSound() {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(error => {
        console.log('Failed to play notification sound:', error);
      });
    } catch (error) {
      console.log('Failed to create notification audio:', error);
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      if (this.userId) {
        this.connect(this.userId);
      }
    }, delay);
  }

  private handleStorageChange(event: StorageEvent) {
    // Handle user logout by disconnecting WebSocket
    if (event.key === 'auth-store' && !event.newValue) {
      this.disconnect();
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnecting = false;
    this.userId = null;
    this.reconnectAttempts = 0;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // Request browser notification permission
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('Notification permission denied');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

export default webSocketService; 