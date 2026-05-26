export default function LiturgiaManager() {
  return (
    <div style={{
      background: "#2b0000",
      minHeight: "100vh",
      color: "#f5e6c8",
      padding: "30px",
      fontFamily: "serif"
    }}>
      
      <h1 style={{
        color: "#d4a017",
        fontSize: "42px",
        marginBottom: "10px"
      }}>
        Ars Liturgica
      </h1>

      <h2 style={{
        marginBottom: "30px",
        fontWeight: "normal"
      }}>
        Regia Liturgica Privata
      </h2>

      <div style={{
        background: "#f5e6c8",
        color: "#2b0000",
        padding: "25px",
        borderRadius: "18px",
        maxWidth: "700px"
      }}>

        <h3>Liturgia del Giorno</h3>

        <p>Data liturgica</p>
        <input type="text" placeholder="2026-05-26" style={inputStyle} />

        <p>Tempo liturgico</p>
        <input type="text" placeholder="Tempo Ordinario" style={inputStyle} />

        <p>Colore liturgico</p>
        <input type="text" placeholder="Verde" style={inputStyle} />

        <p>Memoria / Santo</p>
        <input type="text" placeholder="San Filippo Neri" style={inputStyle} />

        <p>Vangelo del giorno</p>
        <textarea placeholder="Inserisci il Vangelo..." style={textareaStyle}></textarea>

        <p>Una luce sulla Parola</p>
        <textarea placeholder="Breve spunto meditativo..." style={textareaStyle}></textarea>

        <p>Link CEI</p>
        <input type="text" placeholder="https://www.chiesacattolica.it/" style={inputStyle} />

        <button style={buttonStyle}>
          Salva Liturgia
        </button>

      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "18px",
  borderRadius: "10px",
  border: "1px solid #ccc"
};

const textareaStyle = {
  width: "100%",
  height: "120px",
  padding: "12px",
  marginBottom: "18px",
  borderRadius: "10px",
  border: "1px solid #ccc"
};

const buttonStyle = {
  background: "#7a0000",
  color: "#f5e6c8",
  padding: "14px 24px",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  fontSize: "16px"
};
