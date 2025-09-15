# Servidor Mínimo Node.js
## Utilizado en DatoUrbano.
Hosting
El hosteo es en render.com, logearse en Render con la cuenta de Google. Entra en modo sleep si no hay actividad.

Funcionalidad
Post /chat para usar Openrouter para acceder a un modelo LLM del listado.
Si no se selecciona ninguno se usa por default mistralai/mistral-7b-instruct:free.
Permite ingresar una pregunta y recibir una respuesta.
Si no se ingresa ninguna pregunta usa una por default: "Cuantos términos tiene la serie de Fibonacci"
## Descripción

Este es un servidor básico construido con Node.js y Express. Sirve como punto de partida para crear APIs REST, incluyendo funcionalidades como logging, gestión de variables de entorno, documentación de API con Swagger y ejemplos de integración con servicios externos.

## Características

- **Framework**: Express.js
- **Logging**: `morgan` para registrar las peticiones HTTP en la consola.
- **Variables de Entorno**: `dotenv` para gestionar la configuración en diferentes entornos (desarrollo/producción).
- **CORS**: Habilitado para permitir peticiones desde cualquier origen.
- **Documentación de API**: `swagger-ui-express` y `swagger-jsdoc` para generar y visualizar una documentación interactiva de la API.
- **Integraciones**: Ejemplos de cómo conectarse a APIs de terceros (OpenRouter AI y un servicio de meteorología).

## Prerrequisitos

- Node.js (v14 o superior)
- npm

Antes de iniciar, es necesario crear un archivo de configuración para las variables de entorno.

1.  Cree un archivo llamado `.env.development` en la raíz del proyecto.
2.  Añada la siguiente variable, reemplazando `TU_API_KEY` con su clave de API de OpenRouter:

    ```
    AUTHORIZATION_BEARER=TU_API_KEY
    ```

## Instalación

Clone el repositorio e instale las dependencias ejecutando el siguiente comando en la raíz del proyecto:

```bash
npm install
```

Este comando es un alias para `npm install`, tal como se define en `package.json`.

## Uso

### Modo de Desarrollo

Para iniciar el servidor en modo de desarrollo con recarga automática (usando `nodemon`):

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:4000`.

### Modo de Producción

Para iniciar el servidor en modo de producción:

```bash
npm start
```

## Estructura del Proyecto

```
.
├── controllers/
│   └── index.js        # Lógica de negocio para cada ruta
├── node_modules/
├── routes/
│   └── index.js        # Definición de las rutas de la API
├── .env.development    # (Opcional) Variables de entorno para desarrollo
├── .gitignore
├── index.js            # Punto de entrada de la aplicación y configuración del servidor
├── package-lock.json
├── package.json
└── README.md
```

- **`index.js`**: El archivo principal que inicializa el servidor Express, configura los middlewares (CORS, Morgan, Swagger) y define el puerto de escucha.
- **`routes/index.js`**: Centraliza todas las rutas de la API. Importa los controladores y los asigna a endpoints específicos. Todas las rutas definidas aquí tienen el prefijo `/api`.
- **`controllers/index.js`**: Contiene la lógica para cada ruta. Se encarga de procesar las peticiones, interactuar con servicios externos y enviar las respuestas.

## API Endpoints

La documentación completa e interactiva de la API está disponible en la ruta `/api-docs` una vez que el servidor está en funcionamiento.

A continuación se resumen los endpoints disponibles:

- **`GET /api/`**
  - **Descripción**: Devuelve un mensaje de bienvenida simple.
  - **Respuesta**: `Hola soy un get`

- **`GET /api/json`**
  - **Descripción**: Devuelve un objeto JSON de ejemplo.
  - **Respuesta**: `{ "mensaje": "Hola soy un get en formato JSON", "tipo": "JSON" }`

- **`POST /api/`**
  - **Descripción**: Devuelve el texto que se le envía en el cuerpo de la petición.
  - **Cuerpo (Body)**: `{ "texto": "Un mensaje de ejemplo" }`
  - **Respuesta**: `Un mensaje de ejemplo`

- **`POST /api/chat`**
  - **Descripción**: Envía un mensaje a un modelo de lenguaje de OpenRouter y devuelve su respuesta.
  - **Cuerpo (Body)**:
    ```json
    {
      "model": "mistralai/mistral-7b-instruct:free",
      "messages": [
        { "role": "user", "content": "¿Cuál es la capital de Francia?" }
      ]
    }
    ```
  - **Respuesta**: Un objeto JSON con la respuesta del modelo y el modelo utilizado.

- **`POST /api/weather`**
  - **Descripción**: Obtiene el pronóstico del tiempo para una ciudad. Primero consulta un servicio meteorológico y luego utiliza un modelo de lenguaje para generar un resumen en lenguaje natural.
  - **Cuerpo (Body)**: `{ "city": "Madrid" }`
  - **Respuesta**: Un objeto JSON con un resumen del pronóstico.

- **`PUT /api/`**
  - **Descripción**: Endpoint de ejemplo para el método PUT.
  - **Respuesta**: `Hola, soy un put`

- **`DELETE /api/`**
  - **Descripción**: Endpoint de ejemplo para el método DELETE.
  - **Respuesta**: `Hola soy un delete`
