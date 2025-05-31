// Reemplazo de import ESM por función compatible con require/CommonJS
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

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


// POST /chat
const postChat = async (req, res) => {
  const body = req.body || {};
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.AUTHORIZATION_BEARER}`,
        "HTTP-Referer": "https://mhtest.alwaysdata.net/#/",
        "X-Title": "Mhosan",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": body.model || "mistralai/mistral-7b-instruct:free", //117M tokens baja latencia
        //"model": body.model || "mistralai/mistral-nemo:free", //1.59B tokens
        //"model": body.model || "microsoft/mai-ds-r1:free", //2.73B tokens
        //"model": body.model || "meta-llama/llama-4-maverick:free", //10.6B tokens
        //"model": body.model || "google/gemini-2.0-flash-exp:free", //27.7B tokens
        //"model": body.model || "microsoft/phi-4-reasoning-plus:free", //222M tokens
        //"model": body.model || "deepseek/deepseek-chat-v3-0324:free", //99B tokens
        "messages": body.messages || [
          { role: "user", content: "¿Cuantos términos tiene la serie de Fibonacci?" },
          //{ role: 'assistant', content: "No esto seguro, pero mi mejor suposición es" },
        ],
        'provider': body.provider || { 'sort': 'latency' },
        //max_tokens: 100 //maximo de tokens a devolver
        //temperature: 0.7, //controla la aleatoriedad de la respuesta
      })
    });
    //parametros de provider
    //throughput permite procesar mas solicit. x seg
    //price prioriza el costo mas bajo
    //latency prioriza la latencia mas baja: veloc. resp. mas rapida
    const data = await response.json();
    const usedModel = body.model || "mistralai/mistral-7b-instruct:free";
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      const pretty = JSON.stringify({
        message: data.choices[0].message.content,
        model: usedModel
      }, null, 2);
      res.setHeader('Content-Type', 'application/json');
      res.send(pretty);
    } else {
      res.status(500).json({ error: 'No message content found', data, model: usedModel });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.postChat = postChat;
// POST /chat


// POST /weather
const postWeather = async (req, res) => {
  const { city } = req.body;
  if (!city) {
    return res.status(400).json({ error: 'City is required in the request body.' });
  }
  try {
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
    // Intenta extraer el JSON válido de la respuesta tipo event-stream
    let data;
    try {
      // Busca la línea que contiene 'data:' y extrae el JSON
      const match = text.match(/data: (\{.*\})/);
      if (match && match[1]) {
        data = JSON.parse(match[1]);
      } else {
        throw new Error('No se encontró JSON válido en la respuesta del MCP');
      }
    } catch (err) {
      return res.status(500).json({ error: 'Error al parsear la respuesta del MCP', details: err.message, raw: text });
    }
    res.setHeader('Content-Type', 'application/json');
    // Si el MCP devuelve un objeto con 'result.content', lo ponemos directo en result.content
    let result = { model: 'mcpserver-hazel/pronostico' };
    if (data && typeof data === 'object') {
      if (data.result && typeof data.result === 'object' && data.result.content) {
        result.content = data.result.content;
      } else if (data.content) {
        result.content = data.content;
      } else {
        result.data = data;
      }
    } else {
      result.data = data;
    }
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
exports.putWelcome = (req, res) => {
    res.send('Hola, soy un put');
};

// DELETE /
exports.deleteWelcome = (req, res) => {
    res.send('Hola soy un delete');
};
