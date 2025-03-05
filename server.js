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
const mongoUri = 'mongodb+srv://username:password@your-cluster.mongodb.net/your-database';

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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.listen(port, () => {
    console.log(`Server backend berjalan di port ${port}`);
});
