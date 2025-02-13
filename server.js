const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Status Aplikasi
let appStatus = "Sedang Berjalan";

// Simpan API Keys (sementara, jangan lakukan ini di produksi!)
const apiKeys = new Map();

// Fungsi untuk menghasilkan API key acak (6 digit)
function generateApiKey() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let apiKey = '';
    for (let i = 0; i < 6; i++) {
        apiKey += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return apiKey;
}

// Fungsi middleware untuk validasi API key
const apiKeyValidator = (req, res, next) => {
    const apiKey = req.query.apikey;
    const userId = req.headers['user-id']; // Ambil User ID dari Header

    if (!userId) {
        return res.status(400).json({
            creator: "WANZOFC TECH",
            result: false,
            message: "User ID dibutuhkan pada header 'User-Id'.",
            status: appStatus
        });
    }

    if (!apiKey) {
        return res.status(401).json({
            creator: "WANZOFC TECH",
            result: false,
            message: "API key dibutuhkan. Sertakan parameter 'apikey' pada request Anda.",
            status: appStatus
        });
    }

    if (apiKeys.get(userId) !== apiKey) {
        return res.status(403).json({
            creator: "WANZOFC TECH",
            result: false,
            message: "API key tidak valid.",
            status: appStatus
        });
    }

    next(); // Lanjutkan ke handler berikutnya jika API key valid
};

// Endpoint Utama
app.get('/', (req, res) => {
    res.json({
        status: appStatus,
        message: "API is running. Akses /api/stalk/github?user={username}&apikey={apikey} untuk melakukan stalking GitHub."
    });
});

// Endpoint untuk mendapatkan API Key
app.get('/api/stalk/github', async (req, res) => {
    const userId = req.headers['user-id'];

    if (!userId) {
        return res.status(400).json({
            creator: "WANZOFC TECH",
            result: false,
            message: "User ID dibutuhkan pada header 'User-Id'.",
            status: appStatus
        });
    }

    // Cek apakah user sudah memiliki API key
    if (apiKeys.has(userId)) {
        return res.status(200).json({
            creator: "WANZOFC TECH",
            result: true,
            message: "API key sudah ada.",
            status: appStatus,
            apikey: apiKeys.get(userId)
        });
    }

    // Generate API key baru
    const newApiKey = generateApiKey();
    apiKeys.set(userId, newApiKey);

    res.status(201).json({
        creator: "WANZOFC TECH",
        result: true,
        message: "API key berhasil dibuat.",
        status: appStatus,
        apikey: newApiKey
    });
});

// Endpoint /api/stalk/github (dilindungi oleh API key)
app.get('/api/stalk/github/stalk', apiKeyValidator, async (req, res) => {
    const user = req.query.user;
    const userId = req.headers['user-id'];
    const apiKey = req.query.apikey;


    if (!user) {
        return res.status(400).json({
            creator: "WANZOFC TECH",
            result: false,
            message: "Tambahkan parameter 'user' (contoh: /api/stalk/github/stalk?user=username&apikey=apikey).",
            status: appStatus
        });
    }

    try {
        const { data } = await axios.get(`https://api.siputzx.my.id/api/stalk/github?user=${encodeURIComponent(user)}`);
        res.json({
            creator: "WANZOFC TECH",
            result: true,
            message: "GitHub Stalker",
            status: appStatus,
            apikey: apiKey,
            data: data
        });
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({
            creator: "WANZOFC TECH",
            result: false,
            message: "GitHub Stalker bermasalah. Periksa kembali username atau coba lagi nanti.",
            status: appStatus,
            apikey: apiKey,
            error: error.message
        });
    }
});

// Handle 404 errors
app.use((req, res, next) => {
    res.status(404).json({
        creator: "WANZOFC TECH",
        result: false,
        message: "Endpoint tidak ditemukan.",
        status: appStatus
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        creator: "WANZOFC TECH",
        result: false,
        message: "Terjadi kesalahan server.",
        status: appStatus,
        error: err.message
    });
});

// Jalankan Server
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
