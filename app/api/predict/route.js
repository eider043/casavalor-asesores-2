import model from "../../../model.json"; // se incluye en el build de Vercel

export async function POST(req) {
  try {
    const { values } = await req.json();

    // precio = intercepto + suma(coef_i * (x_i - media_i) / desv_i)
    let suma = model.intercepto;
    model.variables.forEach((nombre, i) => {
      const x = Number(values?.[nombre]);
      if (!Number.isFinite(x)) throw new Error(`Falta o es inválida la variable ${nombre}`);
      suma += (model.coeficientes[i] * (x - model.medias[i])) / model.desviaciones[i];
    });

    // El dataset está en cientos de miles de USD
    const price = Math.round(suma * 100000);
    return Response.json({ price });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 400 });
  }
}