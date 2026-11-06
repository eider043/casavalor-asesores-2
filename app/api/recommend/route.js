const MAX_WORDS = 120;

// Mensaje de respaldo si Hugging Face falla o no hay token
function respaldo(price) {
  const p = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(price);
  return `El valor estimado del inmueble es de aproximadamente $${p} USD. No pudimos generar la recomendación personalizada en este momento. Como referencia, compara este valor con el precio de venta, visita la propiedad y confirma con un avalúo profesional antes de ofertar.`;
}

export async function POST(req) {
  let price = 0;
  try {
    const body = await req.json();
    const v = body.values;
    price = body.price;
    const p = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(price);

    if (!process.env.HF_TOKEN) throw new Error("HF_TOKEN no configurado");

    const prompt = `Datos de la zona: ingreso medio (en decenas de miles de USD) ${v.MedInc.toFixed(2)}, antigüedad ${v.HouseAge} años, habitaciones promedio ${v.AveRooms}, dormitorios promedio ${v.AveBedrms}, población ${v.Population}, ocupantes por vivienda ${v.AveOccup}, latitud ${v.Latitude}, longitud ${v.Longitude}. Precio estimado: $${p} USD. Da una recomendación de compra.`;

    const res = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "Qwen/Qwen2.5-7B-Instruct",
        max_tokens: 250,
        temperature: 0.5,
        messages: [
          {
            role: "system",
            content: `Eres un asesor inmobiliario profesional. Responde siempre en español, con una recomendación de compra clara y prudente, de máximo ${MAX_WORDS} palabras, usando las variables y el precio estimado. Aclara que es una estimación estadística.`,
          },
          { role: "user", content: prompt },
        ],
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) throw new Error(`HF respondió ${res.status}`);
    const data = await res.json();
    let text = data?.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error("Respuesta vacía");

    // Recorte de seguridad a 120 palabras
    const words = text.split(/\s+/);
    if (words.length > MAX_WORDS) text = words.slice(0, MAX_WORDS).join(" ") + "…";

    return Response.json({ text, fallback: false });
  } catch (e) {
    return Response.json({ text: respaldo(price), fallback: true });
  }
}