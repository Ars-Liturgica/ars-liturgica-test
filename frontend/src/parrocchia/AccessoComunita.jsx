import React, { useState, useRef } from "react";
import LaMiaParrocchia from "./LaMiaParrocchia";
import { supabase } from "../supabaseClient";
function AccessoComunita({ tornaHome }) {
 const [messaggio, setMessaggio] = useState("");
const [parrocchieTrovate, setParrocchieTrovate] = useState([]);
 const [parrocchiaSelezionata, setParrocchiaSelezionata] = useState(null);
 const [datiUtente, setDatiUtente] = useState(null);
 const [identificativo, setIdentificativo] = useState("");
const [salvataggioInCorso, setSalvataggioInCorso] = useState(false);
 
const [mostraMiaParrocchia, setMostraMiaParrocchia] = useState(false);
const risultatoParrocchiaRef = useRef(null);

const normalizzaTesto = (testo) =>
  String(testo || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const handleRicercaParrocchia = async (e) => {
  e.preventDefault();

  setMessaggio("");
  setParrocchieTrovate([]);

  const datiModulo = new FormData(e.currentTarget);
  const cittaInserita = String(datiModulo.get("Città") || "").trim();
  const capInserito = String(datiModulo.get("CAP") || "").trim();
setDatiUtente({
  nome: String(datiModulo.get("Nome") || "").trim(),
  cognome: String(datiModulo.get("Cognome") || "").trim(),
  email: String(datiModulo.get("Email") || "").trim(),
  telefono: String(datiModulo.get("Cellulare") || "").trim(),
  citta: cittaInserita,
  cap: capInserito,
});
 const nomeInserito = String(datiModulo.get("Nome") || "").trim();
const cognomeInserito = String(datiModulo.get("Cognome") || "").trim();

setIdentificativo(`${nomeInserito} ${cognomeInserito}`.trim());
  try {
    const { data, error } = await supabase
      .from("parrocchie")
      .select("*")
      .eq("cap", capInserito);

    if (error) {
      throw error;
    }

  

   if (!data || data.length === 0) {
      setMessaggio(
        "Non abbiamo trovato alcuna parrocchia compatibile con la città e il CAP inseriti."
      );
      return;
    }

    setParrocchieTrovate(data);
   setMessaggio(
  "Abbiamo trovato le parrocchie presenti nel CAP inserito. Scegli la tua."
);
    setTimeout(() => {
      risultatoParrocchiaRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  } catch (errore) {
    console.error("Errore durante la ricerca della parrocchia:", errore);
    setMessaggio(
      "Non è stato possibile cercare la parrocchia. Riprova tra poco."
    );
  }
};
 const handleEntraParrocchia = async () => {
if (!datiUtente || !parrocchiaSelezionata) return;

  const idScelto = identificativo.trim();

  if (!idScelto) {
    setMessaggio(
      "Scegli come vuoi essere riconosciuto quando torni nella tua parrocchia."
    );
    return;
  }

  setSalvataggioInCorso(true);
  setMessaggio("");

  try {
    const { data: nuovoUtenteId, error } = await supabase.rpc(
      "iscrivi_fedele",
      {
        p_nome: datiUtente.nome,
        p_cognome: datiUtente.cognome,
        p_email: datiUtente.email || "",
        p_telefono: datiUtente.telefono || "",
        p_citta: datiUtente.citta,
        p_cap: datiUtente.cap,
        p_identificativo: idScelto,
       p_parrocchia_id: parrocchiaSelezionata.id,
      }
    );

    if (error) {
      if (
        String(error.message || "")
          .toLowerCase()
          .includes("identificativo")
      ) {
        setMessaggio(
          "Questo identificativo è già utilizzato. Modificalo leggermente e riprova."
        );
        return;
      }

      throw error;
    }

    localStorage.setItem("ars_utente_id", nuovoUtenteId);
  localStorage.setItem("ars_parrocchia_id", parrocchiaSelezionata.id);
localStorage.setItem("ars_nome_parrocchia", parrocchiaSelezionata.nome);
    localStorage.setItem("ars_identificativo", idScelto);

    setMostraMiaParrocchia(true);
  } catch (errore) {
    console.error(
      "Errore durante l'iscrizione alla parrocchia:",
      errore
    );

    setMessaggio(
      "Non è stato possibile completare l'iscrizione. Riprova tra poco."
    );
  } finally {
    setSalvataggioInCorso(false);
  }
};
if (mostraMiaParrocchia) {
  return <LaMiaParrocchia />;
}
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f1e6",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 20px",
        fontFamily: "Georgia, serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "560px",
          background: "#fffaf0",
          border: "2px solid #8b1e2d",
          borderRadius: "22px",
          padding: "34px",
          boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
          textAlign: "center",
        }}
      >
        <h1 style={{ color: "#8b1e2d", marginBottom: "6px" }}>
          Ars Liturgica
        </h1>

        <p style={{ color: "#8a6d2f", marginTop: 0, marginBottom: "28px" }}>
          Al servizio della celebrazione
        </p>

     <h2 style={{ color: "#2f3a4a", marginBottom: "12px" }}>
  Unisciti alla tua Comunità Parrocchiale
</h2>

        <p style={{ color: "#4a4a4a", lineHeight: "1.5", marginBottom: "26px" }}>
       Compila i dati richiesti per individuare la tua parrocchia e iniziare il percorso di accesso alla comunità.
        </p>
<p
  style={{
    fontStyle: "italic",
    color: "#6b5d4a",
    fontSize: "15px",
    marginBottom: "24px",
  }}
>
  Ti accompagneremo passo dopo passo fino all'ingresso nella tua comunità.
</p>
        <form onSubmit={handleRicercaParrocchia}>
          {["Nome", "Cognome", "Email", "Cellulare", "Città", "CAP"].map(
            (campo) => (
              <input
                key={campo}
               name={campo}
                type={campo === "Email" ? "email" : "text"}
             placeholder={
  campo === "Email" || campo === "Cellulare"
    ? campo
    : `${campo} *`
}
               required={campo !== "Email" && campo !== "Cellulare"}
                style={{
                  width: "100%",
                  padding: "13px",
                  marginBottom: "14px",
                  borderRadius: "10px",
                  border: "1px solid #c9b27c",
                  fontSize: "15px",
                  boxSizing: "border-box",
                }}
              />
            )
          )}
<p
  style={{
    fontSize: "13px",
    color: "#6b5d4a",
    marginBottom: "18px",
    fontStyle: "italic",
    lineHeight: "1.4",
    textAlign: "center",
  }}
>
  Email e cellulare sono facoltativi. Se li inserisci, la tua parrocchia potrà inviarti avvisi e comunicazioni.
</p>
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              marginTop: "8px",
              background: "#2f6f4e",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "15px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            CERCA LA TUA PARROCCHIA
          </button>
        </form>

        <p
          style={{
            fontSize: "13px",
            color: "#6b6b6b",
            marginTop: "18px",
            lineHeight: "1.4",
          }}
        >
          Città e CAP saranno utilizzati per individuare la tua parrocchia.
        </p>

        {messaggio && (
          <div
            style={{
              marginTop: "20px",
              padding: "14px",
              borderRadius: "12px",
              background: "#eef7f0",
              color: "#2f6f4e",
              border: "1px solid #8fc49d",
              fontSize: "14px",
              lineHeight: "1.4",
            }}
          >
            ✅ {messaggio}
          </div>
        )}
{parrocchieTrovate.length > 0 && (
  <div ref={risultatoParrocchiaRef}
    style={{
      marginTop: "18px",
      padding: "18px",
      borderRadius: "14px",
      background: "#fffaf0",
      border: "1px solid #d6b56d",
      color: "#2f3a4a",
      lineHeight: "1.5",
    }}
  >
   <strong>Scegli la tua parrocchia:</strong>
    <br />
   {parrocchieTrovate.map((parrocchia) => (
  <button
    key={parrocchia.id}
    type="button"
    onClick={() => setParrocchiaSelezionata(parrocchia)}
    style={{
      width: "100%",
      padding: "12px",
      marginTop: "10px",
      background:
        parrocchiaSelezionata?.id === parrocchia.id
          ? "#eef7f0"
          : "#ffffff",
      border:
        parrocchiaSelezionata?.id === parrocchia.id
          ? "2px solid #2f6f4e"
          : "1px solid #d6b56d",
      borderRadius: "10px",
      cursor: "pointer",
      fontSize: "15px",
      fontWeight: "bold",
      color: "#2f3a4a",
    }}
  >
    {parrocchia.nome}
  </button>
))}
<p
  style={{
    marginTop: "18px",
    marginBottom: "8px",
    fontSize: "14px",
    color: "#6b5d4a",
  }}
>
  Come vuoi essere riconosciuto quando torni?
</p>

<input
  type="text"
  value={identificativo}
  onChange={(e) => setIdentificativo(e.target.value)}
  style={{
    width: "100%",
    padding: "13px",
    borderRadius: "10px",
    border: "1px solid #c9b27c",
    fontSize: "15px",
    boxSizing: "border-box",
  }}
/>
    <button
      type="button"
         onClick={handleEntraParrocchia}
     disabled={salvataggioInCorso}
      style={{
        width: "100%",
        padding: "13px",
        marginTop: "16px",
        background: "#8b1e2d",
        color: "white",
        border: "none",
        borderRadius: "12px",
        fontSize: "15px",
        fontWeight: "bold",
        cursor: "pointer",
      }}
    >
      {salvataggioInCorso ? "INGRESSO IN CORSO..." : "ENTRA NELLA MIA PARROCCHIA"}
    </button>
  </div>
)}
        <button
          onClick={tornaHome}
          style={{
            marginTop: "26px",
            background: "transparent",
            border: "none",
            color: "#8b1e2d",
            cursor: "pointer",
            fontSize: "15px",
            textDecoration: "underline",
          }}
        >
          ← Torna alla Home
        </button>
      </div>
    </div>
  );
}

export default AccessoComunita;
