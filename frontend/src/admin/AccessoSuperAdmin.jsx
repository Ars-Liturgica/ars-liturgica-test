import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function AccessoSuperAdmin({
  tornaHome,
  accessoConsentito,
}) {
  const [email, setEmail] = useState("");
  const [codiceOtp, setCodiceOtp] = useState("");
  const [otpInviato, setOtpInviato] = useState(false);
  const [invioInCorso, setInvioInCorso] = useState(false);
  const [verificaInCorso, setVerificaInCorso] = useState(false);
  const [messaggio, setMessaggio] = useState("");
  const [errore, setErrore] = useState("");

  useEffect(() => {
    controllaSessioneEsistente();
  }, []);

  async function controllaSessioneEsistente() {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error(
        "Errore durante il controllo della sessione:",
        sessionError
      );
      return;
    }

    if (session?.user?.email) {
 const autorizzato = await controllaAmministratore(
  session.user.id
);

      if (autorizzato) {
        accessoConsentito();
      }
    }
  }

 async function controllaAmministratore(utenteId) {
  const { data, error } = await supabase
    .from("amministratori")
    .select("utente_id")
    .eq("utente_id", utenteId)
    .eq("livello", "superadmin")
    .eq("attivo", true)
    .maybeSingle();

  if (error) {
    console.error(
      "Errore durante il controllo dell'amministratore:",
      error
    );

    setErrore(
      "Non è stato possibile verificare l'autorizzazione amministrativa."
    );

    return false;
  }

  return Boolean(data);
}
  async function inviaOtp() {
    setErrore("");
    setMessaggio("");

    const emailPulita = email.toLowerCase().trim();

    if (!emailPulita) {
      setErrore("Inserisci l'indirizzo email.");
      return;
    }

    setInvioInCorso(true);

    const { error } = await supabase.auth.signInWithOtp({
      email: emailPulita,
      options: {
        shouldCreateUser: false,
      },
    });

    setInvioInCorso(false);

    if (error) {
      console.error("Errore durante l'invio dell'OTP:", error);

      setErrore(
        "Non è stato possibile inviare il codice. Controlla l'indirizzo email."
      );

      return;
    }

    setOtpInviato(true);
    setMessaggio(
      "Codice inviato. Controlla la tua casella email."
    );
  }

  async function verificaOtp() {
    setErrore("");
    setMessaggio("");

    const emailPulita = email.toLowerCase().trim();
    const codicePulito = codiceOtp.trim();

    if (!codicePulito) {
      setErrore("Inserisci il codice ricevuto via email.");
      return;
    }

    setVerificaInCorso(true);

    const { data, error } = await supabase.auth.verifyOtp({
      email: emailPulita,
      token: codicePulito,
      type: "email",
    });

    if (error) {
      console.error("Errore durante la verifica dell'OTP:", error);

      setVerificaInCorso(false);
      setErrore("Il codice inserito non è valido oppure è scaduto.");
      return;
    }

    const emailVerificata = data.user?.email;

    if (!emailVerificata) {
      setVerificaInCorso(false);
      setErrore("Non è stato possibile identificare l'utente.");
      return;
    }

  const autorizzato = await controllaAmministratore(
  utente.id
);

    setVerificaInCorso(false);

    if (!autorizzato) {
      await supabase.auth.signOut();

      setErrore(
        "Accesso negato. Questo account non è autorizzato ad amministrare Ars Liturgica."
      );

      return;
    }

    accessoConsentito();
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px 20px",
        background:
          "radial-gradient(circle at top, #301010 0%, #130303 48%, #050101 100%)",
        color: "#f5e6c8",
        fontFamily: "serif",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "720px",
          margin: "0 auto",
        }}
      >
        <button
          type="button"
          onClick={tornaHome}
          style={{
            border: "1px solid #b99542",
            background: "transparent",
            color: "#e6c66d",
            padding: "10px 18px",
            borderRadius: "10px",
            cursor: "pointer",
            marginBottom: "35px",
            fontSize: "15px",
          }}
        >
          ← Torna alla Home
        </button>

        <div
          style={{
            position: "relative",
            overflow: "hidden",
            padding: "54px 42px",
            borderRadius: "28px",
            border: "1px solid #c8a14b",
            background:
              "linear-gradient(145deg, rgba(45,11,11,0.98), rgba(14,3,3,0.98))",
            boxShadow:
              "0 25px 70px rgba(0,0,0,0.55), inset 0 0 40px rgba(212,175,55,0.05)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "0",
              left: "0",
              right: "0",
              height: "5px",
              background:
                "linear-gradient(90deg, transparent, #d4af37, transparent)",
            }}
          />

          <p
            style={{
              margin: "0 0 12px",
              textAlign: "center",
              color: "#c7a552",
              letterSpacing: "4px",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            ACCESSO RISERVATO
          </p>

          <h1
            style={{
              margin: "0",
              textAlign: "center",
              color: "#f2d67c",
              fontSize: "46px",
              lineHeight: "1.1",
            }}
          >
            Console SuperAdmin
          </h1>

          <p
            style={{
              margin: "18px 0 40px",
              textAlign: "center",
              color: "#d8c49a",
              fontSize: "18px",
            }}
          >
            Amministrazione della piattaforma Ars Liturgica
          </p>

          <div
            style={{
              marginBottom: "22px",
            }}
          >
            <label
              htmlFor="email-superadmin"
              style={{
                display: "block",
                marginBottom: "9px",
                color: "#ead8aa",
                fontWeight: "bold",
              }}
            >
              Email amministratore
            </label>

            <input
              id="email-superadmin"
              type="email"
              value={email}
              disabled={otpInviato}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Inserisci l'email autorizzata"
              autoComplete="email"
              style={{
                width: "100%",
                padding: "15px 16px",
                boxSizing: "border-box",
                borderRadius: "11px",
                border: "1px solid #856c35",
                background: "#180707",
                color: "#fff4d4",
                fontSize: "16px",
                outline: "none",
              }}
            />
          </div>

          {!otpInviato && (
            <button
              type="button"
              onClick={inviaOtp}
              disabled={invioInCorso}
              style={{
                width: "100%",
                padding: "15px",
                border: "1px solid #ebcf76",
                borderRadius: "11px",
                background:
                  "linear-gradient(180deg, #d4af37, #92701d)",
                color: "#1b0800",
                fontWeight: "bold",
                fontSize: "17px",
                cursor: invioInCorso ? "not-allowed" : "pointer",
                opacity: invioInCorso ? 0.7 : 1,
              }}
            >
              {invioInCorso
                ? "Invio del codice..."
                : "Invia codice di accesso"}
            </button>
          )}

          {otpInviato && (
            <>
              <div
                style={{
                  marginTop: "24px",
                  marginBottom: "22px",
                }}
              >
                <label
                  htmlFor="otp-superadmin"
                  style={{
                    display: "block",
                    marginBottom: "9px",
                    color: "#ead8aa",
                    fontWeight: "bold",
                  }}
                >
                  Codice ricevuto via email
                </label>

                <input
                  id="otp-superadmin"
                  type="text"
                  inputMode="numeric"
                  value={codiceOtp}
                  onChange={(event) =>
                    setCodiceOtp(event.target.value)
                  }
                  placeholder="Inserisci il codice OTP"
                  autoComplete="one-time-code"
                  style={{
                    width: "100%",
                    padding: "15px 16px",
                    boxSizing: "border-box",
                    borderRadius: "11px",
                    border: "1px solid #856c35",
                    background: "#180707",
                    color: "#fff4d4",
                    fontSize: "20px",
                    textAlign: "center",
                    letterSpacing: "6px",
                    outline: "none",
                  }}
                />
              </div>

              <button
                type="button"
                onClick={verificaOtp}
                disabled={verificaInCorso}
                style={{
                  width: "100%",
                  padding: "15px",
                  border: "1px solid #ebcf76",
                  borderRadius: "11px",
                  background:
                    "linear-gradient(180deg, #d4af37, #92701d)",
                  color: "#1b0800",
                  fontWeight: "bold",
                  fontSize: "17px",
                  cursor: verificaInCorso
                    ? "not-allowed"
                    : "pointer",
                  opacity: verificaInCorso ? 0.7 : 1,
                }}
              >
                {verificaInCorso
                  ? "Verifica in corso..."
                  : "Entra nella Console"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setOtpInviato(false);
                  setCodiceOtp("");
                  setErrore("");
                  setMessaggio("");
                }}
                style={{
                  display: "block",
                  margin: "18px auto 0",
                  border: "none",
                  background: "transparent",
                  color: "#cdbb91",
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Cambia indirizzo email
              </button>
            </>
          )}

          {messaggio && (
            <div
              style={{
                marginTop: "24px",
                padding: "13px 16px",
                borderRadius: "10px",
                border: "1px solid #8b793f",
                background: "rgba(181,148,55,0.12)",
                color: "#f2dfa0",
                textAlign: "center",
              }}
            >
              {messaggio}
            </div>
          )}

          {errore && (
            <div
              style={{
                marginTop: "24px",
                padding: "13px 16px",
                borderRadius: "10px",
                border: "1px solid #a74b4b",
                background: "rgba(140,20,20,0.22)",
                color: "#ffd1d1",
                textAlign: "center",
              }}
            >
              {errore}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
