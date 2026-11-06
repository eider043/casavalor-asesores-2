"use client";
import { useEffect, useRef, useState } from "react";

// Los 8 pasos del chat. "toVar" convierte lo que escribe el usuario
// a la unidad que espera el modelo; "ok" valida el rango.
const STEPS = [
  { key: "MedInc", q: "¡Hola! Soy Valeria de CasaValor. Vamos a estimar el valor del inmueble. Para comenzar, ¿cuál es el ingreso medio anual del hogar en el sector (USD)?", ok: (n) => n > 0 && n < 500000, toVar: (n) => n / 10000, err: "Escribe el ingreso anual en USD, por ejemplo 68500." },
  { key: "HouseAge", q: "¿Cuál es la antigüedad aproximada de la vivienda (años)?", ok: (n) => n >= 1 && n <= 100, toVar: (n) => n, err: "Escribe un número de años entre 1 y 100." },
  { key: "AveRooms", q: "¿Cuál es el promedio de habitaciones totales por vivienda?", ok: (n) => n >= 1 && n <= 20, toVar: (n) => n, err: "Escribe un número entre 1 y 20." },
  { key: "AveBedrms", q: "¿Y el promedio de dormitorios?", ok: (n) => n >= 0.5 && n <= 10, toVar: (n) => n, err: "Escribe un número entre 0.5 y 10." },
  { key: "Population", q: "¿Cuánta población tiene el sector o vecindario?", ok: (n) => n >= 3 && n <= 40000, toVar: (n) => n, err: "Escribe un número entre 3 y 40,000." },
  { key: "AveOccup", q: "¿Cuál es el promedio de ocupantes por vivienda?", ok: (n) => n >= 0.5 && n <= 20, toVar: (n) => n, err: "Escribe un número entre 0.5 y 20." },
  { key: "Latitude", q: "Ahora la ubicación. El modelo solo conoce California. ¿Cuál es la latitud? (entre 32.5 y 42, ej. 34.05)", ok: (n) => n >= 32.5 && n <= 42, toVar: (n) => n, err: "La latitud debe estar entre 32.5 y 42 (California)." },
  { key: "Longitude", q: "¿Y la longitud? Usa signo negativo (entre -124.4 y -114.1, ej. -118.24)", ok: (n) => n >= -124.4 && n <= -114.1, toVar: (n) => n, err: "La longitud debe ser negativa, entre -124.4 y -114.1." },
];

const fmt = (n) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);

function Bot({ children }) {
  return (
    <div className="flex items-start gap-2 max-w-[88%]">
      <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
        <span className="material-symbols-outlined text-[16px]">smart_toy</span>
      </div>
      <div className="bg-surface-container-low p-3 rounded-2xl rounded-tl-sm shadow-sm">
        <span className="text-label-sm text-primary font-bold block mb-1">Valeria</span>
        <p className="text-body-md leading-snug">{children}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const first = [{ from: "bot", text: STEPS[0].q }];
  const [messages, setMessages] = useState(first);
  const [step, setStep] = useState(0);
  const [values, setValues] = useState({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, result, loading]);

  const reset = () => {
    setMessages(first); setStep(0); setValues({}); setInput(""); setResult(null); setLoading(false);
  };

  const estimate = async (vals) => {
    setLoading(true);
    try {
      // 1) Calcular el precio con el modelo
      const p = await fetch("/api/predict", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values: vals }),
      }).then((r) => r.json());
      if (p.error) throw new Error(p.error);

      // 2) Pedir la recomendación a Hugging Face (con respaldo en el servidor)
      const r = await fetch("/api/recommend", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values: vals, price: p.price }),
      }).then((x) => x.json());

      setResult({ price: p.price, text: r.text, fallback: r.fallback });
    } catch (e) {
      setMessages((m) => [...m, { from: "bot", text: "Hubo un problema al calcular. Intenta de nuevo con 'Nueva consulta'." }]);
    }
    setLoading(false);
  };

  const send = () => {
    const raw = input.trim();
    if (!raw || loading || result) return;
    const n = parseFloat(raw.replace(/[^0-9.\-]/g, ""));
    const s = STEPS[step];
    if (isNaN(n) || !s.ok(n)) {
      setMessages((m) => [...m, { from: "user", text: raw }, { from: "bot", text: s.err }]);
      setInput("");
      return;
    }
    const vals = { ...values, [s.key]: s.toVar(n) };
    const next = step + 1;
    setValues(vals); setInput(""); setStep(next);
    const added = [{ from: "user", text: raw }];
    if (next < STEPS.length) {
      added.push({ from: "bot", text: STEPS[next].q });
    } else {
      added.push({ from: "bot", text: "¡Excelente! Procesando los 8 parámetros con el modelo…" });
    }
    setMessages((m) => [...m, ...added]);
    if (next === STEPS.length) estimate(vals);
  };

  const pct = Math.round((step / STEPS.length) * 100);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Encabezado */}
      <header className="fixed top-0 w-full z-50 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(15,43,72,0.04)]">
        <div className="h-16 px-space-md flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">home_work</span>
            </div>
            <div className="flex flex-col">
              <span className="text-label-lg font-bold">CasaValor Asesores</span>
              <span className="text-label-sm text-secondary">Valoración con IA</span>
            </div>
          </div>
          <button aria-label="Reiniciar" onClick={reset} className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant active:scale-95">
            <span className="material-symbols-outlined text-[22px]">restart_alt</span>
          </button>
        </div>
      </header>

      <main className="flex flex-col w-full max-w-md mx-auto pt-16 pb-24">
        {/* Progreso */}
        <div className="bg-surface-container-low px-space-md py-space-sm shadow-sm">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse" />
            <span className="text-label-sm text-secondary uppercase tracking-wider">
              Paso {Math.min(step + 1, 8)} de 8 ({pct}%)
            </span>
          </div>
          <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary via-primary-container to-tertiary-container rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Chat */}
        <div className="flex flex-col px-space-md py-space-md gap-3">
          {messages.map((m, i) =>
            m.from === "bot" ? (
              <Bot key={i}>{m.text}</Bot>
            ) : (
              <div key={i} className="flex justify-end">
                <div className="bg-primary text-on-primary px-3.5 py-2 rounded-2xl rounded-tr-sm max-w-[80%] shadow-sm">
                  <p className="text-body-md">{m.text}</p>
                </div>
              </div>
            )
          )}

          {loading && <Bot>Calculando valuación y recomendación…</Bot>}

          {result && (
            <>
              {/* Tarjeta A: valor estimado */}
              <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-md flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[20px]">analytics</span>
                  <span className="text-label-sm text-secondary uppercase tracking-wider">Valor estimado de mercado</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-data-metric-mobile font-extrabold">${fmt(result.price)}</span>
                  <span className="text-headline-sm text-secondary">USD</span>
                </div>
                <p className="text-body-sm text-secondary">Estimación estadística del modelo de regresión lineal (California Housing).</p>
              </div>

              {/* Tarjeta B: recomendación */}
              <div className="bg-gradient-to-br from-surface-container-lowest to-surface-container-low rounded-2xl p-4 shadow-md flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-label-sm text-secondary uppercase tracking-wider">Dictamen de asesoría</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-tertiary-container text-on-tertiary text-label-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">recommend</span>
                    {result.fallback ? "Respaldo" : "IA"}
                  </span>
                </div>
                <p className="text-body-md leading-snug whitespace-pre-line">{result.text}</p>
                <button onClick={reset} className="w-full h-12 mt-1 bg-primary text-on-primary active:scale-[0.99] text-label-lg font-bold rounded-xl flex items-center justify-center gap-2 shadow-md">
                  <span className="material-symbols-outlined text-[20px]">add_circle</span>
                  Nueva consulta
                </button>
              </div>
            </>
          )}
          <div ref={endRef} />
        </div>
      </main>

      {/* Barra de entrada */}
      <div className="fixed bottom-0 w-full bg-surface-container-lowest/95 backdrop-blur-md px-space-md py-2.5 shadow-[0_-4px_16px_rgba(15,43,72,0.06)] z-20">
        <div className="flex items-center gap-2 max-w-md mx-auto">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            disabled={loading || !!result}
            inputMode="decimal"
            placeholder={result ? "Pulsa «Nueva consulta»" : "Escribe tu respuesta…"}
            className="w-full h-11 px-4 rounded-full bg-surface-container-low text-body-md focus:outline-none focus:bg-surface-container disabled:opacity-60"
          />
          <button aria-label="Enviar" onClick={send} disabled={loading || !!result} className="w-11 h-11 rounded-full bg-primary text-on-primary flex items-center justify-center flex-shrink-0 shadow-md active:scale-95 disabled:opacity-60">
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}