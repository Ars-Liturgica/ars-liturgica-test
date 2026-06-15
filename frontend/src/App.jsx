import React, { useState, useEffect } from "react";

export default function App() {
  const [adminMode, setAdminMode] = useState(false);
const [categorie, setCategorie] = useState([]);
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
      categoriaPrincipale: "",
categoriaConsigliata1: "",
categoriaConsigliata2: "",
categoriaConsigliata3: "",
categoriaConsigliata4: "",
categoriaConsigliata5: "",
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
  setAdminMode(false);
};
useEffect(() => {
  fetch("/api/categorie")
    .then((res) => res.json())
    .then((data) => {
      console.log("Categorie WooCommerce:", data);

      setCategorie(data);
    })
    .catch((error) => {
      console.error("Errore caricamento categorie WooCommerce:", error);
    });
}, []);
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(to bottom, #2b0000, #4a0d0d, #1f0000)",
        color: "#f5e6c8",
        fontFamily: "serif",
        padding: "36px 20px 28px",
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
  background: "linear-gradient(180deg, #fff8ea 0%, #f8efd8 100%)",
  color: "#3a1c00",
           position: "relative", 
  borderRadius: "34px",
  padding: "48px 46px",
  border: "3px solid #d4b06a",
   outline: "2px solid #e8c879",
outlineOffset: "-12px",         
  boxShadow: "0 0 0 6px rgba(255,248,226,0.95), 0 18px 45px rgba(0,0,0,0.35), inset 0 0 0 2px #fff2cf",
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
<div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "2px"
  }}
>
          <p style={{ margin: "0 0 10px 0" }}>
            <strong>Data:</strong> {liturgia.data}
          </p>

          <p style={{ margin: "0 0 10px 0" }}>
            <strong>Tempo Liturgico:</strong> {liturgia.tempo}
          </p>

          <p style={{ margin: "0 0 10px 0" }}>
            <strong>Colore Liturgico:</strong> {liturgia.colore}
          </p>

          <p style={{ margin: "0 0 10px 0" }}>
            <strong>Memoria del Giorno:</strong> {liturgia.santo}
          </p>
</div>
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
           <a
              href={liturgia.linkCei || "https://liturgico.chiesacattolica.it/"}
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
<section className="mt-8 rounded-3xl border border-[#c9a44c] bg-[#fff8ea] p-5 shadow-lg">
  <div className="text-center mb-4">
    <h2 className="text-xl font-serif text-[#6b1f2b]">
      Segni per la celebrazione
    </h2>

    <p className="mt-2 text-sm italic text-[#6b4b2a]">
      Una selezione pensata per accompagnare il tempo liturgico di oggi.
    </p>
  </div>

 <div
  className="rounded-2xl border border-[#d6b86a] bg-[#f7edd8] p-2 shadow-inner overflow-hidden"
  style={{ maxHeight: "360px" }}
>
  <img
    src="https://images.unsplash.com/photo-1507692049790-de58290a4334"
    alt="Segni per la celebrazione"
    style={{
      width: "100%",
      height: "340px",
      objectFit: "cover",
      borderRadius: "14px",
      display: "block"
    }}
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
    marginTop: "30px",
    padding: "28px",
    background: "linear-gradient(180deg, #fff8ea 0%, #f7ead0 100%)",
    borderRadius: "24px",
    border: "1px solid #d4b06a",
    boxShadow: "0 8px 24px rgba(122,0,0,0.12)",
  }}
>
  <h2 style={{ color: "#7a0000", textAlign: "center", letterSpacing: "1px" }}>
    Prodotti consigliati per la celebrazione
  </h2>

  <p style={{ textAlign: "center", fontSize: "18px", color: "#3b2a20" }}>
    Strumenti e segni scelti per accompagnare il tempo liturgico e il servizio all’altare.
  </p>

  <div
  style={{
    marginTop: "34px",
padding: "42px 34px",
borderRadius: "30px",
background: "linear-gradient(180deg, #fffdfa 0%, #fff7e6 100%)",
border: "2px solid #d4b06a",
boxShadow: "0 10px 28px rgba(122,0,0,0.10), inset 0 0 0 2px #fff2cf",
    }}
  >
    <p style={{ color: "#9b7a2f", fontWeight: "bold", letterSpacing: "2px", textAlign: "center", fontSize: "22px" }}>
      ✦ CATEGORIA IN EVIDENZA ✦
    </p>
    <img
  src={
  categorie.find(
    (categoria) => categoria.slug === formData.categoriaPrincipale
  )?.image?.src ||
  "https://images.unsplash.com/photo-1512632578888-169bbbc64f33?auto=format&fit=crop&w=1200&q=80"
}
  alt="Paramenti liturgici"
  style={{
    width: "auto",
maxWidth: "560px",
height: "auto",
    maxHeight: "360px",
objectFit: "contain",
backgroundColor: "#fffdf8",
display: "block",
margin: "24px auto 18px",
borderRadius: "10px",
padding: "0px",
background: "#fffdf8",
border: "2px solid #d4b06a",
boxShadow: "0 8px 22px rgba(122,0,0,0.10)"
  }}
/>

   <h1 style={{ color: "#7a0000", fontSize: "42px" }}>
  {categorie.find((categoria) => categoria.slug === formData.categoriaPrincipale)?.name || "Seleziona una categoria"}
</h1>

    <p style={{ fontSize: "18px", lineHeight: "1.6", color: "#3b2a20" }}>
      Vesti che esprimono la bellezza del culto e accompagnano il mistero celebrato.
    </p>

    <a
      href={
  "https://www.genesiartesacra.it/product-category/" +
  formData.categoriaPrincipale +
  "/"
}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-block",
        marginTop: "20px",
        background: "#7a0000",
        color: "#fff",
        padding: "14px 24px",
        borderRadius: "12px",
        textDecoration: "none",
        fontWeight: "bold",
      }}
    >
      Scopri la categoria →
    </a>
  </div>

  <h3
    style={{
      marginTop: "35px",
      textAlign: "center",
      color: "#7a0000",
      letterSpacing: "1px",
    }}
  >
    Categorie consigliate
  </h3>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
      gap: "18px",
      marginTop: "20px",
    }}
  >
    {[
  formData.categoriaConsigliata1,
  formData.categoriaConsigliata2,
  formData.categoriaConsigliata3,
  formData.categoriaConsigliata4,
  formData.categoriaConsigliata5,
]
  .map((slug) => categorie.find((categoria) => categoria.slug === slug))
  .filter(Boolean)
  .map((categoria, index) => (
      <div
        key={index}
        style={{
          background: "#fffdfa",
          border: "1px solid #d4b06a",
          borderRadius: "18px",
          padding: "18px",
          textAlign: "center",
          boxShadow: "0 6px 18px rgba(122,0,0,0.10)",
        }}
      >
        {categoria.image?.src && (
  <img
    src={categoria.image.src}
    alt={categoria.name}
    style={{
      width: "100%",
      height: "130px",
      objectFit: "cover",
      borderRadius: "14px",
      marginBottom: "12px",
      border: "2px solid #d4b06a",
    }}
  />
)}
        <h4 style={{ color: "#7a0000" }}>{categoria.name}</h4>

        <a
         href={"https://www.genesiartesacra.it/product-category/" + categoria.slug + "/"}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            marginTop: "10px",
            background: "#7a0000",
            color: "#fff",
            padding: "10px 14px",
            borderRadius: "10px",
            textDecoration: "none",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          Apri la categoria
        </a>
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
            <input
  type="text"
  placeholder="Memoria / Santo"
  value={formData.santo}
  onChange={(e) =>
    setFormData({
      ...formData,
      santo: e.target.value,
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
<input
  type="text"
  placeholder="Link CEI del giorno"
  value={formData.linkCei}
  onChange={(e) =>
    setFormData({
      ...formData,
      linkCei: e.target.value,
    })
  }
  style={inputStyle}
/>
<h3
  style={{
    color: "#7a0000",
    marginTop: "30px",
    marginBottom: "15px",
  }}
>
  Area Categorie
</h3>

            <p style={{ marginBottom: "8px", fontWeight: "bold" }}>
  Categoria Principale
</p>

<select
  value={formData.categoriaPrincipale}
  onChange={(e) =>
    setFormData({
      ...formData,
      categoriaPrincipale: e.target.value,
    })
  }
  style={inputStyle}
>
  <option value="">Seleziona categoria principale</option>
  {categorie.map((categoria) => (
    <option key={categoria.id} value={categoria.slug}>
      {categoria.name}
    </option>
  ))}
</select>
<p style={{ marginBottom: "8px", fontWeight: "bold" }}>
  Categoria Consigliata 1
</p>

<select
  value={formData.categoriaConsigliata1}
  onChange={(e) =>
    setFormData({
      ...formData,
      categoriaConsigliata1: e.target.value,
    })
  }
  style={inputStyle}
>
  <option value="">Seleziona categoria consigliata 1</option>
  {categorie.map((categoria) => (
    <option key={categoria.id} value={categoria.slug}>
      {categoria.name}
    </option>
  ))}
</select>

<select
  value={formData.categoriaConsigliata2}
  onChange={(e) =>
    setFormData({
      ...formData,
      categoriaConsigliata2: e.target.value,
    })
  }
  style={inputStyle}
>
  <option value="">Seleziona categoria consigliata 2</option>
  {categorie.map((categoria) => (
    <option key={categoria.id} value={categoria.slug}>
      {categoria.name}
    </option>
  ))}
</select>
    <p style={{ marginBottom: "8px", fontWeight: "bold" }}>
  Categoria Consigliata 3
</p>

<select
  value={formData.categoriaConsigliata3}
  onChange={(e) =>
    setFormData({
      ...formData,
      categoriaConsigliata3: e.target.value,
    })
  }
  style={inputStyle}
>
  <option value="">Seleziona categoria consigliata 3</option>
  {categorie.map((categoria) => (
    <option key={categoria.id} value={categoria.slug}>
      {categoria.name}
    </option>
  ))}
</select>
  <p style={{ marginBottom: "8px", fontWeight: "bold" }}>
  Categoria Consigliata 4
</p>

<select
  value={formData.categoriaConsigliata4}
  onChange={(e) =>
    setFormData({
      ...formData,
      categoriaConsigliata4: e.target.value,
    })
  }
  style={inputStyle}
>
  <option value="">Seleziona categoria consigliata 4</option>
  {categorie.map((categoria) => (
    <option key={categoria.id} value={categoria.slug}>
      {categoria.name}
    </option>
  ))}
</select>
            <p style={{ marginBottom: "8px", fontWeight: "bold" }}>
  Categoria Consigliata 5
</p>

<select
  value={formData.categoriaConsigliata5}
  onChange={(e) =>
    setFormData({
      ...formData,
      categoriaConsigliata5: e.target.value,
    })
  }
  style={inputStyle}
>
  <option value="">Seleziona categoria consigliata 5</option>
  {categorie.map((categoria) => (
    <option key={categoria.id} value={categoria.slug}>
      {categoria.name}
    </option>
  ))}
</select>
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

