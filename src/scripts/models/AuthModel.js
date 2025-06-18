import { ApiService } from '../services/ApiService.js';
import { StorageService } from '../services/StorageService.js';

export class AuthModel {
    constructor() {
        this.apiService = new ApiService();
        this.storageService = new StorageService();
    }

    async login(credentials) {
        try {
            const validationErrors = this.validateLoginData(credentials);
            if (validationErrors.length > 0) {
                throw new Error(validationErrors[0]);
            }

            const response = await this.apiService.login(credentials);
            const validatedResponse = this.apiService.validateResponse(response);

            if (validatedResponse.loginResult) {
                const { token, userId, name } = validatedResponse.loginResult;
                
                this.storageService.saveToken(token);
                this.storageService.saveUser({
                    userId,
                    name,
                    email: credentials.email
                });

                return {
                    success: true,
                    user: { userId, name, email: credentials.email },
                    message: 'Login berhasil!'
                };
            }

            throw new Error('Data login tidak valid.');
        } catch (error) {
            console.error('Login failed:', error);
            throw new Error(error.message || 'Login gagal. Periksa email dan password Anda.');
        }
    }

    async register(userData) {
        try {
            const validationErrors = this.validateRegisterData(userData);
            if (validationErrors.length > 0) {
                throw new Error(validationErrors[0]);
            }

            const response = await this.apiService.register(userData);
            const validatedResponse = this.apiService.validateResponse(response);

            return {
                success: true,
                message: validatedResponse.message || 'Registrasi berhasil! Silakan login.'
            };
        } catch (error) {
            console.error('Registration failed:', error);
            
            if (error.message.includes('email')) {
                throw new Error('Email sudah terdaftar. Gunakan email lain.');
            }
            
            throw new Error(error.message || 'Registrasi gagal. Silakan coba lagi.');
        }
    }

    logout() {
        try {
            this.storageService.clearAll();
            return {
                success: true,
                message: 'Logout berhasil!'
            };
        } catch (error) {
            console.error('Logout failed:', error);
            throw new Error('Logout gagal.');
        }
    }

    getCurrentUser() {
        return this.storageService.getUser();
    }

    isAuthenticated() {
        return this.storageService.isAuthenticated();
    }

    getAuthToken() {
        return this.storageService.getToken();
    }

    validateLoginData(credentials) {
        const errors = [];

        if (!credentials.email || !credentials.email.trim()) {
            errors.push('Email wajib diisi.');
        } else if (!this.isValidEmail(credentials.email)) {
            errors.push('Format email tidak valid.');
        }

        if (!credentials.password || !credentials.password.trim()) {
            errors.push('Password wajib diisi.');
        } else if (credentials.password.length < 8) {
            errors.push('Password minimal 8 karakter.');
        }

        return errors;
    }

    validateRegisterData(userData) {
        const errors = [];

        if (!userData.name || !userData.name.trim()) {
            errors.push('Nama wajib diisi.');
        } else if (userData.name.trim().length < 2) {
            errors.push('Nama minimal 2 karakter.');
        }

        if (!userData.email || !userData.email.trim()) {
            errors.push('Email wajib diisi.');
        } else if (!this.isValidEmail(userData.email)) {
            errors.push('Format email tidak valid.');
        }

        if (!userData.password || !userData.password.trim()) {
            errors.push('Password wajib diisi.');
        } else {
            const passwordErrors = this.validatePassword(userData.password);
            errors.push(...passwordErrors);
        }

        return errors;
    }

    validatePassword(password) {
        const errors = [];

        if (password.length < 8) {
            errors.push('Password minimal 8 karakter.');
        }

        if (!/(?=.*[a-z])/.test(password)) {
            errors.push('Password harus mengandung huruf kecil.');
        }

        if (!/(?=.*[A-Z])/.test(password)) {
            errors.push('Password harus mengandung huruf besar.');
        }

        if (!/(?=.*\d)/.test(password)) {
            errors.push('Password harus mengandung angka.');
        }

        return errors;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}