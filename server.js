// Memanggil semua paket yang kita butuhkan
require('dotenv').config();
const express = require('express');
const admin = require('firebase-admin');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const cors = require('cors');

// --- KONFIGURASI ---
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = multer({ storage: multer.memoryStorage() });
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// --- API ENDPOINTS ---

// 1. MENGAMBIL SEMUA menu
app.get('/api/menus', async (req, res) => {
    try {
        const snapshot = await db.collection('menus').get();
        const menus = [];
        snapshot.forEach(doc => menus.push({ id: doc.id, ...doc.data() }));
        res.status(200).json(menus);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// 2. MENGAMBIL SATU menu berdasarkan ID (INI YANG HILANG DARI SERVER LAMA ANDA)
app.get('/api/menus/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await db.collection('menus').doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ message: 'Menu tidak ditemukan' });
        }
        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// 3. MENAMBAH menu baru
app.post('/api/menus/add', upload.single('menuImage'), async (req, res) => {
    try {
        const { name, price, category } = req.body;
        if (!name || !price || !req.file || !category) return res.status(400).json({ message: 'Semua field harus diisi.' });
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({ folder: "dapur-mama" }, (err, result) => {
                if (err) reject(err); else resolve(result);
            });
            uploadStream.end(req.file.buffer);
        });
        const newMenu = { name, price: Number(price), imageUrl: uploadResult.secure_url, category };
        const docRef = await db.collection('menus').add(newMenu);
        res.status(201).json({ id: docRef.id, ...newMenu });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// 4. MEMPERBARUI (UPDATE) menu
app.put('/api/menus/update/:id', upload.single('menuImage'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, category } = req.body;
        const updatedData = { name, price: Number(price), category };
        if (req.file) {
            const uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream({ folder: "dapur-mama" }, (err, result) => {
                    if (err) reject(err); else resolve(result);
                });
                uploadStream.end(req.file.buffer);
            });
            updatedData.imageUrl = uploadResult.secure_url;
        }
        await db.collection('menus').doc(id).update(updatedData);
        res.status(200).json({ message: 'Menu berhasil diperbarui' });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// 5. MENGHAPUS menu
app.delete('/api/menus/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('menus').doc(id).delete();
        res.status(200).json({ message: 'Menu berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// --- MENJALANKAN SERVER ---
app.listen(PORT, () => {
  console.log(`✅ Server DAPUR MAMA berhasil berjalan di http://localhost:${PORT}`);
});