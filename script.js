// --- Pengaturan Dasar ---
const WHATSAPP_NUMBER = '6281312357574';
const API_URL = '/api';
let cart = [];
let menuData = [];

// --- DOM Elements ---
const cartSidebar = document.getElementById('cart-sidebar');
const cartItemsContainer = document.getElementById('cart-items');
const cartCountSpan = document.getElementById('cart-count');
const cartTotalPriceSpan = document.getElementById('cart-total-price');
const latInput = document.getElementById('latitude');
const lonInput = document.getElementById('longitude');
const locationStatus = document.getElementById('location-status');

// --- FUNGSI UTAMA UNTUK MENGAMBIL & MENAMPILKAN MENU ---
async function fetchAndDisplayMenus() {
    try {
        const response = await fetch(API_URL + '/menus');
        if (!response.ok) throw new Error('Gagal mengambil data menu.');
        menuData = await response.json();

        const makananContainer = document.querySelector('#makanan .menu-grid');
        const minumanContainer = document.querySelector('#minuman .menu-grid');
        makananContainer.innerHTML = '';
        minumanContainer.innerHTML = '';

        menuData.forEach(item => {
            const menuCard = `
                <div class="menu-card">
                    <img src="${item.imageUrl}" alt="${item.name}" class="card-img">
                    <h4>${item.name}</h4>
                    <p class="price">${formatRupiah(item.price)}</p>
                    <button class="btn add-to-cart" onclick="addToCart('${item.id}')">Beli</button>
                </div>
            `;
            if (item.category === 'makanan') {
                makananContainer.innerHTML += menuCard;
            } else if (item.category === 'minuman') {
                minumanContainer.innerHTML += menuCard;
            }
        });
    } catch (error) {
        console.error("Terjadi kesalahan:", error);
        document.querySelector('#makanan .menu-grid').innerHTML = '<p style="text-align:center; color: red;">Gagal memuat menu.</p>';
    }
}

// --- FUNGSI KERANJANG ---
window.addToCart = function(itemId) {
    const itemToAdd = menuData.find(item => item.id === itemId);
    if (!itemToAdd) return;
    const existingItem = cart.find(cartItem => cartItem.id === itemId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...itemToAdd, quantity: 1 });
    }
    updateCartDisplay();
};

function updateCartDisplay() {
    if (!cartItemsContainer) return;
    cartItemsContainer.innerHTML = '';
    let totalPrice = 0;
    let totalItems = 0;
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align:center; color:#888;">Keranjang kosong.</p>';
    } else {
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            totalPrice += itemTotal;
            totalItems += item.quantity;
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <span class="cart-item-name">${item.name}</span>
                <div class="cart-item-controls">
                    <button onclick="changeQuantity('${item.id}', -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="changeQuantity('${item.id}', 1)">+</button>
                </div>
                <span class="cart-item-total">${formatRupiah(itemTotal)}</span>
            `;
            cartItemsContainer.appendChild(itemElement);
        });
    }
    cartTotalPriceSpan.textContent = formatRupiah(totalPrice);
    cartCountSpan.textContent = totalItems;
}

window.changeQuantity = function(itemId, delta) {
    const item = cart.find(i => i.id === itemId);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== itemId);
    }
    updateCartDisplay();
};

// --- FUNGSI INTERAKSI HALAMAN (LENGKAP) ---
window.toggleCart = function() {
    document.getElementById('cart-sidebar').classList.toggle('open');
};

window.toggleMainCategory = function(headerElement) {
    const sectionDiv = headerElement.closest('.menu-section');
    if (!sectionDiv) return;
    sectionDiv.classList.toggle('minimized-main');
    const icon = headerElement.querySelector('.toggle-main-icon');
    if (sectionDiv.classList.contains('minimized-main')) {
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
    } else {
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
    }
};

window.getGeolocation = function() {
    if (!locationStatus) return;
    locationStatus.textContent = 'Meminta akses lokasi...';
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                latInput.value = position.coords.latitude;
                lonInput.value = position.coords.longitude;
                locationStatus.textContent = 'Lokasi berhasil diambil.';
            },
            () => {
                locationStatus.textContent = 'Gagal mengambil lokasi.';
            }
        );
    } else {
        locationStatus.textContent = 'Browser tidak mendukung Geolocation.';
    }
};

window.sendOrderViaWhatsApp = function() {
    if (cart.length === 0) {
        alert('Keranjang Anda masih kosong.');
        return;
    }
    const customerName = document.getElementById('customer-name').value.trim();
    const customerAddress = document.getElementById('customer-address').value.trim();
    if (customerName === '' || customerAddress === '') {
        alert('Mohon isi Nama dan Alamat lengkap Anda.');
        return;
    }
    let orderText = "Halo DAPUR MAMA, saya ingin memesan:\n\n";
    let totalItemsPrice = 0;
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        totalItemsPrice += itemTotal;
        orderText += `${index + 1}. ${item.name} (x${item.quantity}) - ${formatRupiah(itemTotal)}\n`;
    });
    orderText += `\n*Total:* ${formatRupiah(totalItemsPrice)}`;
    orderText += `\n\n*Data Pemesan:*\nNama: ${customerName}\nAlamat: ${customerAddress}`;
    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(orderText)}`;
    window.open(whatsappURL, '_blank');
};

// --- FUNGSI SLIDER OTOMATIS (LENGKAP) ---
function initializeSlider() {
    const sliderWrapper = document.getElementById('slider-wrapper');
    const sliderDotsContainer = document.getElementById('slider-dots');
    if (!sliderWrapper) return;
    const slides = sliderWrapper.querySelectorAll('.slide');
    if (slides.length === 0) return;
    let currentSlide = 0;
    const totalSlides = slides.length;
    sliderWrapper.style.width = `${totalSlides * 100}%`;
    slides.forEach(slide => slide.style.width = `${100 / totalSlides}%`);
    function showSlide(index) {
        sliderWrapper.style.transform = `translateX(${-index * (100 / totalSlides)}%)`;
        updateDots(index);
    }
    function updateDots(index) {
        if (!sliderDotsContainer) return;
        const dots = sliderDotsContainer.querySelectorAll('.dot');
        dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    }
    if (sliderDotsContainer) {
        sliderDotsContainer.innerHTML = '';
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            dot.addEventListener('click', () => showSlide(i));
            sliderDotsContainer.appendChild(dot);
        }
    }
    showSlide(0);
    setInterval(() => {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    }, 3000);
}

// --- FUNGSI UTILITAS ---
function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
}

// --- INISIALISASI SAAT HALAMAN DIBUKA ---
document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayMenus();
    initializeSlider();
    updateCartDisplay();
});