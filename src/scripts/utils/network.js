import { StorageService } from '../services/StorageService.js';
import CONFIG from '../config.js'; // Tambahkan import config

export class NetworkUtils {
  static async isOnline() {
    try {
      const token = new StorageService().getToken();
      const headers = token
        ? { Authorization: `Bearer ${token}` }
        : {};

      const baseUrl = CONFIG.BASE_URL === 'API_BASE_URL'
        ? 'https://story-api.dicoding.dev/v1'
        : CONFIG.BASE_URL;

      const response = await fetch(`${baseUrl}/stories?size=1`, {
        method: 'GET',
        headers,
      });

      return response.ok;
    } catch (err) {
      console.error('Connection check failed:', err);
      return false;
    }
  }

  static async checkConnection() {
    const online = await this.isOnline();
    if (!online) {
      throw new Error('Tidak ada koneksi internet. Periksa jaringan Anda.');
    }
    return true;
  }
}