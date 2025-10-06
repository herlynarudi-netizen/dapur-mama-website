const API_URL = 'https://1707ca42-e4f6-47e5-9b4e-7a081dd0b4bd-00-ybr3codhkeiw.pike.replit.dev/api';

// Elemen Form Tambah
const addForm = document.getElementById('add-menu-form');
const statusMessage = document.getElementById('status');
const menuListContainer = document.getElementById('menu-list');

// Elemen Modal Edit
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-menu-form');
const closeModalBtn = document.querySelector('.close-btn');

// --- EVENT LISTENERS ---
if (addForm) {
    addForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        statusMessage.textContent = 'Menyimpan...';
        const formData = new FormData(addForm);
        try {
            const response = await fetch(`${API_URL}/menus/add`, { method: 'POST', body: formData });
            if (!response.ok) throw new Error('Gagal menambah menu.');
            statusMessage.textContent = 'Menu berhasil ditambahkan!';
            addForm.reset();
            loadMenus();
        } catch (error) {
            statusMessage.textContent = `Error: ${error.message}`;
        }
    });
}

if (editForm) {
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-id').value;
        const formData = new FormData();
        formData.append('name', document.getElementById('edit-name').value);
        formData.append('price', document.getElementById('edit-price').value);
        formData.append('category', document.getElementById('edit-category').value);
        const imageFile = document.getElementById('edit-menuImage').files[0];
        if (imageFile) {
            formData.append('menuImage', imageFile);
        }
        try {
            const response = await fetch(`${API_URL}/menus/update/${id}`, { method: 'PUT', body: formData });
            if (!response.ok) throw new Error('Gagal memperbarui menu.');
            alert('Menu berhasil diperbarui!');
            editModal.style.display = 'none';
            loadMenus();
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    });
}

if (closeModalBtn) {
    closeModalBtn.onclick = () => editModal.style.display = 'none';
}
window.onclick = (e) => {
    if (e.target == editModal) {
        editModal.style.display = 'none';
    }
};

// --- FUNGSI-FUNGSI ---
async function loadMenus() {
    if (!menuListContainer) return;
    try {
        const response = await fetch(`${API_URL}/menus`);
        const menus = await response.json();
        menuListContainer.innerHTML = '';
        menus.forEach(menu => {
            menuListContainer.innerHTML += `
                <div class="menu-list-item">
                    <img src="${menu.imageUrl}" alt="${menu.name}">
                    <p>${menu.name} - (${menu.category})</p>
                    <button class="btn btn-action edit-btn" onclick="openEditModal('${menu.id}')">Edit</button>
                    <button class="btn btn-action delete-btn" onclick="deleteMenu('${menu.id}')">Hapus</button>
                </div>
            `;
        });
    } catch (error) {
        menuListContainer.innerHTML = '<p style="color:red;">Gagal memuat daftar menu.</p>';
    }
}

async function openEditModal(id) {
    try {
        const response = await fetch(`${API_URL}/menus/${id}`);
        if (!response.ok) throw new Error('Gagal mengambil detail menu.');
        const menu = await response.json();
        document.getElementById('edit-id').value = menu.id;
        document.getElementById('edit-name').value = menu.name;
        document.getElementById('edit-price').value = menu.price;
        document.getElementById('edit-category').value = menu.category;
        editModal.style.display = 'flex';
    } catch (error) {
        alert('Gagal mengambil detail menu.');
    }
}

async function deleteMenu(id) {
    if (!confirm('Anda yakin ingin menghapus menu ini?')) return;
    try {
        const response = await fetch(`${API_URL}/menus/delete/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Gagal menghapus menu.');
        alert('Menu berhasil dihapus!');
        loadMenus();
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

document.addEventListener('DOMContentLoaded', loadMenus);