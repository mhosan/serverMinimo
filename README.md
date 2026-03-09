# Servidor Mínimo Node.js
## Utilizado en DatoUrbano.
Hosting
El hosteo es en vercel, logearse en Vercel con la cuenta de Google. Conectarse por GitHub, Gmail y eMail.

## Funcionalidad
- Post /chat para usar Openrouter para acceder a un modelo LLM del listado.
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
- **Integraciones**: 
  - OpenRouter AI para modelos LLM con fallback automático
  - MCP (Model Context Protocol) para obtener datos meteorológicos
  - Procesamiento inteligente de datos con extracción y transformación
- **Estructura mejorada**: Separación clara entre rutas y controladores siguiendo mejores prácticas de Express

## Prerrequisitos
- Node.js (v14 o superior)
- npm

## Es necesario crear un archivo de configuración para las variables de entorno.
1.  Crear un archivo llamado `.env.development` en la raíz del proyecto.
2.  Añadir la siguiente variable: `AUTHORIZATION_BEARER`, con la clave API-KEY de OpenRouter:

    ```
    AUTHORIZATION_BEARER=TU_API_KEY
    ```

## Instalación
Clonar el repositorio e instalar las dependencias ejecutando el siguiente comando en la raíz del proyecto:

```bash
npm install
```

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

## Características Principales
### Endpoint `/api/chat` - Chat con Modelo LLM
**Descripción**: Envía un mensaje a un modelo de lenguaje mediante OpenRouter con fallback automático.
**Características**:
- Sistema de fallback automático: Si un modelo está limitado o falla, intenta automáticamente con otros modelos
- Modelos disponibles: Google Gemini 2.0 Flash, OpenAI GPT-4o Mini, Anthropic Claude 3.5 Sonnet, Mistral 7B
- Validación robusta de respuestas
- Logs detallados para depuración
**Flujo**:
1. Cliente envía mensaje → `/api/chat`
2. Backend intenta con el modelo solicitado
3. Si falla o está limitado, intenta con modelos alternativos
4. Devuelve la respuesta del primer modelo que funcione


### Endpoint `/api/weather` - Pronóstico del Tiempo
**Descripción**: Obtiene el pronóstico del tiempo para una ciudad y genera un resumen en lenguaje natural usando un modelo LLM.
**Características**:
- Integración con MCP (Model Context Protocol) para obtener datos meteorológicos
- Extracción inteligente de datos (soporta múltiples formatos)
- Procesamiento y transformación de datos en formato legible
- Generación de resumen natural mediante LLM
- Sistema de fallback automático de modelos
**Flujo**:
1. Cliente → POST `/api/weather` con nombre de ciudad
2. Backend → Llamada al MCP para obtener datos meteorológicos
3. Backend → Extrae y parsea datos (latitud, longitud, temperatura actual, pronóstico horario, etc.)
4. Backend → Envía datos al LLM con instrucción clara
5. LLM → Genera resumen natural del pronóstico
6. Backend → Devuelve resumen en formato JSON-RPC 2.0
**Ejemplo de respuesta**:
```json
{
  "jsonrpc": "2.0",
  "result": {
    "model": "google/gemini-2.0-flash-exp:free",
    "content": "El pronóstico del tiempo para Buenos Aires, Argentina (latitud -34.75, longitud -58.375) para el 3 de diciembre de 2025...",
  },
  "id": 1
}
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
  - **Descripción**: Envía un mensaje a un modelo de lenguaje de OpenRouter. Incluye fallback automático a modelos alternativos si el solicitado está limitado.
  - **Cuerpo (Body)**:
    ```json
    {
      "model": "google/gemini-2.0-flash-exp:free",
      "messages": [
        { "role": "user", "content": "¿Cuál es la capital de Francia?" }
      ]
    }
    ```
  - **Respuesta**: 
    ```json
    {
      "message": "La capital de Francia es París.",
      "model": "google/gemini-2.0-flash-exp:free"
    }
    ```
  - **Notas**: 
    - El campo `model` es opcional. Modelos soportados: `google/gemini-2.0-flash-exp:free`, `openai/gpt-4o-mini`, `anthropic/claude-3.5-sonnet`, `mistralai/mistral-7b-instruct:free`
    - Si el modelo solicitado está limitado o falla, automáticamente intenta con otros

- **`POST /api/weather`**
  - **Descripción**: Obtiene el pronóstico del tiempo para una ciudad consultando el MCP y genera un resumen en lenguaje natural mediante un modelo LLM.
  - **Cuerpo (Body)**: 
    ```json
    { "city": "Buenos Aires" }
    ```
  - **Respuesta**: 
    ```json
    {
      "jsonrpc": "2.0",
      "result": {
        "model": "google/gemini-2.0-flash-exp:free",
        "content": "El pronóstico del tiempo para Buenos Aires, Argentina indica..."
      },
      "id": 1
    }
    ```
  - **Flujo interno**:
    1. Obtiene datos meteorológicos desde MCP
    2. Extrae información: ubicación, temperatura actual, pronóstico horario
    3. Envía los datos a un modelo LLM
    4. El LLM genera un resumen en lenguaje natural
    5. Devuelve el resumen al cliente

- **`PUT /api/`**
  - **Descripción**: Endpoint de ejemplo para el método PUT.
  - **Respuesta**: `Hola, soy un put`

- **`DELETE /api/`**
  - **Descripción**: Endpoint de ejemplo para el método DELETE.
  - **Respuesta**: `Hola soy un delete`

## Ejemplos de Payloads

### `POST /api/chat` - Ejemplos de Uso

**Ejemplo 1: Pregunta simple con modelo por defecto**
```bash
curl -X POST http://localhost:4000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      { "role": "user", "content": "¿Cuál es la capital de Francia?" }
    ]
  }'
```

**Respuesta**:
```json
{
  "message": "La capital de Francia es París.",
  "model": "google/gemini-2.0-flash-exp:free"
}
```

**Ejemplo 2: Pregunta con modelo específico**
```bash
curl -X POST http://localhost:4000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-4o-mini",
    "messages": [
      { "role": "user", "content": "¿Cuáles son los beneficios del ejercicio?" }
    ]
  }'
```

**Respuesta**:
```json
{
  "message": "Los beneficios del ejercicio son múltiples: mejora la salud cardiovascular, fortalece los músculos, aumenta la energía, mejora el estado de ánimo, ayuda a mantener un peso saludable...",
  "model": "openai/gpt-4o-mini"
}
```

**Ejemplo 3: Múltiples mensajes (conversación)**
```bash
curl -X POST http://localhost:4000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      { "role": "user", "content": "¿Qué es la inteligencia artificial?" },
      { "role": "assistant", "content": "La inteligencia artificial es..." },
      { "role": "user", "content": "¿Y el machine learning?" }
    ]
  }'
```

### `POST /api/weather` - Ejemplos de Uso

**Ejemplo 1: Pronóstico para Buenos Aires**
```bash
curl -X POST http://localhost:4000/api/weather \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Buenos Aires"
  }'
```

**Respuesta**:
```json
{
  "jsonrpc": "2.0",
  "result": {
    "model": "google/gemini-2.0-flash-exp:free",
    "content": "El pronóstico del tiempo para Buenos Aires, Argentina (latitud -34.75, longitud -58.375) para el 3 de diciembre de 2025, indica lo siguiente:\n\n* **Actualmente (02:15 GMT):** La temperatura es de 19°C, no hay precipitaciones ni lluvia y es de noche (is_day = 0).\n* **Pronóstico Horario:** La temperatura comenzará en 20.4°C a las 00:00, bajará gradualmente hasta los 17.9°C a las 09:00. A partir de las 10:00 comenzará a subir, alcanzando su punto máximo de 30.9°C alrededor de las 19:00..."
  },
  "id": 1
}
```

**Ejemplo 2: Pronóstico para Madrid con modelo específico**
```bash
curl -X POST http://localhost:4000/api/weather \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Madrid",
    "model": "openai/gpt-4o-mini"
  }'
```

**Ejemplo 3: Pronóstico para Nueva York**
```bash
curl -X POST http://localhost:4000/api/weather \
  -H "Content-Type: application/json" \
  -d '{
    "city": "New York"
  }'
```

## Notas Importantes

### Autenticación
- Es obligatorio configurar la variable de entorno `AUTHORIZATION_BEARER` con una clave API válida de OpenRouter
- Sin esta clave, los endpoints `/api/chat` y `/api/weather` no funcionarán

### Fallback Automático
- Si el modelo solicitado está limitado (rate limit 429), el sistema automáticamente intenta con modelos alternativos
- El orden de fallback es: Gemini 2.0 Flash → GPT-4o Mini → Claude 3.5 Sonnet → Mistral 7B
- Esto garantiza que casi siempre obtendrá una respuesta

### Límites de Modelos Gratuitos
- Los modelos gratuitos de OpenRouter tienen límites de rate limit
- Si todos los modelos están limitados, recibirá un error 429
- Se recomienda esperar unos minutos o añadir tu propia clave de API en OpenRouter para mayores límites
