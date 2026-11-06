// Layout raíz: carga fuentes y Tailwind (CDN) con la configuración de Stitch
const tailwindConfig = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        surface: "#f8f9ff", primary: "#005d90", "primary-container": "#0077b6",
        "on-primary": "#ffffff", secondary: "#476080", tertiary: "#006645",
        "tertiary-container": "#008259", "on-tertiary": "#ffffff",
        "tertiary-fixed": "#6ffbbe", "on-tertiary-fixed": "#002113",
        "on-tertiary-fixed-variant": "#005236", "on-surface": "#0b1c30",
        "on-surface-variant": "#404850", "on-background": "#0b1c30",
        "surface-container-lowest": "#ffffff", "surface-container-low": "#eff4ff",
        "surface-container": "#e5eeff", "surface-container-high": "#dce9ff",
        "surface-container-highest": "#d3e4fe", "inverse-surface": "#213145",
        "inverse-on-surface": "#eaf1ff", error: "#ba1a1a", "error-container": "#ffdad6",
      },
      spacing: { "space-md": "1rem", "space-sm": "0.5rem", "space-xs": "0.25rem" },
      fontFamily: { sans: ["Plus Jakarta Sans", "sans-serif"] },
      fontSize: {
        "label-sm": ["11px", { lineHeight: "14px", letterSpacing: "0.04em", fontWeight: "700" }],
        "label-md": ["12px", { lineHeight: "16px", letterSpacing: "0.02em", fontWeight: "600" }],
        "label-lg": ["14px", { lineHeight: "20px", letterSpacing: "0.01em", fontWeight: "600" }],
        "body-md": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "body-sm": ["12px", { lineHeight: "16px", fontWeight: "400" }],
        "headline-sm": ["18px", { lineHeight: "24px", fontWeight: "600" }],
        "data-metric-mobile": ["26px", { lineHeight: "32px", letterSpacing: "-0.02em", fontWeight: "700" }],
      },
    },
  },
};

// Script que carga Tailwind y aplica la configuración al terminar de cargar
const loader = `
var s=document.createElement('script');
s.src='https://cdn.tailwindcss.com';
s.onload=function(){tailwind.config=${JSON.stringify(tailwindConfig)};};
document.head.appendChild(s);
`;

export const metadata = {
  title: "CasaValor Asesores",
  description: "Estimación de valor de vivienda con IA",
};

export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: loader }} />
        <style>{`
          body{margin:0;font-family:'Plus Jakarta Sans',sans-serif;background:#f8f9ff;color:#0b1c30;-webkit-tap-highlight-color:transparent}
          .material-symbols-outlined{font-family:'Material Symbols Outlined';font-weight:normal;font-style:normal;line-height:1;display:inline-block;font-variation-settings:'FILL' 0,'wght' 400}
          ::-webkit-scrollbar{display:none}
        `}</style>
      </head>
      <body className="bg-surface text-on-surface">{children}</body>
    </html>
  );
}