class DataTableManager {
    constructor() {
        this.STORAGE_KEY = 'portfolioTableData';
        this.initialData = [
            { id: 1, name: "Алексей Петров", email: "alex@example.com", phone: "+7 (999) 123-45-67" },
            { id: 2, name: "Мария Иванова", email: "maria@example.ru", phone: "+7 (999) 987-65-43" },
            { id: 3, name: "Иван Сидоров", email: "ivan@example.com", phone: "+7 (999) 555-55-55" }
        ];
        this.loadData();
        this.initTable();
    }
    
    loadData() {
        const storedData = localStorage.getItem(this.STORAGE_KEY);
        
        if (storedData) {
            this.data = JSON.parse(storedData);
        } else {
            this.data = [...this.initialData];
            this.saveData();
        }
    }
    
    saveData() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    }
    
    initTable() {
        const tableBody = document.getElementById('tableBody');
        tableBody.innerHTML = '';
        
        this.data.forEach(item => {
            this.addRowToTable(item);
        });
        
        this.updateRecordCount();
    }
    
    addRowToTable(item) {
        const tableBody = document.getElementById('tableBody');
        const row = document.createElement('tr');
        row.style.animation = 'fadeIn 0.5s ease-out';
        
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>${item.email}</td>
            <td>${item.phone}</td>
            <td>
                <button class="btn btn-danger delete-btn" data-id="${item.id}">
                    <i class="fas fa-trash"></i> Удалить
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
        
        const deleteBtn = row.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            const id = parseInt(e.target.closest('.delete-btn').dataset.id);
            this.deleteRecord(id);
        });
    }
    
    addRecord(name, email, phone) {
        const newId = this.data.length > 0 ? Math.max(...this.data.map(item => item.id)) + 1 : 1;
        
        const newRecord = {
            id: newId,
            name: name,
            email: email,
            phone: phone
        };
        
        this.data.push(newRecord);
        this.saveData();
        this.addRowToTable(newRecord);
        this.updateRecordCount();
    }
    
    deleteRecord(id) {
        const index = this.data.findIndex(item => item.id === id);
        
        if (index !== -1) {
            this.data.splice(index, 1);
            this.saveData();
            this.initTable();
            this.showNotification('Запись успешно удалена!', 'success');
        }
    }
    
    updateRecordCount() {
        const recordCount = document.getElementById('recordCount');
        recordCount.textContent = this.data.length;
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background-color: ${type === 'success' ? '#2ecc71' : '#3498db'};
            color: white;
            border-radius: 5px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: fadeIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'fadeIn 0.3s ease-out reverse';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

class FormValidator {
    constructor() {
        this.form = document.getElementById('dataForm');
        this.nameInput = document.getElementById('name');
        this.emailInput = document.getElementById('email');
        this.phoneInput = document.getElementById('phone');
        this.nameError = document.getElementById('nameError');
        this.emailError = document.getElementById('emailError');
        this.phoneError = document.getElementById('phoneError');
        this.initEventListeners();
    }
    
    initEventListeners() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.validateForm();
        });
        
        this.nameInput.addEventListener('input', () => this.clearError(this.nameInput, this.nameError));
        this.emailInput.addEventListener('input', () => this.clearError(this.emailInput, this.emailError));
        this.phoneInput.addEventListener('input', () => this.clearError(this.phoneInput, this.phoneError));
    }
    
    clearError(input, errorElement) {
        input.parentElement.classList.remove('error');
        errorElement.textContent = '';
        errorElement.innerHTML = '';
    }
    
    showError(input, errorElement, message) {
        input.parentElement.classList.add('error');
        errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    }
    
    validateForm() {
        const name = this.nameInput.value.trim();
        const email = this.emailInput.value.trim();
        const phone = this.phoneInput.value.trim();
        
        let isValid = true;
        
        if (!name) {
            this.showError(this.nameInput, this.nameError, 'Имя обязательно для заполнения');
            isValid = false;
        }
        
        if (!email) {
            this.showError(this.emailInput, this.emailError, 'Email обязателен для заполнения');
            isValid = false;
        } else if (!this.isValidEmail(email)) {
            this.showError(this.emailInput, this.emailError, 'Введите корректный email адрес');
            isValid = false;
        }
        
        if (!phone) {
            this.showError(this.phoneInput, this.phoneError, 'Телефон обязателен для заполнения');
            isValid = false;
        } else if (!this.isValidPhone(phone)) {
            this.showError(this.phoneInput, this.phoneError, 'Введите корректный номер телефона');
            isValid = false;
        }
        
        if (isValid) {
            window.dataTableManager.addRecord(name, email, phone);
            this.resetForm();
            window.dataTableManager.showNotification('Запись успешно добавлена!', 'success');
        }
        
        return isValid;
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    isValidPhone(phone) {
        const phoneRegex = /^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
        return phoneRegex.test(phone);
    }
    
    resetForm() {
        this.form.reset();
        this.clearError(this.nameInput, this.nameError);
        this.clearError(this.emailInput, this.emailError);
        this.clearError(this.phoneInput, this.phoneError);
    }
}

class CustomSlider {
    constructor() {
        this.slider = document.getElementById('slider');
        this.slides = document.querySelectorAll('.slide');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.indicatorsContainer = document.getElementById('sliderIndicators');
        this.autoPlayBtn = document.getElementById('autoPlayBtn');
        this.timerValue = document.getElementById('timerValue');
        this.currentSlide = 0;
        this.totalSlides = this.slides.length;
        this.isAutoPlay = true;
        this.autoPlayInterval = null;
        this.autoPlayDelay = 5000;
        this.initSlider();
    }
    
    initSlider() {
        this.initIndicators();
        this.updateSlider();
        this.initEventListeners();
        this.startAutoPlay();
    }
    
    initIndicators() {
        this.indicatorsContainer.innerHTML = '';
        
        for (let i = 0; i < this.totalSlides; i++) {
            const indicator = document.createElement('div');
            indicator.className = 'indicator';
            if (i === 0) indicator.classList.add('active');
            
            indicator.addEventListener('click', () => {
                this.goToSlide(i);
            });
            
            this.indicatorsContainer.appendChild(indicator);
        }
    }
    
    initEventListeners() {
        this.prevBtn.addEventListener('click', () => {
            this.prevSlide();
            this.restartAutoPlay();
        });
        
        this.nextBtn.addEventListener('click', () => {
            this.nextSlide();
            this.restartAutoPlay();
        });
        
        this.autoPlayBtn.addEventListener('click', () => {
            this.toggleAutoPlay();
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prevSlide();
                this.restartAutoPlay();
            } else if (e.key === 'ArrowRight') {
                this.nextSlide();
                this.restartAutoPlay();
            } else if (e.key === ' ') {
                e.preventDefault();
                this.toggleAutoPlay();
            }
        });
    }
    
    prevSlide() {
        this.currentSlide = this.currentSlide === 0 ? this.totalSlides - 1 : this.currentSlide - 1;
        this.updateSlider();
    }
    
    nextSlide() {
        this.currentSlide = this.currentSlide === this.totalSlides - 1 ? 0 : this.currentSlide + 1;
        this.updateSlider();
    }
    
    goToSlide(slideIndex) {
        if (slideIndex >= 0 && slideIndex < this.totalSlides) {
            this.currentSlide = slideIndex;
            this.updateSlider();
            this.restartAutoPlay();
        }
    }
    
    updateSlider() {
        const offset = -this.currentSlide * 100;
        this.slider.style.transform = `translateX(${offset}%)`;
        
        this.slides.forEach((slide, index) => {
            if (index === this.currentSlide) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });
        
        const indicators = document.querySelectorAll('.indicator');
        indicators.forEach((indicator, index) => {
            if (index === this.currentSlide) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }
    
    startAutoPlay() {
        if (this.isAutoPlay) {
            this.autoPlayInterval = setInterval(() => {
                this.nextSlide();
            }, this.autoPlayDelay);
            
            this.autoPlayBtn.innerHTML = '<i class="fas fa-pause"></i> Пауза';
            this.autoPlayBtn.classList.add('active');
        }
    }
    
    stopAutoPlay() {
        clearInterval(this.autoPlayInterval);
        this.autoPlayBtn.innerHTML = '<i class="fas fa-play"></i> Автовоспроизведение';
        this.autoPlayBtn.classList.remove('active');
    }
    
    toggleAutoPlay() {
        this.isAutoPlay = !this.isAutoPlay;
        
        if (this.isAutoPlay) {
            this.startAutoPlay();
        } else {
            this.stopAutoPlay();
        }
    }
    
    restartAutoPlay() {
        if (this.isAutoPlay) {
            this.stopAutoPlay();
            this.startAutoPlay();
        }
    }
}
