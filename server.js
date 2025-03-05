require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080; // Gunakan environment variable untuk port

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Koneksi ke MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://salman:ahmad@cluster0.gjslz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; // Gunakan environment variable atau localhost

mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Terhubung ke MongoDB'))
  .catch(err => console.error('Gagal terhubung ke MongoDB:', err));

// Skema Mongoose untuk pesan
const messageSchema = new mongoose.Schema({
    id: String,
    username: String,
    text: String,
    image: String,
    timestamp: String,
    replyTo: String
});

const Message = mongoose.model('Message', messageSchema);

// Endpoint untuk mendapatkan semua pesan
app.get('/messages', async (req, res) => {
    try {
        const messages = await Message.find().sort({ timestamp: 1 }); // Urutkan berdasarkan waktu pengiriman
        res.json(messages);
    } catch (err) {
        console.error('Gagal mendapatkan pesan:', err);
        res.status(500).send('Gagal mendapatkan pesan');
    }
});

// Endpoint untuk mengirim pesan baru
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

// Endpoint untuk membersihkan semua pesan (hanya untuk admin)
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

// Serve file statis (index.html dan admin.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.listen(port, () => {
    console.log(`Server backend berjalan di port ${port}`);
});
