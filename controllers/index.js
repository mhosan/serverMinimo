// Reemplazo de import ESM por función compatible con require/CommonJS
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));


/**
 * GET 
 * @param {*} _req 
 * @param {*} res 
 */
exports.getWelcome = (_req, res) => {
  res.send('Hola soy un get');
};

/**
 * GET de prueba para verificar que el servidor puede devolver respuestas en formato JSON. Devuelve un objeto con un mensaje y un tipo, sin lógica adicional.
 * @param {} _req 
 * @param {*} res 
 */
exports.getJson = (_req, res) => {
  res.json({ mensaje: 'Hola soy un get en formato JSON', tipo: 'JSON' });
};

/**
 * POST de prueba para verificar que el servidor puede recibir datos en el cuerpo de la solicitud y devolverlos. Devuelve exactamente el texto recibido en el campo "texto" del cuerpo, sin lógica adicional.
 * @param {*} req 
 * @param {*} res 
 */
exports.postText = (req, res) => {
  const { texto } = req.body;
  res.send(texto);
};

// POST /chat
/* cb-445f7fa06b73openrouter/free
stepfun/step-3.5-flash:free
arcee-ai/trinity-large-preview:free
liquid/lfm-2.5-1.2b-thinking:free
liquid/lfm-2.5-1.2b-instruct:free
nvidia/nemotron-3-nano-30b-a3b:free
arcee-ai/trinity-mini:free
nvidia/nemotron-nano-12b-v2-vl:free
qwen/qwen3-vl-30b-a3b-thinking
qwen/qwen3-vl-235b-a22b-thinking
qwen/qwen3-next-80b-a3b-instruct:free
nvidia/nemotron-nano-9b-v2:free
openai/gpt-oss-120b:free
openai/gpt-oss-20b:free
z-ai/glm-4.5-air:free
qwen/qwen3-coder:free
cognitivecomputations/dolphin-mistral-24b-venice-edition:free
google/gemma-3n-e2b-it:free
google/gemma-3n-e4b-it:free
qwen/qwen3-4b:free
mistralai/mistral-small-3.1-24b-instruct:free
google/gemma-3-4b-it:free
google/gemma-3-12b-it:free
google/gemma-3-27b-it:free
meta-llama/llama-3.3-70b-instruct:free
meta-llama/llama-3.2-3b-instruct:free
nousresearch/hermes-3-llama-3.1-405b:free */


/**
 * POST
 * Recibe un cuerpo con un modelo, mensajes y provider opcionales, hace una solicitud a OpenRouter para obtener una respuesta del LLM,
 * valida la respuesta y la devuelve al cliente. Si el modelo especificado no funciona, intenta con una lista de modelos de fallback. 
 * Si ningún modelo funciona, devuelve un error detallado con los intentos realizados.
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const postChat = async (req, res) => {
  const body = req.body || {};
  try {
    const requestBody = {
      "model": body.model || "nousresearch/hermes-3-llama-3.1-405b:free",
      "messages": body.messages || [
        { role: "user", content: "¿Cuantos términos tiene la serie de Fibonacci?" }
      ],
      'provider': body.provider || { 'sort': 'latency' }
    };

    console.log('=== POST /chat ===');
    console.log('Authorization Bearer:', process.env.AUTHORIZATION_BEARER ? 'Presente' : 'FALTA');
    console.log('Modelo a usar:', requestBody.model);
    console.log('Payload enviado a OpenRouter:', JSON.stringify(requestBody, null, 2));

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.AUTHORIZATION_BEARER}`,
        "HTTP-Referer": "https://mhtest.alwaysdata.net/#/",
        "X-Title": "Mhosan",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Status HTTP de OpenRouter:', response.status);
    console.log('Headers de respuesta:', {
      'content-type': response.headers.get('content-type'),
      'x-ratelimit-remaining': response.headers.get('x-ratelimit-remaining')
    });

    const data = await response.json();
    console.log('Respuesta completa de OpenRouter:', JSON.stringify(data, null, 2));
    const usedModel = body.model || "mistralai/mistral-7b-instruct:free";

    // Validar que la respuesta sea válida
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Error: Estructura de respuesta inválida', data);
      return res.status(500).json({
        error: 'Respuesta de OpenRouter con estructura inválida',
        data,
        model: usedModel
      });
    }

    const content = data.choices[0].message.content;

    // Validar que el contenido no esté vacío
    if (!content || content.trim() === '') {
      console.error('Error: Content vacío en la respuesta de OpenRouter');
      return res.status(500).json({
        error: 'OpenRouter devolvió un contenido vacío',
        fullResponse: data,
        model: usedModel
      });
    }

    const pretty = JSON.stringify({
      message: content,
      model: usedModel
    }, null, 2);
    res.setHeader('Content-Type', 'application/json');
    res.send(pretty);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.postChat = postChat;



// Función auxiliar para enviar mensajes al LLM (OpenRouter) con fallback automático
async function sendToLLM(messages, model = "google/gemini-2.0-flash-thinking-exp:free", provider = { sort: 'latency' }) {
  // Lista de modelos de fallback que REALMENTE existen en OpenRouter
  const modelos = [
    model, // Intentar primero con el modelo solicitado
    "stepfun/step-3.5-flash:free",
    "arcee-ai/trinity-large-preview:free",
    "liquid/lfm-2.5-1.2b-thinking:free",
    "liquid/lfm-2.5-1.2b-instruct:free",
    "nvidia/nemotron-3-nano-30b-a3b:free",
    /* "google/gemini-2.0-flash-thinking-exp:free",
    "google/gemma-2-9b-it:free",
    "meta-llama/llama-3.1-8b-instruct:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "huggingfaceh4/zephyr-7b-beta:free"
    */
  ];

  // Remover duplicados
  const modelosUnicos = [...new Set(modelos)];
  let erroresAcumulados = [];

  for (const modeloActual of modelosUnicos) {
    try {
      console.log(`\n[sendToLLM] Intentando con modelo: ${modeloActual}`);

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.AUTHORIZATION_BEARER}`,
          "HTTP-Referer": "https://mhtest.alwaysdata.net/#/",
          "X-Title": "Mhosan",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: modeloActual,
          messages,
          provider
        })
      });

      console.log(`[sendToLLM] Status HTTP: ${response.status}`);

      const data = await response.json();

      // Verificar si hay error de rate limit o estructura
      if (data.error) {
        console.log(`[sendToLLM] ❌ Error con ${modeloActual}:`, data.error.message || data.error.code);
        erroresAcumulados.push({ status: response.status, openrouter_error: data.error });
        continue; // Intentar siguiente modelo
      }

      // Verificar si la respuesta tiene contenido válido
      if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
        const content = data.choices[0].message.content.trim();

        if (content && content !== '' && content !== ' ') {
          console.log(`[sendToLLM] ✓ Modelo ${modeloActual} respondió correctamente`);
          return data;
        }
      }

      console.log(`[sendToLLM] ⚠ Contenido vacío con ${modeloActual}, intentando siguiente...`);
      erroresAcumulados.push({ status: response.status, error: 'Empty content returned' });

    } catch (err) {
      console.log(`[sendToLLM] 🔴 Error de red con ${modeloActual}:`, err.message);
      erroresAcumulados.push({ status: 'Network Error', error: err.message });
    }
  }

  // Si llegamos aquí, ningún modelo funcionó, arrojamos los detalles completos en el mensaje
  throw new Error(`Detalles del rechazo de OpenRouter: ${JSON.stringify(erroresAcumulados)}`);
}


// POST /weather
const postWeather = async (req, res) => {

  const { city } = req.body;
  if (!city) {
    return res.status(400).json({ error: 'City is required in the request body.' });
  }
  try {
    // 1. Llamar al MCP
    const mcpResponse = await fetch('https://mcpserver-hazel.vercel.app/api', {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/event-stream',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'pronostico',
          arguments: { city }
        },
        id: 1
      })
    });

    const text = await mcpResponse.text();
    console.log('[MCP] Respuesta cruda (primeros 500 caracteres):', text.substring(0, 500));

    // Parsear la respuesta y extraer el texto meteorológico
    let datosMeteorologicos = '';
    try {
      const dataLines = text.split('\n').filter(line => line.startsWith('data: '));
      console.log('[MCP] Líneas con "data:":', dataLines.length);

      if (dataLines.length > 0) {
        const lastData = dataLines[dataLines.length - 1].replace('data: ', '');
        const data = JSON.parse(lastData);
        console.log('[MCP] Estructura parsed:', JSON.stringify(data, null, 2).substring(0, 300));

        // Buscar la propiedad text en la estructura result.content[0].text
        if (
          data.result &&
          data.result.content &&
          Array.isArray(data.result.content) &&
          data.result.content[0] &&
          data.result.content[0].text
        ) {
          // El text puede ser un string o un objeto
          let textContent = data.result.content[0].text;

          // Si es un string que parece JSON, parsearlo
          if (typeof textContent === 'string') {
            try {
              textContent = JSON.parse(textContent);
              console.log('[MCP] ✓ Text parseado como JSON');
            } catch (e) {
              console.log('[MCP] Text es un string (no JSON)');
            }
          }

          // Convertir a string legible
          datosMeteorologicos = typeof textContent === 'string'
            ? textContent
            : JSON.stringify(textContent, null, 2);
          console.log('[MCP] ✓ Datos meteorológicos extraídos correctamente');
        } else {
          datosMeteorologicos = '[No se encontró la propiedad text en la respuesta del MCP]';
          console.log('[MCP] ❌ Estructura no contiene result.content[0].text');
        }
      } else {
        datosMeteorologicos = '[No se encontró línea con data: en la respuesta del MCP]';
        console.log('[MCP] ❌ No se encontraron líneas con "data:"');
      }
    } catch (err) {
      datosMeteorologicos = '[Error al parsear la respuesta del MCP: ' + err.message + ']';
      console.log('[MCP] ❌ Error al parsear:', err.message);
    }
    console.log('Datos meteorológicos extraídos:', datosMeteorologicos.substring(0, 200));
    // Buscar todas las líneas con 'data:' y tomar la última
    let pronostico = '';
    try {
      const dataLines = text.split('\n').filter(line => line.startsWith('data: '));
      if (dataLines.length > 0) {
        const lastData = dataLines[dataLines.length - 1].replace('data: ', '');
        const data = JSON.parse(lastData);
        // Extraer el texto del pronóstico si está en data.result.content[0].text
        if (data.result && data.result.content && Array.isArray(data.result.content) && data.result.content[0].text) {
          pronostico = data.result.content[0].text;
        } else if (data.result && data.result.content && typeof data.result.content === 'string') {
          pronostico = data.result.content;
        } else if (data.content && typeof data.content === 'string') {
          pronostico = data.content;
        } else if (data.content && typeof data.content === 'object') {
          // Extraer campos meteorológicos relevantes si existen
          const campos = data.content;
          let frase = '';
          if (campos.ciudad) frase += `En ${campos.ciudad}, `;
          if (campos.temperatura) frase += `la temperatura es de ${campos.temperatura}, `;
          if (campos.humedad) frase += `la humedad es de ${campos.humedad}, `;
          if (campos.presion) frase += `la presión es de ${campos.presion}, `;
          if (campos.viento) frase += `el viento es de ${campos.viento}, `;
          if (campos.nubosidad) frase += `la nubosidad es de ${campos.nubosidad}, `;
          pronostico = frase.trim().replace(/, $/, '.');
          if (!pronostico) pronostico = Object.values(campos).join(', ');
        } else {
          pronostico = JSON.stringify(data);
        }
      } else {
        throw new Error('No se encontró línea con data: en la respuesta del MCP');
      }
    } catch (err) {
      return res.status(500).json({ error: 'Error al parsear la respuesta del MCP', details: err.message, raw: text });
    }
    // 3. Armar el mensaje para el LLM usando el string de datos meteorológicos extraídos
    const messages = [
      { role: "user", content: `Dame un resumen del pronóstico del tiempo de ${city} con estos datos: ${datosMeteorologicos}` }
    ];
    // 4. Usar el mismo modelo que postChat
    const model = req.body.model || "google/gemini-2.0-flash-thinking-exp:free";
    const provider = req.body.provider || { sort: 'latency' };

    console.log('=== POST /weather ===');
    console.log('Ciudad:', city);
    console.log('Modelo a usar:', model);
    console.log('Enviando mensaje al LLM...');

    // 5. Llamar al LLM (con fallback automático integrado)
    const llmData = await sendToLLM(messages, model, provider);
    console.log('Respuesta del LLM:', JSON.stringify(llmData, null, 2));

    // 6. Validar respuesta del LLM
    if (!llmData.choices || !llmData.choices[0] || !llmData.choices[0].message) {
      console.error('Error: Estructura de respuesta del LLM inválida');
      return res.status(500).json({
        error: 'Respuesta de LLM con estructura inválida',
        data: llmData,
        model: model
      });
    }

    const content = llmData.choices[0].message.content;

    // Validar que el contenido no esté vacío
    if (!content || content.trim() === '') {
      console.error('Error: Content vacío en la respuesta del LLM');
      return res.status(500).json({
        error: 'LLM devolvió un contenido vacío',
        fullResponse: llmData,
        model: model
      });
    }

    // 7. Responder al cliente
    let result = { model: model };
    result.content = content;
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
      jsonrpc: '2.0',
      result,
      id: 1
    }, null, 2));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.postWeather = postWeather;
// POST /weather


// PUT /
exports.putWelcome = (_req, res) => {
  res.send('Hola, soy un put');
};

// DELETE /
exports.deleteWelcome = (_req, res) => {
  res.send('Hola soy un delete');
};
