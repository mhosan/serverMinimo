const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const app = express();
const port = process.env.PORT || 4000

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'API Documentación',
            version: '1.0.0',
            description: 'Documentación de la API usando Swagger',
        },
        servers: [
            {
                url: `http://localhost:${port}`,
            },
        ],
    },
    apis: ['./index.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(express.json());

/**
 * @swagger
 * /:
 *   get:
 *     description: Obtener un mensaje de bienvenida
 *     responses:
 *       200:
 *         description: Mensaje de bienvenida
 */
app.get('/', (req, res) => {
    res.send('Hola soy un get');
});

/**
 * @swagger
 * /json:
 *   get:
 *     description: Obtener un mensaje en formato JSON
 *     responses:
 *       200:
 *         description: Mensaje en formato JSON
 */
app.get('/json', (req, res) => {
    res.json({ mensaje: 'Hola soy un get en formato JSON', tipo: 'JSON' });
});

/**
 * @swagger
 * /:
 *   post:
 *     description: Enviar texto en el cuerpo de la solicitud
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               texto:
 *                 type: string
 *     responses:
 *       200:
 *         description: Texto recibido
 */
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