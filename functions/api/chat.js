
export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    const body = await request.json();
    const message = body?.message;

    if (typeof message !== "string" || !message.trim()) {
      return Response.json(
        { error: "Please provide a message." },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return Response.json(
        { error: "Message is too long. Limit: 2000 characters." },
        { status: 400 }
      );
    }

    const apiKey = env.Gemini_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "JARVIS AI is not configured yet." },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: "You are JARVIS, a helpful, composed, intelligent personal AI assistant. Be conversational, concise, honest about your abilities, and address the user respectfully. Never claim you performed an action unless you actually did."
            }]
          },
          contents: [{
            role: "user",
            parts: [{ text: message.trim() }]
          }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
  console.error("Gemini API error:", response.status, data);

  return Response.json(
    {
      error: "Gemini request failed.",
      upstreamStatus: response.status,
      details: data?.error?.message || "No additional details available."
    },
    { status: 502 }
  );
}

    const reply =
      data?.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("")
        .trim();

    if (!reply) {
      return Response.json(
        { error: "JARVIS received no text response. Please try again." },
        { status: 502 }
      );
    }

    return Response.json({ reply });
  } catch (error) {
    return Response.json(
      { error: "Unable to process the request. Please try again." },
      { status: 400 }
    );
  }
}
