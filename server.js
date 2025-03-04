const express = require('express');
const cors = require('cors');
const app = express();
const port = 8080;

app.use(cors());
app.use(express.json({limit: '5mb'}));

let messages = [];

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/messages', (req, res) => {
    res.json(messages);
});

app.post('/messages', (req, res) => {
    const newMessage = req.body;
    messages.push(newMessage);

    console.log('Pesan baru diterima:', newMessage);
    res.status(201).send('Pesan berhasil dikirim!');
});

app.listen(port, () => {
    console.log(`Server backend berjalan di port ${port}`);
});
