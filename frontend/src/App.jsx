import React, { useState } from "react";

export default function App() {
  const [adminMode, setAdminMode] = useState(false);

 const [liturgia, setLiturgia] = useState(() => {
  const saved = localStorage.getItem("liturgia_v2");
  return saved
    ? JSON.parse(saved)
    : {
    data: "27 Maggio 2026",
    tempo: "Tempo Ordinario",
    colore: "Verde",
    vangelo: "Dal Vangelo secondo Giovanni (Gv 17,1-11a)",
    riflessione:
      
      "Cristo prega il Padre per i suoi discepoli e li affida al Suo amore.",
    linkCei: "",
    santo: "Sant'Agostino di Canterbury",
    prodotti: [
  {
    nome: "Astuccio porta-Viatico",
    prezzo: "€ 0,00",
    nota: "Selezione liturgica del momento",
    link: "",
    immagine: "",
  },
],
      };
});

  const [formData, setFormData] = useState(liturgia);

  const salvaModifiche = () => {
    setLiturgia(formData);
    localStorage.setItem("liturgia_v2", JSON.stringify(formData));
    alert("Liturgia aggiornata correttamente");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(to bottom, #2b0000, #4a0d0d, #1f0000)",
        color: "#f5e6c8",
        fontFamily: "serif",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          <h1
            style={{
              color: "#d4af37",
              fontSize: "42px",
              marginBottom: "5px",
            }}
          >
            Ars Liturgica
          </h1>

          <p
            style={{
              color: "#f0d9a7",
              fontStyle: "italic",
            }}
          >
            Al servizio della celebrazione
          </p>
        </div>

        <div
          style={{
            background: "#f8f1df",
            color: "#3a1c00",
            borderRadius: "20px",
            padding: "30px",
            boxShadow: "0 0 20px rgba(0,0,0,0.4)",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              marginBottom: "20px",
              color: "#6b0000",
            }}
          >
            Liturgia del Giorno
          </h2>

          <p>
            <strong>Data:</strong> {liturgia.data}
          </p>

          <p>
            <strong>Tempo Liturgico:</strong> {liturgia.tempo}
          </p>

          <p>
            <strong>Colore Liturgico:</strong> {liturgia.colore}
          </p>

          <p>
            <strong>Memoria del Giorno:</strong> {liturgia.santo}
          </p>

          <div
            style={{
              marginTop: "25px",
              padding: "20px",
              background: "#fff8ea",
              borderRadius: "15px",
            }}
          >
            <h3 style={{ color: "#7a0000" }}>
              Vangelo del Giorno
            </h3>

            <p style={{ whiteSpace: "pre-line" }}>
  {liturgia.vangelo}
</p>
          </div>

          <div
            style={{
              marginTop: "20px",
              padding: "20px",
              background: "#fdf4e3",
              borderRadius: "15px",
            }}
          >
            <h3 style={{ color: "#7a0000" }}>
              Una luce sulla Parola
            </h3>

            <p style={{ whiteSpace: "pre-line" }}>
  {liturgia.riflessione}
</p>
          </div>
<section className="mt-8 rounded-3xl border border-[#c9a44c] bg-[#fff8ea] p-5 shadow-lg">
  <div className="text-center mb-4">
    <h2 className="text-xl font-serif text-[#6b1f2b]">
      Segni per la celebrazione
    </h2>

    <p className="mt-2 text-sm italic text-[#6b4b2a]">
      Una selezione pensata per accompagnare il tempo liturgico di oggi.
    </p>
  </div>

  <div className="rounded-2xl border border-[#d6b86a] bg-[#f7edd8] p-2 shadow-inner">
    <img
      src="https://images.unsplash.com/photo-1507692049790-de58290a4334"
      alt="Segni per la celebrazione"
      className="w-full rounded-xl object-cover"
    />
  </div>

  <div className="mt-5 text-center">
    <a
      href="https://www.genesiartesacra.it/shop/"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block rounded-full bg-[#6b1f2b] px-6 py-3 text-sm font-semibold text-white shadow-md"
    >
      Scopri i prodotti del momento
    </a>
  </div>
</section>
          <div
            style={{
              marginTop: "20px",
              padding: "20px",
              background: "#fff8ea",
              borderRadius: "15px",
            }}
          >
            <h3 style={{ color: "#7a0000" }}>
              Prodotti consigliati
            </h3>

            <div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  }}
>
  {liturgia.prodotti.map((p, index) => (
    <div
      key={index}
      style={{
        background: "#fffdfa",
        borderRadius: "15px",
        padding: "20px",
        border: "1px solid #d4b06a",
      }}
    >
      <h4 style={{ color: "#7a0000", marginBottom: "10px" }}>
        {p.nome}
      </h4>

      <p>{p.nota}</p>

      <p
        style={{
          marginTop: "10px",
          fontWeight: "bold",
          color: "#7a0000",
        }}
      >
        {p.prezzo}
      </p>

      <button
        style={{
          marginTop: "15px",
          background: "#7a0000",
          color: "#fff",
          border: "none",
          padding: "10px 18px",
          borderRadius: "10px",
          cursor: "pointer",
        }}
      >
        Dettagli e acquisto
      </button>
    </div>
  ))}
</div>
          </div>

          <div
            style={{
              marginTop: "30px",
              display: "flex",
              gap: "15px",
              flexWrap: "wrap",
            }}
          >
            <a
              href="https://liturgico.chiesacattolica.it/"
              target="_blank"
              rel="noreferrer"
              style={{
                background: "#7a0000",
                color: "white",
                padding: "12px 20px",
                borderRadius: "10px",
                textDecoration: "none",
              }}
            >
              Per approfondire
            </a>

            <button
  onClick={() => {
    const password = prompt("Inserisci password Admin");

    if (password === "ars2026") {
      setAdminMode(!adminMode);
    } else {
      alert("Password errata");
    }
  }}
  style={{
    marginTop: "20px",
    padding: "10px 18px",
    borderRadius: "50%",
    border: "1px solid #d4af37",
    background: "transparent",
    color: "#d4af37",
    cursor: "pointer",
    fontSize: "18px",
  }}
>
  ⚙️
</button>
          </div>
        </div>

        {adminMode && (
          <div
            style={{
              marginTop: "40px",
              background: "#fff8ea",
              color: "#3a1c00",
              borderRadius: "20px",
              padding: "30px",
            }}
          >
            <h2
              style={{
                marginBottom: "20px",
                color: "#7a0000",
              }}
            >
              Area Admin Liturgia
            </h2>

            <input
              type="text"
              placeholder="Data"
              value={formData.data}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  data: e.target.value,
                })
              }
              style={inputStyle}
            />

            <input
              type="text"
              placeholder="Tempo Liturgico"
              value={formData.tempo}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tempo: e.target.value,
                })
              }
              style={inputStyle}
            />

            <input
              type="text"
              placeholder="Colore"
              value={formData.colore}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  colore: e.target.value,
                })
              }
              style={inputStyle}
            />

            <textarea
              placeholder="Vangelo"
              value={formData.vangelo}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  vangelo: e.target.value,
                })
              }
              style={textareaStyle}
            />

            <textarea
              placeholder="Riflessione"
              value={formData.riflessione}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  riflessione: e.target.value,
                })
              }
              style={textareaStyle}
            />

            <button
              onClick={salvaModifiche}
              style={{
                background: "#7a0000",
                color: "white",
                border: "none",
                padding: "14px 24px",
                borderRadius: "10px",
                cursor: "pointer",
                marginTop: "20px",
              }}
            >
              Salva Liturgia
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "14px",
  marginBottom: "18px",
  borderRadius: "12px",
  border: "1px solid #d4af37",
  background: "#fffdf7",
  color: "#3a1c00",
  fontSize: "16px",
  boxSizing: "border-box",
};

const textareaStyle = {
  width: "100%",
  minHeight: "120px",
  padding: "12px",
  marginBottom: "15px",
  borderRadius: "10px",
  border: "1px solid #ccc",
};

