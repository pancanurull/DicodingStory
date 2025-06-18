export class ApiService {
  constructor() {
    this.baseURL = 'https://story-api.dicoding.dev/v1';
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    };
  }

  // Header dengan token (untuk endpoint yang butuh otentikasi)
  getAuthHeaders(token) {
    return {
      ...this.defaultHeaders,
      'Authorization': `Bearer ${token}`
    };
  }

  // Request utama (fetch)
  async request(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config = {
        ...options,
        headers: {
          ...options.headers // Jangan merge defaultHeaders langsung di sini
        }
      };

      // Otomatis atur Content-Type jika bukan FormData
      if (config.body instanceof FormData) {
        // Biarkan browser yang handle Content-Type
        if (config.headers['Content-Type']) {
          delete config.headers['Content-Type'];
        }
      } else {
        // Set Content-Type jika tidak pakai FormData
        config.headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // 🔐 Auth
  async register(userData) {
    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async login(credentials) {
    return this.request('/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  // 📚 Get Stories (dengan parameter)
  async getStories(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page);
    if (params.size) queryParams.append('size', params.size);
    if (params.location !== undefined) queryParams.append('location', params.location);

    const queryString = queryParams.toString();
    const endpoint = `/stories${queryString ? `?${queryString}` : ''}`;

    return this.request(endpoint, {
      headers: params.token ? this.getAuthHeaders(params.token) : this.defaultHeaders
    });
  }

  // 📄 Detail cerita
  async getStoryDetail(id, token) {
    return this.request(`/stories/${id}`, {
      headers: this.getAuthHeaders(token)
    });
  }

  // ➕ Tambah cerita (FormData + token)
  async addStory(storyData, token) {
    const headers = {
      'Authorization': `Bearer ${token}`
    };

    return this.request('/stories', {
      method: 'POST',
      headers,
      body: storyData
    });
  }

  // Tambah cerita tanpa login (guest)
  async addStoryGuest(storyData) {
    return this.request('/stories/guest', {
      method: 'POST',
      body: storyData
    });
  }

  // 🔔 Web Push Notification
  async subscribeNotification(subscriptionData, token) {
    return this.request('/notifications/subscribe', {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(subscriptionData)
    });
  }

  async unsubscribeNotification(subscriptionData, token) {
    return this.request('/notifications/subscribe', {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(subscriptionData)
    });
  }

  // ✅ Validasi response (opsional)
  validateResponse(response) {
    if (!response || response.error) {
      throw new Error(response?.message || 'Invalid response from server');
    }
    return response;
  }

  // ⚠️ Penanganan error jaringan (opsional)
  async handleNetworkError(error) {
    if (!navigator.onLine) {
      throw new Error('Tidak ada koneksi internet. Periksa koneksi Anda.');
    }

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Gagal terhubung ke server. Coba lagi nanti.');
    }

    throw error;
  }

  // 🔁 Retry otomatis jika error (opsional)
  async requestWithRetry(endpoint, options = {}, maxRetries = 3) {
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.request(endpoint, options);
      } catch (error) {
        lastError = error;

        if (error.message.includes('HTTP 4')) {
          throw error; // Client error, jangan retry
        }

        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    }

    throw lastError;
  }
}
