const express = require('express');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const cors = require('cors');

// Load environment variables based on NODE_ENV
const dotenv = require('dotenv');
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

const app = express();
const port = process.env.PORT || 4000;

// Configurar morgan primero para registrar todas las solicitudes
app.use(morgan('dev'));

// Server URL is now taken directly from environment variables
const serverUrl = process.env.NODE_ENV === 'production'
    ? process.env.SERVER_URL
    : `http://localhost:${port}`;

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'MHosan server mínimo API Documentación',
            version: '1.0.0',
            description: 'Documentación de la API',
        },
        servers: [
            {
                url: serverUrl,
                description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
            },
        ],
    },
    apis: ['./index.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Importar rutas
const routes = require('./routes');

app.use(cors());
app.use(express.json());

// Usar rutas
app.use('/api', routes);

if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Servidor escuchando en http://localhost:${port}`);
    });
}
module.exports = app;