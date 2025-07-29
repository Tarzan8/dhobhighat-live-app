exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { prompt } = JSON.parse(event.body);
    const apiKey = process.env.GEMINI_API_KEY; // This is the CORRECT key name
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Gemini API Error:", errorBody);
      return { statusCode: response.status, body: `Gemini API Error: ${errorBody}` };
    }

    const result = await response.json();

    if (result.candidates && result.candidates.length > 0) {
      const text = result.candidates[0].content.parts[0].text;
      return { statusCode: 200, body: JSON.stringify({ text }) };
    } else {
      return { statusCode: 500, body: JSON.stringify({ error: "Sorry, couldn't get a response from the AI." }) };
    }
  } catch (error) {
    console.error("Serverless function error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Error connecting to the AI service.' }) };
  }
};
