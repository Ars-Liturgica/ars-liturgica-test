import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import AttivazioneParrocchia from "./AttivazioneParrocchia";

export default function AreaPersonaleParroco({
  tornaHome,
  entraParrocchia,
}) {
  const [emailAccesso, setEmailAccesso] = useState("");
  const [codiceOtp, setCodiceOtp] = useState("");
  const [otpInviato, setOtpInviato] = useState(false);
  const [autenticato, setAutenticato] = useState(false);
  const [operazioneInCorso, setOperazioneInCorso] =
    useState(false);

  const [utente, setUtente] = useState(null);
  const [parrocchie, setParrocchie] = useState([]);

  const [mostraAccount, setMostraAccount] =
    useState(false);
  const [modificaAccount, setModificaAccount] =
    useState(false);
  const [mostraAttivazione, setMostraAttivazione] =
    useState(false);

  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [telefono, setTelefono] = useState("");
  const [citta, setCitta] = useState("");
  const [cap, setCap] = useState("");

  const [
    richiestaCancellazioneInAttesa,
    setRichiestaCancellazioneInAttesa,
  ] = useState(false);

  const [messaggio, setMessaggio] = useState("");
  const [errore, setErrore] = useState(false);

  function mostraMessaggio(testo, tipoErrore = false) {
    setMessaggio(testo);
    setErrore(tipoErrore);
  }

  async function inviaCodice() {
    const emailPulita = emailAccesso
      .trim()
      .toLowerCase();

    if (!emailPulita) {
      mostraMessaggio(
        "Inserisci il tuo indirizzo email.",
        true
      );
      return;
    }

    setOperazioneInCorso(true);
    mostraMessaggio("");

    try {
      const { error } =
        await supabase.auth.signInWithOtp({
          email: emailPulita,
          options: {
            shouldCreateUser: false,
          },
        });

      if (error) {
        throw error;
      }

      setOtpInviato(true);

      mostraMessaggio(
        `Il codice personale è stato inviato a ${emailPulita}.`
      );
    } catch (error) {
      console.error(
        "Errore invio OTP Area Personale:",
        error
      );

      mostraMessaggio(
        error?.message ||
          "Non è stato possibile inviare il codice.",
        true
      );
    } finally {
      setOperazioneInCorso(false);
    }
  }

  async function verificaCodice() {
    const emailPulita = emailAccesso
      .trim()
      .toLowerCase();

    const codicePulito = codiceOtp
      .trim()
      .replace(/\s+/g, "");

    if (!codicePulito) {
      mostraMessaggio(
        "Inserisci il codice ricevuto via email.",
        true
      );
      return;
    }

    setOperazioneInCorso(true);
    mostraMessaggio("");

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: emailPulita,
        token: codicePulito,
        type: "email",
      });

      if (error) {
        throw error;
      }

      const {
        data: { user },
        error: erroreAuth,
      } = await supabase.auth.getUser();

      if (erroreAuth) {
        throw erroreAuth;
      }

      if (!user) {
        throw new Error(
          "Account personale non disponibile."
        );
      }

      await caricaAreaPersonale(user.id);

      setAutenticato(true);
      mostraMessaggio("");
    } catch (error) {
      console.error(
        "Errore verifica OTP Area Personale:",
        error
      );

      mostraMessaggio(
        error?.message ||
          "Il codice inserito non è valido.",
        true
      );
    } finally {
      setOperazioneInCorso(false);
    }
  }

  async function caricaAreaPersonale(utenteId) {
    const {
      data: profilo,
      error: erroreProfilo,
    } = await supabase
      .from("utenti")
      .select(
        "id, nome, cognome, email, telefono, citta, cap"
      )
      .eq("id", utenteId)
      .maybeSingle();

    if (erroreProfilo) {
      throw erroreProfilo;
    }

    if (!profilo) {
      throw new Error(
        "Il profilo personale non è stato trovato."
      );
    }

    setUtente(profilo);

    setNome(profilo.nome || "");
    setCognome(profilo.cognome || "");
    setTelefono(profilo.telefono || "");
    setCitta(profilo.citta || "");
    setCap(profilo.cap || "");

    /*
      MULTI-PARROCCHIA:
      nessun .single().
      L'utente può avere 0, 1 o N parrocchie.
    */
    const {
      data: collegamenti,
      error: erroreCollegamenti,
    } = await supabase
      .from("utenti_parrocchie")
      .select("parrocchia_id, ruolo, stato")
      .eq("utente_id", utenteId)
      .eq("stato", "attivo");

    if (erroreCollegamenti) {
      throw erroreCollegamenti;
    }

    if (!collegamenti || collegamenti.length === 0) {
      setParrocchie([]);
    } else {
      const idsParrocchie = collegamenti.map(
        (collegamento) =>
          collegamento.parrocchia_id
      );

      const {
        data: datiParrocchie,
        error: erroreParrocchie,
      } = await supabase
        .from("parrocchie")
        .select("id, nome, diocesi, comune")
        .in("id", idsParrocchie);

      if (erroreParrocchie) {
        throw erroreParrocchie;
      }

      const elencoCompleto = (
        datiParrocchie || []
      )
        .map((parrocchia) => {
          const collegamento =
            collegamenti.find(
              (voce) =>
                voce.parrocchia_id ===
                parrocchia.id
            );

          return {
            ...parrocchia,
            ruolo: collegamento?.ruolo || "",
          };
        })
        .sort((a, b) =>
          (a.nome || "").localeCompare(
            b.nome || "",
            "it",
            { sensitivity: "base" }
          )
        );

      setParrocchie(elencoCompleto);
    }

    await controllaRichiestaCancellazione(
      utenteId
    );
  }

  async function controllaRichiestaCancellazione(
    utenteId
  ) {
    const {
      data,
      error,
    } = await supabase
      .from("richieste_cancellazione_account")
      .select("id, stato, data_richiesta")
      .eq("utente_id", utenteId)
      .eq("stato", "in_attesa")
      .maybeSingle();

    if (error) {
      throw error;
    }

    setRichiestaCancellazioneInAttesa(
      Boolean(data)
    );
  }

  async function salvaAccount() {
    if (!utente?.id) {
      return;
    }

    if (!nome.trim() || !cognome.trim()) {
      mostraMessaggio(
        "Nome e cognome sono obbligatori.",
        true
      );
      return;
    }

    setOperazioneInCorso(true);
    mostraMessaggio("");

    try {
      const datiAggiornati = {
        nome: nome.trim(),
        cognome: cognome.trim(),
        telefono:
          telefono.trim() || null,
        citta:
          citta.trim() || null,
        cap:
          cap.trim() || null,
      };

      const { error } = await supabase
        .from("utenti")
        .update(datiAggiornati)
        .eq("id", utente.id);

      if (error) {
        throw error;
      }

      setUtente((precedente) => ({
        ...precedente,
        ...datiAggiornati,
      }));

      setModificaAccount(false);

      mostraMessaggio(
        "I dati personali sono stati aggiornati."
      );
    } catch (error) {
      console.error(
        "Errore aggiornamento account:",
        error
      );

      mostraMessaggio(
        error?.message ||
          "Non è stato possibile aggiornare i dati.",
        true
      );
    } finally {
      setOperazioneInCorso(false);
    }
  }

  async function richiediCancellazioneAccount() {
    if (!utente?.id) {
      return;
    }

    if (richiestaCancellazioneInAttesa) {
      mostraMessaggio(
        "Hai già una richiesta di cancellazione in attesa di gestione da parte del SuperAdmin."
      );
      return;
    }

    const conferma = window.confirm(
      "Vuoi inviare al SuperAdmin la richiesta di cancellazione del tuo account?\n\nL'account NON verrà cancellato immediatamente. Il SuperAdmin verificherà prima eventuali incarichi e parrocchie ancora attive."
    );

    if (!conferma) {
      return;
    }

    setOperazioneInCorso(true);
    mostraMessaggio("");

    try {
      const { error } = await supabase
        .from(
          "richieste_cancellazione_account"
        )
        .insert({
          utente_id: utente.id,
          stato: "in_attesa",
        });

      if (error) {
        throw error;
      }

      setRichiestaCancellazioneInAttesa(
        true
      );

      mostraMessaggio(
        "La richiesta di cancellazione è stata inviata al SuperAdmin. Il tuo account rimane attivo fino alla conclusione della verifica."
      );
    } catch (error) {
      console.error(
        "Errore richiesta cancellazione account:",
        error
      );

      mostraMessaggio(
        error?.message ||
          "Non è stato possibile inviare la richiesta di cancellazione.",
        true
      );
    } finally {
      setOperazioneInCorso(false);
    }
  }

  async function attivazioneCompletata() {
    setMostraAttivazione(false);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.id) {
        await caricaAreaPersonale(
          user.id
        );
      }

      mostraMessaggio(
        "La nuova parrocchia è stata aggiunta al tuo account."
      );
    } catch (error) {
      console.error(
        "Errore aggiornamento elenco parrocchie:",
        error
      );

      mostraMessaggio(
        "La parrocchia è stata attivata, ma non è stato possibile aggiornare immediatamente l'elenco.",
        true
      );
    }
  }

  function selezionaParrocchia(
    parrocchia
  ) {
    localStorage.setItem(
      "ars_parrocchia_id",
      parrocchia.id
    );

    localStorage.setItem(
      "ars_nome_parrocchia",
      parrocchia.nome || ""
    );

    localStorage.setItem(
      "ars_ruolo",
      parrocchia.ruolo || ""
    );

    if (
      typeof entraParrocchia ===
      "function"
    ) {
      entraParrocchia(parrocchia);
    }
  }

  if (!autenticato) {
    return (
      <div style={pagina}>
        <div style={contenitorePiccolo}>
          <h1 style={titolo}>
            Area Personale
          </h1>

          <p style={testoIntro}>
            Per proteggere il tuo
            account personale,
            l’accesso richiede sempre
            un nuovo codice numerico
            inviato alla tua email.
          </p>

          <input
            type="email"
            placeholder="Email"
            value={emailAccesso}
            disabled={
              otpInviato ||
              operazioneInCorso
            }
            onChange={(evento) =>
              setEmailAccesso(
                evento.target.value
              )
            }
            style={campo}
          />

          {!otpInviato ? (
            <button
              type="button"
              onClick={inviaCodice}
              disabled={
                operazioneInCorso
              }
              style={bottonePrincipale}
            >
              {operazioneInCorso
                ? "Invio in corso..."
                : "Invia il codice"}
            </button>
          ) : (
            <>
              <input
                inputMode="numeric"
                placeholder="Codice ricevuto via email"
                value={codiceOtp}
                onChange={(evento) =>
                  setCodiceOtp(
                    evento.target.value
                  )
                }
                style={campo}
              />

              <button
                type="button"
                onClick={
                  verificaCodice
                }
                disabled={
                  operazioneInCorso
                }
                style={
                  bottonePrincipale
                }
              >
                {operazioneInCorso
                  ? "Verifica in corso..."
                  : "Verifica e accedi"}
              </button>
            </>
          )}

          {messaggio && (
            <div
              style={{
                ...boxMessaggio,
                background: errore
                  ? "#fff0ef"
                  : "#edf8f0",
                color: errore
                  ? "#a12622"
                  : "#1f6b3a",
              }}
            >
              {messaggio}
            </div>
          )}

          <button
            type="button"
            onClick={tornaHome}
            style={
              bottoneSecondario
            }
          >
            Torna alla Home
          </button>
        </div>
      </div>
    );
  }

  if (mostraAttivazione) {
    return (
      <div style={pagina}>
        <AttivazioneParrocchia
          onAttivazioneCompletata={
            attivazioneCompletata
          }
        />

        <div
          style={{
            textAlign: "center",
          }}
        >
          <button
            type="button"
            onClick={() =>
              setMostraAttivazione(
                false
              )
            }
            style={
              bottoneSecondario
            }
          >
            Torna all’Area Personale
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={pagina}>
      <div
        style={contenitoreGrande}
      >
        <div style={intestazione}>
          <div>
            <h1 style={titolo}>
              Area Personale
            </h1>

            <p style={nomeUtente}>
              {utente?.nome}{" "}
              {utente?.cognome}
            </p>

            <p style={emailUtente}>
              {utente?.email}
            </p>
          </div>

          <button
            type="button"
            onClick={tornaHome}
            style={
              bottoneSecondario
            }
          >
            Torna alla Home
          </button>
        </div>

        {messaggio && (
          <div
            style={{
              ...boxMessaggio,
              background: errore
                ? "#fff0ef"
                : "#edf8f0",
              color: errore
                ? "#a12622"
                : "#1f6b3a",
              marginBottom:
                "22px",
            }}
          >
            {messaggio}
          </div>
        )}

        <div
          style={grigliaAzioni}
        >
          <button
            type="button"
            onClick={() =>
              setMostraAccount(
                !mostraAccount
              )
            }
            style={cardAzione}
          >
            <span
              style={iconaGrande}
            >
              👤
            </span>

            <strong>
              IL MIO ACCOUNT
            </strong>

            <span
              style={
                descrizioneCard
              }
            >
              Consulta e aggiorna
              i tuoi dati personali.
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              setMostraAttivazione(
                true
              )
            }
            style={cardAzione}
          >
            <span
              style={iconaGrande}
            >
              ⛪
            </span>

            <strong>
              AGGIUNGI / ATTIVA
              UNA PARROCCHIA
            </strong>

            <span
              style={
                descrizioneCard
              }
            >
              Puoi aggiungere
              nuove parrocchie
              senza creare un
              altro account.
            </span>
          </button>
        </div>

        {mostraAccount && (
          <div
            style={schedaAccount}
          >
            <h2
              style={sottotitolo}
            >
              Il mio account
            </h2>

            {!modificaAccount ? (
              <>
                <p>
                  <strong>
                    Nome:
                  </strong>{" "}
                  {utente?.nome ||
                    "Non indicato"}
                </p>

                <p>
                  <strong>
                    Cognome:
                  </strong>{" "}
                  {utente?.cognome ||
                    "Non indicato"}
                </p>

                <p>
                  <strong>
                    Email:
                  </strong>{" "}
                  {utente?.email ||
                    "Non indicata"}
                </p>

                <p>
                  <strong>
                    Telefono:
                  </strong>{" "}
                  {utente?.telefono ||
                    "Non indicato"}
                </p>

                <p>
                  <strong>
                    Città:
                  </strong>{" "}
                  {utente?.citta ||
                    "Non indicata"}
                </p>

                <p>
                  <strong>
                    CAP:
                  </strong>{" "}
                  {utente?.cap ||
                    "Non indicato"}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setModificaAccount(
                      true
                    )
                  }
                  style={{
                    ...bottonePrincipale,
                    width: "auto",
                    marginTop:
                      "12px",
                  }}
                >
                  Modifica dati
                  personali
                </button>
              </>
            ) : (
              <>
                <input
                  placeholder="Nome *"
                  value={nome}
                  onChange={(
                    evento
                  ) =>
                    setNome(
                      evento.target
                        .value
                    )
                  }
                  style={campo}
                />

                <input
                  placeholder="Cognome *"
                  value={cognome}
                  onChange={(
                    evento
                  ) =>
                    setCognome(
                      evento.target
                        .value
                    )
                  }
                  style={campo}
                />

                <input
                  placeholder="Telefono"
                  value={telefono}
                  onChange={(
                    evento
                  ) =>
                    setTelefono(
                      evento.target
                        .value
                    )
                  }
                  style={campo}
                />

                <input
                  placeholder="Città"
                  value={citta}
                  onChange={(
                    evento
                  ) =>
                    setCitta(
                      evento.target
                        .value
                    )
                  }
                  style={campo}
                />

                <input
                  placeholder="CAP"
                  value={cap}
                  onChange={(
                    evento
                  ) =>
                    setCap(
                      evento.target
                        .value
                    )
                  }
                  style={campo}
                />

                <p
                  style={notaEmail}
                >
                  L’email viene
                  utilizzata anche
                  per l’accesso OTP.
                  La sua modifica
                  richiederà una
                  verifica dedicata
                  e non viene
                  modificata da
                  questo modulo.
                </p>

                <div
                  style={
                    azioniAccount
                  }
                >
                  <button
                    type="button"
                    onClick={
                      salvaAccount
                    }
                    disabled={
                      operazioneInCorso
                    }
                    style={{
                      ...bottonePrincipale,
                      width: "auto",
                    }}
                  >
                    Salva modifiche
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setModificaAccount(
                        false
                      )
                    }
                    style={{
                      ...bottoneSecondario,
                      marginTop: 0,
                    }}
                  >
                    Annulla
                  </button>
                </div>
              </>
            )}

            <div
              style={
                zonaAccountSensibile
              }
            >
              <h3
                style={{
                  color: "#8b0000",
                }}
              >
                Gestione
                dell’account
              </h3>

              {richiestaCancellazioneInAttesa ? (
                <div
                  style={
                    richiestaInAttesa
                  }
                >
                  <strong>
                    Richiesta di
                    cancellazione
                    inviata
                  </strong>

                  <p
                    style={{
                      marginBottom: 0,
                    }}
                  >
                    La richiesta è
                    in attesa di
                    verifica da
                    parte del
                    SuperAdmin.
                    L’account
                    rimane attivo
                    fino alla
                    conclusione
                    della
                    procedura.
                  </p>
                </div>
              ) : (
                <>
                  <p
                    style={{
                      lineHeight:
                        1.5,
                    }}
                  >
                    Puoi chiedere
                    la cancellazione
                    del tuo account.
                    La richiesta
                    verrà inviata
                    al SuperAdmin,
                    che verificherà
                    prima eventuali
                    incarichi e
                    parrocchie
                    ancora attive.
                  </p>

                  <button
                    type="button"
                    onClick={
                      richiediCancellazioneAccount
                    }
                    disabled={
                      operazioneInCorso
                    }
                    style={
                      bottonePericolo
                    }
                  >
                    Richiedi
                    cancellazione
                    account
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        <div
          style={
            sezioneParrocchie
          }
        >
          <div
            style={
              testataParrocchie
            }
          >
            <div>
              <h2
                style={sottotitolo}
              >
                Le mie parrocchie
              </h2>

              <p
                style={{
                  margin: 0,
                }}
              >
                Parrocchie
                collegate al tuo
                account:{" "}
                <strong>
                  {parrocchie.length}
                </strong>
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setMostraAttivazione(
                  true
                )
              }
              style={{
                ...bottonePrincipale,
                width: "auto",
              }}
            >
              + Aggiungi
              parrocchia
            </button>
          </div>

          {parrocchie.length ===
          0 ? (
            <div
              style={
                nessunaParrocchia
              }
            >
              <div
                style={{
                  fontSize: "38px",
                }}
              >
                ⛪
              </div>

              <h3
                style={{
                  color:
                    "#6b1111",
                  marginBottom:
                    "8px",
                }}
              >
                Nessuna parrocchia
                associata
              </h3>

              <p
                style={{
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                Il tuo account
                personale è
                attivo, ma al
                momento non
                risultano
                parrocchie
                associate.
                Puoi attivarne
                una utilizzando
                “Aggiungi
                parrocchia”.
              </p>
            </div>
          ) : (
            <div
              style={
                elencoParrocchie
              }
            >
              {parrocchie.map(
                (parrocchia) => (
                  <div
                    key={
                      parrocchia.id
                    }
                    style={
                      schedaParrocchia
                    }
                  >
                    <div
                      style={
                        iconaParrocchia
                      }
                    >
                      ⛪
                    </div>

                    <h3
                      style={
                        nomeParrocchia
                      }
                    >
                      {
                        parrocchia.nome
                      }
                    </h3>

                    {parrocchia.comune && (
                      <p
                        style={
                          datoParrocchia
                        }
                      >
                        {
                          parrocchia.comune
                        }
                      </p>
                    )}

                    {parrocchia.diocesi && (
                      <p
                        style={
                          datoParrocchia
                        }
                      >
                        Diocesi:{" "}
                        {
                          parrocchia.diocesi
                        }
                      </p>
                    )}

                    {parrocchia.ruolo && (
                      <p
                        style={
                          ruoloParrocchia
                        }
                      >
                        <strong>
                          Ruolo:
                        </strong>{" "}
                        {
                          parrocchia.ruolo
                        }
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        selezionaParrocchia(
                          parrocchia
                        )
                      }
                      style={{
                        ...bottonePrincipale,
                        marginTop:
                          "18px",
                      }}
                    >
                      Entra nella
                      parrocchia
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const pagina = {
  minHeight: "100vh",
  padding: "40px 20px",
  background:
    "linear-gradient(180deg, #fff8e8 0%, #f6ead2 100%)",
  color: "#102a43",
  fontFamily:
    "Georgia, 'Times New Roman', serif",
};

const contenitorePiccolo = {
  maxWidth: "650px",
  margin: "0 auto",
  padding: "34px",
  background: "#fffdf7",
  border: "2px solid #d6a23a",
  borderRadius: "18px",
  boxShadow:
    "0 12px 30px rgba(80,45,10,0.16)",
};

const contenitoreGrande = {
  maxWidth: "1080px",
  margin: "0 auto",
  padding: "34px",
  background: "#fffdf7",
  border: "2px solid #d6a23a",
  borderRadius: "18px",
  boxShadow:
    "0 12px 30px rgba(80,45,10,0.16)",
};

const intestazione = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
  flexWrap: "wrap",
  marginBottom: "30px",
};

const titolo = {
  margin: "0 0 8px",
  color: "#6b1111",
  fontSize: "38px",
};

const nomeUtente = {
  margin: "0 0 4px",
  fontSize: "20px",
  fontWeight: "bold",
};

const emailUtente = {
  margin: 0,
  color: "#6b4b2a",
};

const sottotitolo = {
  color: "#6b1111",
  marginTop: 0,
};

const testoIntro = {
  fontSize: "18px",
  lineHeight: 1.6,
  marginBottom: "26px",
};

const campo = {
  boxSizing: "border-box",
  width: "100%",
  padding: "14px",
  marginBottom: "14px",
  borderRadius: "8px",
  border: "1px solid #d6a23a",
  fontSize: "16px",
  background: "#ffffff",
};

const bottonePrincipale = {
  width: "100%",
  padding: "14px 18px",
  background:
    "linear-gradient(180deg, #0b2f55, #061d35)",
  color: "#fff8e8",
  border: "1px solid #d6a23a",
  borderRadius: "8px",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer",
};

const bottoneSecondario = {
  padding: "11px 18px",
  marginTop: "18px",
  background: "transparent",
  color: "#0b2f55",
  border: "1px solid #d6a23a",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: "pointer",
};

const bottonePericolo = {
  padding: "11px 18px",
  background: "#fff0ef",
  color: "#a12622",
  border: "1px solid #a12622",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: "pointer",
};

const boxMessaggio = {
  marginTop: "18px",
  padding: "14px",
  borderRadius: "8px",
  fontWeight: "bold",
};

const grigliaAzioni = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "20px",
  marginBottom: "30px",
};

const cardAzione = {
  minHeight: "155px",
  padding: "24px",
  border: "1px solid #d6a23a",
  borderRadius: "16px",
  background:
    "linear-gradient(180deg, #fff8ea 0%, #f8efd8 100%)",
  color: "#0b2f55",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  boxShadow:
    "0 6px 16px rgba(80,45,10,0.10)",
};

const iconaGrande = {
  fontSize: "32px",
};

const descrizioneCard = {
  fontSize: "14px",
  fontWeight: "normal",
  lineHeight: 1.4,
};

const schedaAccount = {
  padding: "24px",
  marginBottom: "30px",
  background: "#fff8ea",
  border: "1px solid #d6a23a",
  borderRadius: "14px",
};

const notaEmail = {
  padding: "12px",
  background: "#ffffff",
  border: "1px solid #d8c59a",
  borderRadius: "8px",
  lineHeight: 1.5,
  color: "#6b4b2a",
};

const azioniAccount = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
  marginTop: "10px",
};

const zonaAccountSensibile = {
  marginTop: "28px",
  paddingTop: "20px",
  borderTop: "1px solid #d8c59a",
};

const richiestaInAttesa = {
  padding: "16px",
  background: "#fff8e8",
  border: "1px solid #d6a23a",
  borderRadius: "10px",
  color: "#6b4b2a",
};

const sezioneParrocchie = {
  marginTop: "30px",
  paddingTop: "30px",
  borderTop: "1px solid #d8c59a",
};

const testataParrocchie = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "18px",
  flexWrap: "wrap",
  marginBottom: "22px",
};

const nessunaParrocchia = {
  padding: "30px",
  textAlign: "center",
  background: "#fff8ea",
  border: "1px dashed #d6a23a",
  borderRadius: "14px",
};

const elencoParrocchie = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(270px, 1fr))",
  gap: "18px",
};

const schedaParrocchia = {
  padding: "22px",
  background: "#ffffff",
  border: "1px solid #d6a23a",
  borderRadius: "14px",
  boxShadow:
    "0 5px 14px rgba(80,45,10,0.08)",
};

const iconaParrocchia = {
  fontSize: "30px",
  marginBottom: "10px",
};

const nomeParrocchia = {
  margin: "0 0 10px",
  color: "#6b1111",
};

const datoParrocchia = {
  margin: "5px 0",
  color: "#3a2a1c",
};

const ruoloParrocchia = {
  margin: "12px 0 0",
  color: "#0b2f55",
};
