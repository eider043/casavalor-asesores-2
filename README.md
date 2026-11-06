# CasaValor Asesores

Chat de valoración de vivienda (Next.js App Router) con regresión lineal
entrenada en California Housing y recomendación generada con Hugging Face.

## Estructura
- `model.json`: parámetros del modelo exportados desde Colab.
- `app/page.js`: chat con el diseño de Stitch.
- `app/api/predict/route.js`: calcula el precio con el modelo.
- `app/api/recommend/route.js`: pide la recomendación a Hugging Face (con mensaje de respaldo).

## Uso local
1. `npm install`
2. Crea `.env.local` con: `HF_TOKEN=hf_xxxxxxxx`
3. `npm run dev` y abre http://localhost:3000

## Despliegue en Vercel
1. Sube el proyecto a GitHub e impórtalo en Vercel.
2. En Settings → Environment Variables añade `HF_TOKEN`.
3. Deploy.

## Notas
- Fórmula: `precio = (intercepto + Σ coef_i · (x_i − media_i) / desv_i) × 100000`.
- El ingreso se pide en USD anuales y se divide entre 10,000 (unidad del dataset).
- El modelo solo es válido para California; el chat rechaza coordenadas fuera de ese rango.
- Si Hugging Face falla o falta `HF_TOKEN`, se muestra un mensaje de respaldo.
- Tailwind se carga por CDN para conservar el diseño de Stitch sin configuración extra.