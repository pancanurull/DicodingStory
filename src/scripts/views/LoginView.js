// views/LoginView.js
import { AuthModel } from '../models/AuthModel.js';
import { LoginPresenter } from '../presenters/LoginPresenter.js';

export class LoginView {
    constructor() {
        this.model = new AuthModel();
        this.presenter = new LoginPresenter(this.model, this);
    }

    render() {
        this.initLoginForm();
        this.initRegisterForm();
    }

    initLoginForm() {
        const loginForm = document.getElementById('login-form');
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin();
        });
    }

    initRegisterForm() {
        const registerForm = document.getElementById('register-form');
        if (!registerForm) return; // Hindari error jika form belum ada
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleRegister();
        });
    }

    async handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        await this.presenter.loginUser({ email, password });
    }

    async handleRegister() {
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        
        await this.presenter.registerUser({ name, email, password });
    }

    showLoginLoading() {
        const loginBtn = document.getElementById('login-button');
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Login</span>';
    }

    hideLoginLoading() {
        const loginBtn = document.getElementById('login-button');
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt" aria-hidden="true"></i> <span>Login</span>';
    }

    showRegisterLoading() {
        const registerBtn = document.getElementById('register-button');
        registerBtn.disabled = true;
        registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mendaftar...';
    }

    hideRegisterLoading() {
        const registerBtn = document.getElementById('register-button');
        registerBtn.disabled = false;
        registerBtn.innerHTML = '<i class="fas fa-user-plus" aria-hidden="true"></i> Daftar';
    }

    showLoginError(message) {
        const loginForm = document.getElementById('login-form');
        let errorDiv = loginForm.querySelector('.error-message');
        
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            loginForm.prepend(errorDiv);
        }
        
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <p>${message || 'Login gagal. Periksa email dan password Anda.'}</p>
        `;
    }

    showRegisterError(message) {
        const registerForm = document.getElementById('register-form');
        let errorDiv = registerForm.querySelector('.error-message');
        
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            registerForm.prepend(errorDiv);
        }
        
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <p>${message || 'Registrasi gagal. Silakan coba lagi.'}</p>
        `;
    }

    showRegisterSuccess(message) {
        const registerForm = document.getElementById('register-form');
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <p>${message || 'Registrasi berhasil! Silakan login.'}</p>
        `;
        registerForm.prepend(successDiv);
        
        // Auto remove message after 5 seconds
        setTimeout(() => {
            successDiv.remove();
        }, 5000);
    }

    navigateToStories() {
        window.location.hash = 'stories';
    }

    showRegisterForm() {
        document.getElementById('register-section').style.display = 'block';
    }

    hideRegisterForm() {
        document.getElementById('register-section').style.display = 'none';
    }
}