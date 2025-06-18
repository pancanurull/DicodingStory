import { StoriesModel } from '../models/StoriesModel.js';
import { AddStoryPresenter } from '../presenters/AddStoryPresenter.js';
import { MapService } from '../services/MapService.js';

export class AddStoryView {
    constructor() {
        this.model = new StoriesModel();
        this.presenter = new AddStoryPresenter(this.model, this);
        this.mapService = new MapService('location-map');
        this.photoData = null;
        this.selectedLocation = null;
        this.stream = null;
        this.setupPageUnloadHandler();
    }

    setupPageUnloadHandler() {
        window.addEventListener('hashchange', () => {
            this.cleanupCamera();
        });
        window.addEventListener('beforeunload', () => this.cleanupCamera());
        window.addEventListener('pagehide', () => this.cleanupCamera());
    }

    cleanupCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
    }

    async render() {
        // Bersihkan konten sebelum render ulang untuk mencegah event handler submit dobel
        const container = document.getElementById('add-story-page');
        if (container) {
            container.innerHTML = `
                <form id="add-story-form">
                    <div>
                        <label for="story-description">Deskripsi</label>
                        <textarea id="story-description" required minlength="10" placeholder="Tulis cerita Anda..."></textarea>
                    </div>
                    <div>
                        <button type="button" id="start-camera">Gunakan Kamera</button>
                        <button type="button" id="choose-file">Pilih Foto</button>
                        <input type="file" id="file-input" accept="image/*" style="display:none" />
                    </div>
                    <div>
                        <video id="camera-preview" autoplay playsinline style="display:none;width:100%;max-width:300px;"></video>
                        <canvas id="captured-photo" style="display:none;width:100%;max-width:300px;"></canvas>
                        <img id="photo-preview" style="display:none;width:100%;max-width:300px;" />
                        <button type="button" id="capture-photo" style="display:none">Ambil Foto</button>
                        <button type="button" id="retake-photo" style="display:none">Ulangi Foto</button>
                    </div>
                    <div>
                        <label for="location-search">Pilih lokasimu sekarang</label>
                        <input type="text" id="location-search" placeholder="Cari lokasi..." style="width:100%;margin-bottom:8px;padding:8px;border-radius:8px;border:1px solid #eee;" />
                        <div id="selected-location"></div>
                        <div id="location-map" style="height:200px;margin-bottom:10px;"></div>
                    </div>
                    <button id="submit-story" type="submit">Kirim Story</button>
                </form>
            `;
        }

        this.initForm();
        this.initMap();
        this.initCamera();
        this.initLocationSearch(); // Tambahkan inisialisasi search bar lokasi
    }

    initForm() {
        const form = document.getElementById('add-story-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSubmit();
        });
    }

    initMap() {
        this.mapService.initMap([-6.2088, 106.8456], 10);
        this.mapService.map.on('click', (e) => {
            this.selectedLocation = e.latlng;
            document.getElementById('selected-location').textContent = 
                `Lokasi terpilih: ${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`;
            
            this.mapService.clearMarkers();
            this.mapService.addMarker(e.latlng, 'Lokasi cerita Anda');
        });
    }

    initCamera() {
        const startCameraBtn = document.getElementById('start-camera');
        const captureBtn = document.getElementById('capture-photo');
        const retakeBtn = document.getElementById('retake-photo');
        const chooseFileBtn = document.getElementById('choose-file');
        const fileInput = document.getElementById('file-input');
        const cameraPreview = document.getElementById('camera-preview');
        const capturedPhoto = document.getElementById('captured-photo');
        const photoPreview = document.getElementById('photo-preview');

        startCameraBtn.addEventListener('click', async () => {
            try {
                this.stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: 'environment' }, 
                    audio: false 
                });
                cameraPreview.srcObject = this.stream;
                cameraPreview.style.display = 'block';
                photoPreview.style.display = 'none';
                capturedPhoto.style.display = 'none';
                
                startCameraBtn.style.display = 'none';
                captureBtn.style.display = 'inline-block';
                chooseFileBtn.style.display = 'inline-block';
            } catch (err) {
                console.error('Error accessing camera:', err);
                this.showError('Tidak dapat mengakses kamera. Pastikan Anda memberikan izin.');
            }
        });

        captureBtn.addEventListener('click', () => {
            capturedPhoto.width = cameraPreview.videoWidth;
            capturedPhoto.height = cameraPreview.videoHeight;
            capturedPhoto.getContext('2d').drawImage(cameraPreview, 0, 0);
            
            capturedPhoto.toBlob((blob) => {
                this.photoData = new File([blob], 'story-photo.jpg', { type: 'image/jpeg' });
            }, 'image/jpeg', 0.8);
            
            capturedPhoto.style.display = 'block';
            cameraPreview.style.display = 'none';
            captureBtn.style.display = 'none';
            retakeBtn.style.display = 'inline-block';
        });

        retakeBtn.addEventListener('click', () => {
            capturedPhoto.style.display = 'none';
            cameraPreview.style.display = 'block';
            retakeBtn.style.display = 'none';
            captureBtn.style.display = 'inline-block';
            this.photoData = null;
        });

        chooseFileBtn.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                this.photoData = e.target.files[0];
                
                if (this.stream) {
                    this.stream.getTracks().forEach(track => track.stop());
                    this.stream = null;
                }
                
                const reader = new FileReader();
                reader.onload = (event) => {
                    photoPreview.src = event.target.result;
                    photoPreview.style.display = 'block';
                    cameraPreview.style.display = 'none';
                    capturedPhoto.style.display = 'none';
                    
                    startCameraBtn.style.display = 'inline-block';
                    captureBtn.style.display = 'none';
                    retakeBtn.style.display = 'inline-block';
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        });
    }

    initLocationSearch() {
        const searchInput = document.getElementById('location-search');
        const mapService = this.mapService;
        if (!searchInput || !mapService || !mapService.map) return;
        // Gunakan Nominatim API untuk geocoding
        let timeout = null;
        searchInput.addEventListener('input', function() {
            clearTimeout(timeout);
            const query = this.value.trim();
            if (query.length < 3) return;
            timeout = setTimeout(async () => {
                const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
                const res = await fetch(url);
                const data = await res.json();
                if (data && data.length > 0) {
                    const lat = parseFloat(data[0].lat);
                    const lon = parseFloat(data[0].lon);
                    mapService.map.setView([lat, lon], 14);
                    mapService.clearMarkers();
                    mapService.addMarker([lat, lon], 'Hasil pencarian');
                }
            }, 600);
        });
    }

    async handleSubmit() {
        const description = document.getElementById('story-description').value;
        
        if (!description || description.trim().length < 10) {
            this.showError('Deskripsi minimal 10 karakter');
            return;
        }
        
        if (!this.photoData) {
            this.showError('Foto wajib diupload');
            return;
        }

        const storyData = {
            description: description.trim(),
            photo: this.photoData,
            ...(this.selectedLocation && {
                lat: parseFloat(this.selectedLocation.lat).toFixed(6),
                lon: parseFloat(this.selectedLocation.lng).toFixed(6)
            })
        };
        
        await this.presenter.addNewStory(storyData);
    }

    showLoading() {
        const submitBtn = document.getElementById('submit-story');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
    }

    hideLoading() {
        const submitBtn = document.getElementById('submit-story');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane" aria-hidden="true"></i> Kirim Story';
    }

    showSuccess(message) {
        const form = document.getElementById('add-story-form');
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <p>${message || 'Story berhasil ditambahkan!'}</p>
        `;
        form.prepend(successDiv);
        
        this.resetForm();
        
        setTimeout(() => {
            successDiv.remove();
        }, 5000);
    }

    showError(message) {
        const form = document.getElementById('add-story-form');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <p>${message || 'Gagal menambahkan story. Silakan coba lagi.'}</p>
        `;
        form.prepend(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    resetForm() {
        document.getElementById('story-description').value = '';
        document.getElementById('selected-location').textContent = '';
        
        const cameraPreview = document.getElementById('camera-preview');
        const capturedPhoto = document.getElementById('captured-photo');
        const photoPreview = document.getElementById('photo-preview');
        
        cameraPreview.style.display = 'none';
        capturedPhoto.style.display = 'none';
        photoPreview.style.display = 'none';
        
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        document.getElementById('start-camera').style.display = 'inline-block';
        document.getElementById('capture-photo').style.display = 'none';
        document.getElementById('retake-photo').style.display = 'none';
        
        this.photoData = null;
        this.selectedLocation = null;
        
        this.mapService.clearMarkers();
    }
}