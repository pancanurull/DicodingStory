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

            console.log('[Notification] Attempting to subscribe with token:', token);
            console.log('[Notification] Subscription object:', subscription);

            const response = await this.apiService.subscribeNotification(subscription, token);
            console.log('[Notification] Subscribe response:', response);
            return this.apiService.validateResponse(response);
        } catch (error) {
            console.error('[Notification] Failed to subscribe:', error);
            throw error;
        }
    }    async unsubscribeFromNotifications(endpoint) {
        try {
            console.log('[Notification] Starting unsubscribe process...');
            
            const token = this.storageService.getToken();
            if (!token) {
                console.log('[Notification] No token found for unsubscribe');
                return { success: false };
            }

            console.log('[Notification] Unsubscribing endpoint:', endpoint);
            const response = await this.apiService.unsubscribeNotification({ endpoint }, token);
            console.log('[Notification] Unsubscribe response:', response);
            
            return this.apiService.validateResponse(response);
        } catch (error) {
            console.error('[Notification] Failed to unsubscribe:', error);
            throw error;
        }
    }async checkNotificationPermission() {
        console.log('[Notification] Checking notification permission...');
        
        if (!('Notification' in window)) {
            console.log('[Notification] Notifications not supported in this browser');
            return 'not-supported';
        }

        console.log('[Notification] Current permission status:', Notification.permission);
        
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
    }    async createSubscription(registration) {
        try {
            console.log('[Notification] Starting subscription creation...');
            console.log('[Notification] Using VAPID key:', this.publicVapidKey);
            
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(this.publicVapidKey)
            });
            
            console.log('[Notification] Subscription created successfully:', subscription);
            return subscription;
        } catch (error) {
            console.error('[Notification] Failed to create push subscription:', error);
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