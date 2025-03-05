require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Ganti URI koneksi MongoDB di sini (JANGAN LAKUKAN INI DALAM PRODUKSI!)
const mongoUri = 'mongodb+srv://zanssxploit:pISqUYgJJDfnLW9b@cluster0.fgram.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Terhubung ke MongoDB'))
  .catch(err => console.error('Gagal terhubung ke MongoDB:', err));

const messageSchema = new mongoose.Schema({
    id: String,
    username: String,
    text: String,
    image: String,
    timestamp: String,
    replyTo: String
});

const Message = mongoose.model('Message', messageSchema);

// Skema dan Model untuk Request
const requestSchema = new mongoose.Schema({
    nama: String,
    email: String,
    permintaan: String,
    timestamp: { type: Date, default: Date.now }
});
const Request = mongoose.model('Request', requestSchema);

app.get('/messages', async (req, res) => {
    try {
        const messages = await Message.find().sort({ timestamp: 1 });
        res.json(messages);
    } catch (err) {
        console.error('Gagal mendapatkan pesan:', err);
        res.status(500).send('Gagal mendapatkan pesan');
    }
});

app.post('/messages', async (req, res) => {
    const newMessage = new Message(req.body);
    try {
        await newMessage.save();
        console.log('Pesan baru disimpan:', newMessage);
        res.status(201).send('Pesan berhasil dikirim!');
    } catch (err) {
        console.error('Gagal menyimpan pesan:', err);
        res.status(500).send('Gagal menyimpan pesan');
    }
});

app.post('/admin/clear', async (req, res) => {
    try {
        await Message.deleteMany({});
        console.log('Chat cleared by admin');
        res.status(200).send('Chat cleared successfully.');
    } catch (err) {
        console.error('Gagal membersihkan chat:', err);
        res.status(500).send('Gagal membersihkan chat');
    }
});

// Endpoint untuk menerima request
app.post('/requests', async (req, res) => {
    try {
        // 1. Validasi data (Penting!)
        const { nama, email, permintaan } = req.body;

        if (!nama || !email || !permintaan) {
            return res.status(400).send('Semua field (nama, email, permintaan) harus diisi.');
        }

        // Validasi email (contoh sederhana)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).send('Format email tidak valid.');
        }

        // 2. Lakukan sesuatu dengan data yang diterima
        //    - Simpan ke database
        const newRequest = new Request({
            nama: nama,
            email: email,
            permintaan: permintaan
        });
        await newRequest.save();

        console.log('Permintaan baru diterima:', newRequest);

        // 3. Kirim respons ke client
        res.status(200).send('Permintaan berhasil dikirim!');

    } catch (err) {
        console.error('Gagal memproses permintaan:', err);
        res.status(500).send('Gagal memproses permintaan');
    }
});

// Endpoint untuk mendapatkan daftar request (untuk admin)
app.get('/admin/requests', async (req, res) => {
    try {
        const requests = await Request.find().sort({ timestamp: -1 }); // Ambil semua request, urutkan dari terbaru
        res.json(requests);
    } catch (err) {
        console.error('Gagal mendapatkan daftar permintaan:', err);
        res.status(500).send('Gagal mendapatkan daftar permintaan');
    }
});

// Endpoint untuk menghapus request (menandai selesai)
app.delete('/admin/requests/:id', async (req, res) => {
    try {
        const requestId = req.params.id;
        // Pastikan request ID valid (opsional)
        if (!mongoose.Types.ObjectId.isValid(requestId)) {
            return res.status(400).send('ID permintaan tidak valid.');
        }

        // Hapus request dari database
        const deletedRequest = await Request.findByIdAndDelete(requestId);

        // Jika request tidak ditemukan
        if (!deletedRequest) {
            return res.status(404).send('Permintaan tidak ditemukan.');
        }

        console.log(`Permintaan dengan ID ${requestId} dihapus.`);
        res.status(200).send('Permintaan berhasil dihapus.');
    } catch (err) {
        console.error('Gagal menghapus permintaan:', err);
        res.status(500).send('Gagal menghapus permintaan.');
    }
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.listen(port, () => {
    console.log(`Server backend berjalan di port ${port}`);
});
