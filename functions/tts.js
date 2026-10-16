
export async function onRequestPost({ request, env }) {
  try {
    if (!env.FISH_API_KEY) {
      return Response.json(
        { error: "Fish Audio API key is not configured." },
        { status: 500 }
      );
    }

    const { text } = await request.json();

    if (typeof text !== "string" || !text.trim()) {
      return Response.json(
        { error: "Please provide text to speak." },
        { status: 400 }
      );
    }

    if (text.length > 2000) {
      return Response.json(
        { error: "Text is too long. Please use 2000 characters or fewer." },
        { status: 400 }
      );
    }

    const response = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.FISH_API_KEY}`,
        "Content-Type": "application/json",
        model: "s2.1-pro-free"
      },
      body: JSON.stringify({
        text: text.trim(),
        reference_id: "612b878b113047d9a770c069c8b4fdfe",
        format: "mp3",
        latency: "normal"
      })
    });

    if (!response.ok) {
      const details = await response.text();
      console.error("Fish Audio error:", response.status, details);

      return Response.json(
        { error: "Fish Audio could not generate speech." },
        { status: 502 }
      );
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error("TTS endpoint error:", error);

    return Response.json(
      { error: "Unable to generate speech right now." },
      { status: 500 }
    );
  }
}
