import { ApiService } from '../services/ApiService.js';
import { StorageService } from '../services/StorageService.js';

export class NotificationModel {
    constructor() {
        this.apiService = new ApiService();
        this.storageService = new StorageService();
        this.publicVapidKey = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
    }

    async subscribeToNotifications(subscription) {
        try {
            const token = this.storageService.getToken();
            if (!token) {
                throw new Error('Anda harus login untuk menerima notifikasi.');
            }

            const response = await this.apiService.subscribeNotification(subscription, token);
            return this.apiService.validateResponse(response);
        } catch (error) {
            console.error('Failed to subscribe:', error);
            throw error;
        }
    }

    async unsubscribeFromNotifications(endpoint) {
        try {
            const token = this.storageService.getToken();
            if (!token) return { success: false };

            const response = await this.apiService.unsubscribeNotification({ endpoint }, token);
            return this.apiService.validateResponse(response);
        } catch (error) {
            console.error('Failed to unsubscribe:', error);
            throw error;
        }
    }

    async checkNotificationPermission() {
        if (!('Notification' in window)) {
            return 'not-supported';
        }

        if (Notification.permission === 'granted') {
            return 'granted';
        } else if (Notification.permission === 'denied') {
            return 'denied';
        } else {
            return 'default';
        }
    }

    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            throw new Error('Browser tidak mendukung notifikasi.');
        }

        const permission = await Notification.requestPermission();
        return permission;
    }

    async registerServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            throw new Error('Browser tidak mendukung service worker.');
        }

        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            return registration;
        } catch (error) {
            console.error('Service worker registration failed:', error);
            throw error;
        }
    }

    async createSubscription(registration) {
        try {
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(this.publicVapidKey)
            });
            
            return subscription;
        } catch (error) {
            console.error('Failed to create push subscription:', error);
            throw error;
        }
    }

    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }

        return outputArray;
    }

    showLocalNotification(title, options) {
        if (!('Notification' in window)) return;

        if (Notification.permission === 'granted') {
            new Notification(title, options);
        }
    }
}