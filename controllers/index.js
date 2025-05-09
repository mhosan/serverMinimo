// controllers/index.js

// GET /
exports.getWelcome = (req, res) => {
    res.send('Hola soy un get');
};

// GET /json
exports.getJson = (req, res) => {
    res.json({ mensaje: 'Hola soy un get en formato JSON', tipo: 'JSON' });
};

// POST /
exports.postText = (req, res) => {
    const { texto } = req.body;
    res.send(texto);
};

// PUT /
exports.putWelcome = (req, res) => {
    res.send('Hola, soy un put');
};

// DELETE /
exports.deleteWelcome = (req, res) => {
    res.send('Hola soy un delete');
};
