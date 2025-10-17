class ImageEditor {
    constructor() {
        this.originalImage = null;
        this.processedImage = null;
        this.aspectRatio = 1;
        
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        // टूल बटन
        this.toolButtons = document.querySelectorAll('.tool-btn');
        this.toolSections = document.querySelectorAll('.tool-section');
        
        // अपलोड एरिया
        this.uploadArea = document.getElementById('uploadArea');
        this.uploadBox = document.getElementById('uploadBox');
        this.fileInput = document.getElementById('fileInput');
        
        // कंट्रोल्स
        this.widthInput = document.getElementById('widthInput');
        this.heightInput = document.getElementById('heightInput');
        this.aspectRatioCheckbox = document.getElementById('aspectRatio');
        this.formatSelect = document.getElementById('formatSelect');
        
        // एक्शन बटन
        this.resizeBtn = document.getElementById('resizeBtn');
        this.convertBtn = document.getElementById('convertBtn');
        this.removeBgBtn = document.getElementById('removeBgBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        
        // कैनवास
        this.originalCanvas = document.getElementById('originalCanvas');
        this.processedCanvas = document.getElementById('processedCanvas');
        this.originalCtx = this.originalCanvas.getContext('2d');
        this.processedCtx = this.processedCanvas.getContext('2d');
        
        // रिजल्ट एरिया
        this.resultArea = document.getElementById('resultArea');
    }

    bindEvents() {
        // टूल स्विचिंग
        this.toolButtons.forEach(btn => {
            btn.addEventListener('click', () => this.switchTool(btn.dataset.tool));
        });

        // फाइल अपलोड
        this.uploadBox.addEventListener('click', () => this.fileInput.click());
        this.uploadBox.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadBox.addEventListener('drop', (e) => this.handleDrop(e));
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // रीसाइज़ कंट्रोल्स
        this.widthInput.addEventListener('input', () => this.handleResizeInput('width'));
        this.heightInput.addEventListener('input', () => this.handleResizeInput('height'));

        // एक्शन बटन
        this.resizeBtn.addEventListener('click', () => this.resizeImage());
        this.convertBtn.addEventListener('click', () => this.convertFormat());
        this.removeBgBtn.addEventListener('click', () => this.removeBackground());
        this.downloadBtn.addEventListener('click', () => this.downloadImage());
    }

    switchTool(tool) {
        // एक्टिव बटन अपडेट करें
        this.toolButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tool="${tool}"]`).classList.add('active');

        // एक्टिव सेक्शन अपडेट करें
        this.toolSections.forEach(section => section.classList.remove('active'));
        document.getElementById(`${tool}Section`).classList.add('active');
    }

    handleDragOver(e) {
        e.preventDefault();
        this.uploadBox.style.background = '#d4edda';
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadBox.style.background = '#f8f9fa';
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.loadImage(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.loadImage(file);
        }
    }

    loadImage(file) {
        if (!file.type.match('image.*')) {
            alert('कृपया सिर्फ इमेज फाइलें अपलोड करें!');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.originalImage = new Image();
            this.originalImage.onload = () => {
                this.displayOriginalImage();
                this.uploadBox.style.display = 'none';
                this.resultArea.style.display = 'block';
            };
            this.originalImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    displayOriginalImage() {
        // ओरिजिनल इमेज दिखाएं
        this.originalCanvas.width = Math.min(this.originalImage.width, 400);
        this.originalCanvas.height = (this.originalImage.height / this.originalImage.width) * this.originalCanvas.width;
        
        this.originalCtx.clearRect(0, 0, this.originalCanvas.width, this.originalCanvas.height);
        this.originalCtx.drawImage(this.originalImage, 0, 0, this.originalCanvas.width, this.originalCanvas.height);

        // डिफॉल्ट वैल्यू सेट करें
        this.widthInput.value = this.originalImage.width;
        this.heightInput.value = this.originalImage.height;
        this.aspectRatio = this.originalImage.width / this.originalImage.height;

        // प्रोसेस्ड इमेज भी दिखाएं
        this.displayProcessedImage();
    }

    displayProcessedImage() {
        this.processedCanvas.width = this.originalCanvas.width;
        this.processedCanvas.height = this.originalCanvas.height;
        
        this.processedCtx.clearRect(0, 0, this.processedCanvas.width, this.processedCanvas.height);
        this.processedCtx.drawImage(this.originalImage, 0, 0, this.processedCanvas.width, this.processedCanvas.height);
    }

    handleResizeInput(type) {
        if (!this.aspectRatioCheckbox.checked || !this.originalImage) return;

        if (type === 'width') {
            const newWidth = parseInt(this.widthInput.value);
            const newHeight = Math.round(newWidth / this.aspectRatio);
            this.heightInput.value = newHeight;
        } else {
            const newHeight = parseInt(this.heightInput.value);
            const newWidth = Math.round(newHeight * this.aspectRatio);
            this.widthInput.value = newWidth;
        }
    }

    resizeImage() {
        if (!this.originalImage) {
            alert('कृपया पहले एक इमेज अपलोड करें!');
            return;
        }

        const newWidth = parseInt(this.widthInput.value);
        const newHeight = parseInt(this.heightInput.value);

        // नया कैनवास बनाएं
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCanvas.width = newWidth;
        tempCanvas.height = newHeight;

        // इमेज रीसाइज़ करें
        tempCtx.drawImage(this.originalImage, 0, 0, newWidth, newHeight);

        // रिजल्ट दिखाएं
        this.processedImage = new Image();
        this.processedImage.onload = () => {
            this.processedCanvas.width = Math.min(newWidth, 400);
            this.processedCanvas.height = (newHeight / newWidth) * this.processedCanvas.width;
            
            this.processedCtx.clearRect(0, 0, this.processedCanvas.width, this.processedCanvas.height);
            this.processedCtx.drawImage(this.processedImage, 0, 0, this.processedCanvas.width, this.processedCanvas.height);
        };
        this.processedImage.src = tempCanvas.toDataURL();
    }

    convertFormat() {
        if (!this.originalImage) {
            alert('कृपया पहले एक इमेज अपलोड करें!');
            return;
        }

        const format = this.formatSelect.value;
        const mimeType = `image/${format}`;

        // कन्वर्ट करें
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCanvas.width = this.originalImage.width;
        tempCanvas.height = this.originalImage.height;
        tempCtx.drawImage(this.originalImage, 0, 0);

        // रिजल्ट दिखाएं
        this.processedImage = new Image();
        this.processedImage.onload = () => {
            this.processedCanvas.width = this.originalCanvas.width;
            this.processedCanvas.height = this.originalCanvas.height;
            
            this.processedCtx.clearRect(0, 0, this.processedCanvas.width, this.processedCanvas.height);
            this.processedCtx.drawImage(this.processedImage, 0, 0, this.processedCanvas.width, this.processedCanvas.height);
        };
        this.processedImage.src = tempCanvas.toDataURL(mimeType);
    }

    removeBackground() {
        if (!this.originalImage) {
            alert('कृपया पहले एक इमेज अपलोड करें!');
            return;
        }

        // यह एक बेसिक बैकग्राउंड रिमूवल है
        // प्रोडक्शन के लिए आप AI-बेस्ड सर्विसेज का उपयोग कर सकते हैं
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCanvas.width = this.originalImage.width;
        tempCanvas.height = this.originalImage.height;

        // इमेज ड्रा करें
        tempCtx.drawImage(this.originalImage, 0, 0);

        // सिंपल कलर-बेस्ड बैकग्राउंड रिमूवल
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;

        // सैंपल: कॉर्नर पिक्सेल को बैकग्राउंड मानें
        const backgroundR = data[0];
        const backgroundG = data[1];
        const backgroundB = data[2];

        // सिमिलर कलर वाले पिक्सेल को ट्रांसपेरेंट करें
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // कलर डिफरेंस कैलकुलेट करें
            const diff = Math.abs(r - backgroundR) + Math.abs(g - backgroundG) + Math.abs(b - backgroundB);
            
            if (diff < 100) { // थ्रेशोल्ड
                data[i + 3] = 0; // अल्फा चैनल सेट करें (ट्रांसपेरेंट)
            }
        }

        tempCtx.putImageData(imageData, 0, 0);

        // रिजल्ट दिखाएं
        this.processedImage = new Image();
        this.processedImage.onload = () => {
            this.processedCanvas.width = this.originalCanvas.width;
            this.processedCanvas.height = this.originalCanvas.height;
            
            this.processedCtx.clearRect(0, 0, this.processedCanvas.width, this.processedCanvas.height);
            this.processedCtx.drawImage(this.processedImage, 0, 0, this.processedCanvas.width, this.processedCanvas.height);
        };
        this.processedImage.src = tempCanvas.toDataURL('image/png');
    }

    downloadImage() {
        if (!this.processedImage) {
            alert('कोई प्रोसेस्ड इमेज नहीं है!');
            return;
        }

        const link = document.createElement('a');
        link.download = `edited-image-${Date.now()}.png`;
        link.href = this.processedImage.src;
        link.click();
    }
}

// ऐप इनिशियलाइज़ करें
document.addEventListener('DOMContentLoaded', () => {
    new ImageEditor();
});
