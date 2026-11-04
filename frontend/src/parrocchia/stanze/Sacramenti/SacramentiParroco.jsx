import React, { useState } from "react";

const sacramenti = [
  { id: "battesimo", nome: "Battesimo", descrizione: "Richieste e celebrazioni" },
  { id: "comunione", nome: "Prima Comunione", descrizione: "Catechismo e celebrazioni" },
  { id: "cresima", nome: "Cresima", descrizione: "Preparazione e celebrazioni" },
  { id: "matrimonio", nome: "Matrimonio", descrizione: "Pratiche e celebrazioni" },
];

export default function SacramentiParroco({ tornaDashboard }) {
  const [scelto, setScelto] = useState(null);
  const sacramento = sacramenti.find((s) => s.id === scelto);

  return (
    <main className="ars-sacramenti-parroco">
      <style>{STILE}</style>
      <button
        type="button"
        className="ars-sac-indietro"
        onClick={() => (sacramento ? setScelto(null) : tornaDashboard?.())}
      >
        ← {sacramento ? "Tutti i Sacramenti" : "Torna alla dashboard"}
      </button>

      <header>
        <h2>{sacramento ? sacramento.nome : "Sacramenti"}</h2>
        <p>
          {sacramento
            ? sacramento.descrizione
            : "Battesimo, Prima Comunione, Cresima e Matrimonio"}
        </p>
      </header>

      {sacramento ? (
        <section className="ars-sac-dettaglio">
          <img
            src={`/sacramenti/${sacramento.id}.webp`}
            alt={`Illustrazione: ${sacramento.nome}`}
          />
          <div>
            <h3>{sacramento.nome}</h3>
            <p>La gestione di questo Sacramento sarà disponibile prossimamente.</p>
          </div>
        </section>
      ) : (
        <div className="ars-sac-griglia">
          {sacramenti.map((s) => (
            <button
              type="button"
              className="ars-sac-card"
              key={s.id}
              onClick={() => setScelto(s.id)}
              aria-label={`${s.nome} — ${s.descrizione}`}
            >
              <img src={`/sacramenti/${s.id}.webp`} alt="" />
            </button>
          ))}
        </div>
      )}
    </main>
  );
}

const STILE = `
.ars-sacramenti-parroco{max-width:960px;margin:0 auto;padding:18px;color:#243c40}
.ars-sacramenti-parroco header{text-align:center;margin:14px 0 25px}
.ars-sacramenti-parroco header h2{font-family:Georgia,serif;font-size:2rem;color:#243c40;margin:0 0 8px}
.ars-sacramenti-parroco header p{color:#5f6d70;margin:0}
.ars-sac-indietro{border:1px solid #d8c9a8;background:#fffdf8;color:#594c36;border-radius:9px;padding:10px 15px;cursor:pointer}
.ars-sac-griglia{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;align-items:start}
.ars-sac-card{display:block;width:100%;min-width:0;line-height:0;background:transparent;border:0;border-radius:12px;padding:0;margin:0;overflow:hidden;cursor:pointer;box-shadow:0 4px 14px #4b391512;transition:box-shadow .15s ease,transform .15s ease}
.ars-sac-card img{display:block;width:100%;height:auto;max-width:100%;object-fit:contain;aspect-ratio:auto;margin:0;padding:0}
.ars-sac-card:hover{box-shadow:0 7px 22px #4b39152a;transform:translateY(-2px)}
.ars-sac-card:focus-visible,.ars-sac-indietro:focus-visible{outline:3px solid #c58928;outline-offset:3px}
.ars-sac-dettaglio{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:22px;align-items:center;background:#fffdf8;border:1px solid #e2d2b3;border-radius:16px;padding:20px}
.ars-sac-dettaglio img{display:block;width:100%;height:auto;object-fit:contain;border-radius:10px}
@media(max-width:650px){.ars-sacramenti-parroco{padding:12px}.ars-sac-griglia{grid-template-columns:1fr;gap:16px}.ars-sac-dettaglio{grid-template-columns:1fr}.ars-sacramenti-parroco header h2{font-size:1.65rem}}
`;
