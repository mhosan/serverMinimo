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
        //"model": body.model || "microsoft/phi-4-reasoning-plus:free",
        "model": body.model || "deepseek/deepseek-chat-v3-0324:free",
        "messages": body.messages || [
          { role: "user", content: "¿Cuantos términos tiene la serie de Fibonacci?" },
          { role: 'assistant', content: "No esto seguro, pero mi mejor suposición es" },
        ],
        'provider': body.provider || { 'sort': 'latency' }
      })
    });
    //parametros de provider
    //throughput permite procesar mas solicit. x seg
    //price prioriza el costo mas bajo
    //latency prioriza la latencia mas baja: veloc. resp. mas rapida
    const data = await response.json();
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      const pretty = JSON.stringify({ message: data.choices[0].message.content }, null, 2);
      res.setHeader('Content-Type', 'application/json');
      res.send(pretty);
    } else {
      res.status(500).json({ error: 'No message content found', data });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.postChat = postChat;
// POST /chat


// PUT /
exports.putWelcome = (req, res) => {
    res.send('Hola, soy un put');
};

// DELETE /
exports.deleteWelcome = (req, res) => {
    res.send('Hola soy un delete');
};
