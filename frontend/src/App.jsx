import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import AccessoRiservato from "./AccessoRiservato";
import RegistrazioneParroco from "./parrocchia/RegistrazioneParroco";
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

 const salvaModifiche = async () => {
  const datiSupabase = {
    id: 1,
    data: formData.data,
    tempo_liturgico: formData.tempo,
    colore_liturgico: formData.colore,
    memoria_santo: formData.santo,
    riferimento_vangelo: formData.vangelo,
    una_luce_sulla_parola: formData.riflessione,
    link_cei: formData.linkCei,
  };
const datiCategorie = {
  id: 1,
  categoria_principale: formData.categoriaPrincipale,
  categoria_consigliata_1: formData.categoriaConsigliata1,
  categoria_consigliata_2: formData.categoriaConsigliata2,
  categoria_consigliata_3: formData.categoriaConsigliata3,
  categoria_consigliata_4: formData.categoriaConsigliata4,
  categoria_consigliata_5: formData.categoriaConsigliata5,
};
  const { error } = await supabase
    .from("liturgia_giorno")
    .upsert(datiSupabase);
const { error: errorCategorie } = await supabase
  .from("categorie_app")
  .upsert(datiCategorie);
  if (error) {
    console.error("Errore Supabase:", error);
    alert("Errore nel salvataggio su Supabase");
    return;
  }
if (errorCategorie) {
  console.error("Errore salvataggio categorie Supabase:", errorCategorie);
  alert("Errore nel salvataggio categorie su Supabase");
  return;
}
  setLiturgia(formData);
  localStorage.setItem("liturgia_v2", JSON.stringify(formData));
  alert("Liturgia salvata su Supabase correttamente");
  setAdminMode(false);
   };
   useEffect(() => {
  async function caricaLiturgia() {
    const { data, error } = await supabase
      .from("liturgia_giorno")
      .select("*")
      .eq("id", 1)
      .single();
const { data: categorieSalvate, error: errorCategorieLettura } = await supabase
  .from("categorie_app")
  .select("*")
  .eq("id", 1)
  .maybeSingle();
    if (error) {
      console.error("Errore lettura Supabase:", error);
      return;
    }

    const datiApp = {
      data: data.data,
      tempo: data.tempo_liturgico,
      colore: data.colore_liturgico,
      santo: data.memoria_santo,
      vangelo: data.riferimento_vangelo,
      riflessione: data.una_luce_sulla_parola,
      linkCei: data.link_cei,
     categoriaPrincipale: categorieSalvate?.categoria_principale || "",
categoriaConsigliata1: categorieSalvate?.categoria_consigliata_1 || "",
categoriaConsigliata2: categorieSalvate?.categoria_consigliata_2 || "",
categoriaConsigliata3: categorieSalvate?.categoria_consigliata_3 || "",
categoriaConsigliata4: categorieSalvate?.categoria_consigliata_4 || "",
categoriaConsigliata5: categorieSalvate?.categoria_consigliata_5 || "",
    };

    setLiturgia(datiApp);
    setFormData(datiApp);
  }

  caricaLiturgia();
}, []);

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
              fontSize: "54px",
              marginBottom: "5px",
            }}
          >
            Ars Liturgica
          </h1>

          <p
            style={{
              color: "#f0d9a7",
              fontStyle: "italic",
               fontSize: "24px",
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
              fontSize: "42px",
            }}
          >
            Liturgia del Giorno
          </h2>
<div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "28px",
    alignItems: "stretch",
    marginTop: "25px",
    marginBottom: "25px"
  }}
>
 <div style={{ paddingTop: "40px" }}> 
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
<div>
          <div
            style={{
              marginTop: "0px",
              padding: "20px",
              background: "transparent",
              borderRadius: "15px",
            }}
          >
            <h3 style={{ color: "#7a0000", marginBottom: "10px" }}>
  Vangelo del Giorno
</h3>

<p style={{ whiteSpace: "pre-line", marginBottom: "22px" }}>
{liturgia.vangelo}
</p>
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
  </div>
</div>
          <div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    margin: "50px 0 30px 0"
  }}
>
  <div
    style={{
      flex: 1,
      height: "1px",
      background: "#d4b06a"
    }}
  />
  
  <div
    style={{
      color: "#d4b06a",
      fontSize: "26px",
      lineHeight: 1
    }}
  >
    ✠
  </div>

  <div
    style={{
      flex: 1,
      height: "1px",
      background: "#d4b06a"
    }}
  />
</div>
<AccessoRiservato />
          
<section className="mt-8 rounded-3xl border border-[#c9a44c] bg-[#fff8ea] p-5 shadow-lg">
  <div className="text-center mb-4">
    <h2 style={{ color: "#7a0000", textAlign: "center", fontSize: "42px", fontFamily: "serif", marginBottom: "12px" }}>
      Per la Celebrazione
    </h2>

    <p style={{ textAlign: "center", fontSize: "18px", color: "#6b4b2a", fontStyle: "italic", marginTop: "8px" }}>
      Strumenti e segni scelti per accompagnare il servizio liturgico.
    </p>
  </div>

 <div
  className="rounded-2xl border border-[#d6b86a] bg-[#f7edd8] p-2 shadow-inner overflow-hidden"
  style={{ maxHeight: "360px" }}
>
  <img
    src="/calice-liturgia.jpg.png"
    alt="Segni per la celebrazione"
    style={{
      width: "80%",
      height: "340px",
      objectFit: "cover",
      borderRadius: "14px",
      display: "block",
      margin: "0 auto"
    }}
  />
</div>

  <div style={{ marginTop: "35px", textAlign: "center", marginLeft: "40px" }}>
    <a
      href="https://www.genesiartesacra.it/shop/"
      target="_blank"
      rel="noopener noreferrer"
      style={{
  display: "inline-block",
  background: "#7a0000",
  color: "#ffffff",
  padding: "14px 28px",
  borderRadius: "999px",
  textDecoration: "none",
  fontWeight: "600",
  fontSize: "16px",
  boxShadow: "0 4px 12px rgba(122,0,0,0.25)"
}}
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
   (categoria) => categoria.slug === liturgia.categoriaPrincipale
  )?.image?.src ||
  "/b28bd6bf-f2f6-4aaf-87d5-bdb289c86571.png"
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
{categorie.find((categoria) => categoria.slug === liturgia.categoriaPrincipale)?.name || "Seleziona una categoria"}
</h1>

   

    <a
      href={
  "https://www.genesiartesacra.it/product-category/" +
 liturgia.categoriaPrincipale +
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

