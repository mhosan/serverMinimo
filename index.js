const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hola soy un get');
});

app.get('/json', (req, res) => {
    res.json({ mensaje: 'Hola soy un get en formato JSON', tipo: 'JSON' });
});

app.post('/', (req, res) => {
    const { texto } = req.body;
    res.send(texto);
});

app.put('/', (req, res) => {
    res.send('Hola, soy un put');
});

app.delete('/', (req, res) => {
    res.send('Hola soy un delete');
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});