import React, { useState } from "react";
import { supabase } from "../supabaseClient";

const PERMESSI = [
  { codice: "gestione_avvisi", nome: "Gestione Avvisi" },
  { codice: "gestione_comunicazioni", nome: "Gestione Comunicazioni" },
  { codice: "gestione_bollettino", nome: "Gestione Bollettino" },
  { codice: "gestione_albo_defunti", nome: "Gestione Albo Defunti" },
  {
    codice: "gestione_progetti_donazioni",
    nome: "Gestione Progetti e Donazioni",
  },
  {
    codice: "gestione_persone_permessi",
    nome: "Gestione persone e autorizzazioni",
  },
  {
    codice: "gestione_impostazioni",
    nome: "Impostazioni della parrocchia",
  },
];

const PERSONA_VUOTA = {
  nome: "",
  cognome: "",
  email: "",
  telefono: "",
  ruoloBase: "sacerdote_collaboratore",
  permessi: [],
};

export default function AttivazioneParrocchia({
  onAttivazioneCompletata,
}) {
  const [passaggio, setPassaggio] = useState(1);

  const [registrante, setRegistrante] = useState({
    nome: "",
    cognome: "",
    email: "",
    telefono: "",
    ruoloDichiarato: "",
    permessi: [],
  });

  const [codiceOtp, setCodiceOtp] = useState("");
  const [otpInviato, setOtpInviato] = useState(false);
  const [otpVerificato, setOtpVerificato] = useState(false);
  const [invioOtpInCorso, setInvioOtpInCorso] = useState(false);
  const [verificaOtpInCorso, setVerificaOtpInCorso] =
    useState(false);

  const [parrocchia, setParrocchia] = useState({
    nome: "",
    diocesi: "",
    comune: "",
    provincia: "",
    cap: "",
    via: "",
    numeroCivico: "",
    telefono: "",
    email: "",
    sitoWeb: "",
  });

  const [registranteParroco, setRegistranteParroco] =
    useState(false);

  const [parroco, setParroco] = useState({
    ...PERSONA_VUOTA,
    ruoloBase: "parroco",
  });

  const [viceparrocoPresente, setViceparrocoPresente] =
    useState(false);

  const [viceparroco, setViceparroco] = useState({
    ...PERSONA_VUOTA,
    ruoloBase: "viceparroco",
  });

  const [altrePersone, setAltrePersone] = useState([]);

  const [
    dichiarazioneAutorizzazione,
    setDichiarazioneAutorizzazione,
  ] = useState(false);

  const [salvataggioInCorso, setSalvataggioInCorso] =
    useState(false);

  const [messaggio, setMessaggio] = useState("");
  const [tipoMessaggio, setTipoMessaggio] = useState("info");

  function mostraMessaggio(testo, tipo = "info") {
    setMessaggio(testo);
    setTipoMessaggio(tipo);
  }

  function pulisciMessaggio() {
    setMessaggio("");
  }

  function aggiornaRegistrante(campo, valore) {
    setRegistrante((precedente) => ({
      ...precedente,
      [campo]: valore,
    }));
  }

  function aggiornaParrocchia(campo, valore) {
    setParrocchia((precedente) => ({
      ...precedente,
      [campo]: valore,
    }));
  }

  function aggiornaPersona(setPersona, campo, valore) {
    setPersona((precedente) => ({
      ...precedente,
      [campo]: valore,
    }));
  }

  function cambiaPermessoRegistrante(codicePermesso) {
    setRegistrante((precedente) => {
      const presente =
        precedente.permessi.includes(codicePermesso);

      return {
        ...precedente,
        permessi: presente
          ? precedente.permessi.filter(
              (permesso) => permesso !== codicePermesso
            )
          : [...precedente.permessi, codicePermesso],
      };
    });
  }

  function cambiaPermessoPersona(
    persona,
    setPersona,
    codicePermesso
  ) {
    const presente = persona.permessi.includes(codicePermesso);

    setPersona((precedente) => ({
      ...precedente,
      permessi: presente
        ? precedente.permessi.filter(
            (permesso) => permesso !== codicePermesso
          )
        : [...precedente.permessi, codicePermesso],
    }));
  }

  function aggiungiPersona() {
    setAltrePersone((precedenti) => [
      ...precedenti,
      {
        ...PERSONA_VUOTA,
        idTemporaneo:
          typeof crypto !== "undefined" &&
          typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random()}`,
      },
    ]);
  }

  function aggiornaAltraPersona(indice, campo, valore) {
    setAltrePersone((precedenti) =>
      precedenti.map((persona, posizione) =>
        posizione === indice
          ? { ...persona, [campo]: valore }
          : persona
      )
    );
  }

  function cambiaPermessoAltraPersona(
    indice,
    codicePermesso
  ) {
    setAltrePersone((precedenti) =>
      precedenti.map((persona, posizione) => {
        if (posizione !== indice) {
          return persona;
        }

        const presente =
          persona.permessi.includes(codicePermesso);

        return {
          ...persona,
          permessi: presente
            ? persona.permessi.filter(
                (permesso) => permesso !== codicePermesso
              )
            : [...persona.permessi, codicePermesso],
        };
      })
    );
  }

  function rimuoviPersona(indice) {
    setAltrePersone((precedenti) =>
      precedenti.filter(
        (_, posizione) => posizione !== indice
      )
    );
  }

  async function inviaCodiceOtp() {
    pulisciMessaggio();

    const email = registrante.email
      .trim()
      .toLowerCase();

    if (
      !registrante.nome.trim() ||
      !registrante.cognome.trim() ||
      !registrante.ruoloDichiarato.trim() ||
      !email
    ) {
      mostraMessaggio(
        "Completa nome, cognome, ruolo ed email del registrante.",
        "errore"
      );
      return;
    }

    setInvioOtpInCorso(true);

    try {
      const { error } =
        await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: true,
          },
        });

      if (error) {
        throw error;
      }

      setOtpInviato(true);

      mostraMessaggio(
        `Il codice è stato inviato a ${email}.`,
        "successo"
      );
    } catch (error) {
      console.error("Errore invio OTP:", error);

      mostraMessaggio(
        error?.message ||
          "Non è stato possibile inviare il codice.",
        "errore"
      );
    } finally {
      setInvioOtpInCorso(false);
    }
  }

  async function verificaCodiceOtp() {
    pulisciMessaggio();

    const email = registrante.email
      .trim()
      .toLowerCase();

    const token = codiceOtp
      .trim()
      .replace(/\s+/g, "");

    if (!token) {
      mostraMessaggio(
        "Inserisci il codice ricevuto tramite email.",
        "errore"
      );
      return;
    }

    setVerificaOtpInCorso(true);

    try {
      const { error: erroreVerifica } =
        await supabase.auth.verifyOtp({
          email,
          token,
          type: "email",
        });

      if (erroreVerifica) {
        throw erroreVerifica;
      }

      const {
        data: { user },
        error: erroreUtente,
      } = await supabase.auth.getUser();

      if (erroreUtente) {
        throw erroreUtente;
      }

      if (!user) {
        throw new Error(
          "Utente autenticato non disponibile."
        );
      }

      if (
        !user.email ||
        user.email.trim().toLowerCase() !== email
      ) {
        throw new Error(
          "L'email autenticata non coincide con quella indicata."
        );
      }

      setOtpVerificato(true);

      mostraMessaggio(
        "Identità verificata correttamente.",
        "successo"
      );

      setPassaggio(2);
    } catch (error) {
      console.error("Errore verifica OTP:", error);

      mostraMessaggio(
        error?.message ||
          "Il codice inserito non è valido.",
        "errore"
      );
    } finally {
      setVerificaOtpInCorso(false);
    }
  }

  function vaiAllaStrutturaPastorale() {
    pulisciMessaggio();

    const campiObbligatori = [
      parrocchia.nome,
      parrocchia.diocesi,
      parrocchia.comune,
      parrocchia.provincia,
      parrocchia.cap,
      parrocchia.via,
      parrocchia.numeroCivico,
    ];

    if (
      campiObbligatori.some(
        (valore) => !String(valore).trim()
      )
    ) {
      mostraMessaggio(
        "Completa tutti i dati obbligatori della parrocchia.",
        "errore"
      );
      return;
    }

    setPassaggio(3);
  }

  function vaiAlleAutorizzazioni() {
    pulisciMessaggio();

    if (!registranteParroco) {
      if (
        !parroco.nome.trim() ||
        !parroco.cognome.trim()
      ) {
        mostraMessaggio(
          "Inserisci nome e cognome del parroco titolare.",
          "errore"
        );
        return;
      }
    }

    if (
      viceparrocoPresente &&
      (!viceparroco.nome.trim() ||
        !viceparroco.cognome.trim())
    ) {
      mostraMessaggio(
        "Completa nome e cognome del viceparroco.",
        "errore"
      );
      return;
    }

    const personaIncompleta = altrePersone.some(
      (persona) =>
        !persona.nome.trim() ||
        !persona.cognome.trim() ||
        !persona.ruoloBase.trim()
    );

    if (personaIncompleta) {
      mostraMessaggio(
        "Completa tutte le persone inserite.",
        "errore"
      );
      return;
    }

    setPassaggio(4);
  }

  function costruisciPersonePastorali() {
    const persone = [];

    if (!registranteParroco) {
      persone.push({
        nome: parroco.nome.trim(),
        cognome: parroco.cognome.trim(),
        email: parroco.email
          .trim()
          .toLowerCase(),
        telefono: parroco.telefono.trim(),
        ruoloBase: "parroco",
        permessi: parroco.permessi,
      });
    }

    if (viceparrocoPresente) {
      persone.push({
        nome: viceparroco.nome.trim(),
        cognome: viceparroco.cognome.trim(),
        email: viceparroco.email
          .trim()
          .toLowerCase(),
        telefono: viceparroco.telefono.trim(),
        ruoloBase: "viceparroco",
        permessi: viceparroco.permessi,
      });
    }

    altrePersone.forEach((persona) => {
      persone.push({
        nome: persona.nome.trim(),
        cognome: persona.cognome.trim(),
        email: persona.email
          .trim()
          .toLowerCase(),
        telefono: persona.telefono.trim(),
        ruoloBase: persona.ruoloBase,
        permessi: persona.permessi,
      });
    });

    return persone;
  }

  async function completaAttivazione() {
    pulisciMessaggio();

    if (!otpVerificato) {
      mostraMessaggio(
        "Il registrante non risulta autenticato.",
        "errore"
      );
      return;
    }

    if (!dichiarazioneAutorizzazione) {
      mostraMessaggio(
        "Conferma la dichiarazione di autorizzazione.",
        "errore"
      );
      return;
    }

    setSalvataggioInCorso(true);

    try {
      const datiCompleti = {
        registrante: {
          nome: registrante.nome.trim(),
          cognome: registrante.cognome.trim(),
          email: registrante.email
            .trim()
            .toLowerCase(),
          telefono: registrante.telefono.trim(),
          ruoloDichiarato: registranteParroco
            ? "parroco"
            : registrante.ruoloDichiarato,
          permessi: registrante.permessi,
        },

        parrocchia: {
          nome: parrocchia.nome.trim(),
          diocesi: parrocchia.diocesi.trim(),
          comune: parrocchia.comune.trim(),
          provincia: parrocchia.provincia.trim(),
          cap: parrocchia.cap.trim(),
          via: parrocchia.via.trim(),
          numeroCivico:
            parrocchia.numeroCivico.trim(),
          telefono: parrocchia.telefono.trim(),
          email: parrocchia.email
            .trim()
            .toLowerCase(),
          sitoWeb: parrocchia.sitoWeb.trim(),
        },

        personePastorali:
          costruisciPersonePastorali(),

        dichiarazioneAutorizzazione: true,
      };

      const {
        data: parrocchiaId,
        error,
      } = await supabase.rpc(
        "attiva_parrocchia_completa",
        {
          p_dati: datiCompleti,
        }
      );

      if (error) {
        throw error;
      }

      if (!parrocchiaId) {
        throw new Error(
          "La procedura non ha restituito l'identificativo della parrocchia."
        );
      }

      localStorage.setItem(
        "ars_parrocchia_id",
        parrocchiaId
      );

      localStorage.setItem(
        "ars_nome_parrocchia",
        parrocchia.nome.trim()
      );

      localStorage.setItem(
        "ars_ruolo",
        registranteParroco
          ? "parroco"
          : registrante.ruoloDichiarato
      );

      mostraMessaggio(
        "La parrocchia è stata attivata correttamente.",
        "successo"
      );

      if (
        typeof onAttivazioneCompletata === "function"
      ) {
        onAttivazioneCompletata(
          parrocchiaId,
          parrocchia.nome.trim()
        );
      }
    } catch (error) {
      console.error(
        "Errore attivazione completa:",
        error
      );

      mostraMessaggio(
        error?.message ||
          "Non è stato possibile completare l'attivazione.",
        "errore"
      );
    } finally {
      setSalvataggioInCorso(false);
    }
  }

  function renderIndicatore() {
    const passaggi = [
      "Registrante",
      "Parrocchia",
      "Struttura pastorale",
      "Autorizzazioni",
    ];

    return (
      <div style={stileIndicatore}>
        {passaggi.map((titolo, indice) => {
          const numero = indice + 1;
          const attivo = passaggio === numero;
          const completato = passaggio > numero;

          return (
            <div
              key={titolo}
              style={stileVoceIndicatore}
            >
              <div
                style={{
                  ...stileNumeroIndicatore,
                  background:
                    attivo || completato
                      ? "#0b2f55"
                      : "#e5e7eb",
                  color:
                    attivo || completato
                      ? "#ffffff"
                      : "#5a0000",
                }}
              >
                {numero}
              </div>

              <span style={stileTitoloIndicatore}>
                {titolo}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  function renderPermessi(
    persona,
    cambiaPermesso
  ) {
    return (
      <div style={stileElencoPermessi}>
        {PERMESSI.map((permesso) => (
          <label
            key={permesso.codice}
            style={stileCheckbox}
          >
            <input
              type="checkbox"
              checked={persona.permessi.includes(
                permesso.codice
              )}
              onChange={() =>
                cambiaPermesso(permesso.codice)
              }
            />

            {permesso.nome}
          </label>
        ))}
      </div>
    );
  }

  return (
    <section style={stileContenitore}>
      <h1 style={{ marginTop: 0 }}>
        Attivazione della Parrocchia
      </h1>

      <p style={{ lineHeight: 1.6 }}>
        Completa i quattro passaggi per configurare
        la comunità e le autorizzazioni iniziali.
      </p>

      {renderIndicatore()}

      {passaggio === 1 && (
        <div>
          <h2>Identificazione del registrante</h2>

          <input
            placeholder="Nome *"
            value={registrante.nome}
            onChange={(evento) =>
              aggiornaRegistrante(
                "nome",
                evento.target.value
              )
            }
            style={stileInput}
          />

          <input
            placeholder="Cognome *"
            value={registrante.cognome}
            onChange={(evento) =>
              aggiornaRegistrante(
                "cognome",
                evento.target.value
              )
            }
            style={stileInput}
          />

          <select
            value={registrante.ruoloDichiarato}
            onChange={(evento) =>
              aggiornaRegistrante(
                "ruoloDichiarato",
                evento.target.value
              )
            }
            style={stileInput}
          >
            <option value="">
              Seleziona il tuo ruolo *
            </option>
            <option value="parroco">
              Parroco
            </option>
            <option value="viceparroco">
              Viceparroco
            </option>
            <option value="sacerdote_collaboratore">
              Sacerdote collaboratore
            </option>
            <option value="diacono">
              Diacono
            </option>
            <option value="segretario">
              Segretario/a
            </option>
            <option value="collaboratore">
              Collaboratore incaricato
            </option>
            <option value="altro">
              Altro
            </option>
          </select>

          <input
            type="email"
            placeholder="Email personale *"
            value={registrante.email}
            disabled={otpVerificato}
            onChange={(evento) =>
              aggiornaRegistrante(
                "email",
                evento.target.value
              )
            }
            style={stileInput}
          />

          <input
            type="tel"
            placeholder="Telefono"
            value={registrante.telefono}
            onChange={(evento) =>
              aggiornaRegistrante(
                "telefono",
                evento.target.value
              )
            }
            style={stileInput}
          />

          <button
            type="button"
            onClick={inviaCodiceOtp}
            disabled={
              invioOtpInCorso || otpVerificato
            }
            style={stilePulsantePrincipale}
          >
            {invioOtpInCorso
              ? "Invio in corso..."
              : otpInviato
                ? "Invia nuovamente il codice"
                : "Invia codice di verifica"}
          </button>

          {otpInviato && !otpVerificato && (
            <>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Codice ricevuto via email"
                value={codiceOtp}
                onChange={(evento) =>
                  setCodiceOtp(
                    evento.target.value
                  )
                }
                style={stileInput}
              />

              <button
                type="button"
                onClick={verificaCodiceOtp}
                disabled={verificaOtpInCorso}
                style={stilePulsantePrincipale}
              >
                {verificaOtpInCorso
                  ? "Verifica in corso..."
                  : "Verifica codice"}
              </button>
            </>
          )}
        </div>
      )}

      {passaggio === 2 && (
        <div>
          <h2>Dati della parrocchia</h2>

          <input
            placeholder="Nome della Parrocchia *"
            value={parrocchia.nome}
            onChange={(evento) =>
              aggiornaParrocchia(
                "nome",
                evento.target.value
              )
            }
            style={stileInput}
          />

          <input
            placeholder="Diocesi *"
            value={parrocchia.diocesi}
            onChange={(evento) =>
              aggiornaParrocchia(
                "diocesi",
                evento.target.value
              )
            }
            style={stileInput}
          />

          <input
            placeholder="Comune *"
            value={parrocchia.comune}
            onChange={(evento) =>
              aggiornaParrocchia(
                "comune",
                evento.target.value
              )
            }
            style={stileInput}
          />

          <input
            placeholder="Provincia *"
            value={parrocchia.provincia}
            onChange={(evento) =>
              aggiornaParrocchia(
                "provincia",
                evento.target.value
              )
            }
            style={stileInput}
          />

          <input
            placeholder="CAP *"
            value={parrocchia.cap}
            onChange={(evento) =>
              aggiornaParrocchia(
                "cap",
                evento.target.value
              )
            }
            style={stileInput}
          />

          <input
            placeholder="Via / Piazza *"
            value={parrocchia.via}
            onChange={(evento) =>
              aggiornaParrocchia(
                "via",
                evento.target.value
              )
            }
            style={stileInput}
          />

          <input
            placeholder="Numero civico *"
            value={parrocchia.numeroCivico}
            onChange={(evento) =>
              aggiornaParrocchia(
                "numeroCivico",
                evento.target.value
              )
            }
            style={stileInput}
          />

          <input
            placeholder="Telefono della parrocchia"
            value={parrocchia.telefono}
            onChange={(evento) =>
              aggiornaParrocchia(
                "telefono",
                evento.target.value
              )
            }
            style={stileInput}
          />

          <input
            type="email"
            placeholder="Email della parrocchia"
            value={parrocchia.email}
            onChange={(evento) =>
              aggiornaParrocchia(
                "email",
                evento.target.value
              )
            }
            style={stileInput}
          />

          <input
            placeholder="Sito web"
            value={parrocchia.sitoWeb}
            onChange={(evento) =>
              aggiornaParrocchia(
                "sitoWeb",
                evento.target.value
              )
            }
            style={stileInput}
          />

          <div style={stileAzioni}>
            <button
              type="button"
              onClick={() => setPassaggio(1)}
              style={stilePulsanteSecondario}
            >
              Indietro
            </button>

            <button
              type="button"
              onClick={vaiAllaStrutturaPastorale}
              style={stilePulsantePrincipale}
            >
              Continua
            </button>
          </div>
        </div>
      )}

      {passaggio === 3 && (
        <div>
          <h2>Struttura pastorale</h2>

          <label style={stileDichiarazione}>
            <input
              type="checkbox"
              checked={registranteParroco}
              onChange={(evento) => {
                setRegistranteParroco(
                  evento.target.checked
                );
              }}
            />

            Il registrante è anche il parroco
            titolare.
          </label>

          {!registranteParroco && (
            <div style={stileScheda}>
              <h3>Parroco titolare</h3>

              <input
                placeholder="Nome *"
                value={parroco.nome}
                onChange={(evento) =>
                  aggiornaPersona(
                    setParroco,
                    "nome",
                    evento.target.value
                  )
                }
                style={stileInput}
              />

              <input
                placeholder="Cognome *"
                value={parroco.cognome}
                onChange={(evento) =>
                  aggiornaPersona(
                    setParroco,
                    "cognome",
                    evento.target.value
                  )
                }
                style={stileInput}
              />

              <input
                type="email"
                placeholder="Email"
                value={parroco.email}
                onChange={(evento) =>
                  aggiornaPersona(
                    setParroco,
                    "email",
                    evento.target.value
                  )
                }
                style={stileInput}
              />

              <input
                placeholder="Telefono"
                value={parroco.telefono}
                onChange={(evento) =>
                  aggiornaPersona(
                    setParroco,
                    "telefono",
                    evento.target.value
                  )
                }
                style={stileInput}
              />
            </div>
          )}

          <label style={stileDichiarazione}>
            <input
              type="checkbox"
              checked={viceparrocoPresente}
              onChange={(evento) =>
                setViceparrocoPresente(
                  evento.target.checked
                )
              }
            />

            La parrocchia ha un viceparroco.
          </label>

          {viceparrocoPresente && (
            <div style={stileScheda}>
              <h3>Viceparroco</h3>

              <input
                placeholder="Nome *"
                value={viceparroco.nome}
                onChange={(evento) =>
                  aggiornaPersona(
                    setViceparroco,
                    "nome",
                    evento.target.value
                  )
                }
                style={stileInput}
              />

              <input
                placeholder="Cognome *"
                value={viceparroco.cognome}
                onChange={(evento) =>
                  aggiornaPersona(
                    setViceparroco,
                    "cognome",
                    evento.target.value
                  )
                }
                style={stileInput}
              />

              <input
                type="email"
                placeholder="Email"
                value={viceparroco.email}
                onChange={(evento) =>
                  aggiornaPersona(
                    setViceparroco,
                    "email",
                    evento.target.value
                  )
                }
                style={stileInput}
              />

              <input
                placeholder="Telefono"
                value={viceparroco.telefono}
                onChange={(evento) =>
                  aggiornaPersona(
                    setViceparroco,
                    "telefono",
                    evento.target.value
                  )
                }
                style={stileInput}
              />
            </div>
          )}

          {altrePersone.map(
            (persona, indice) => (
              <div
                key={persona.idTemporaneo}
                style={stileScheda}
              >
                <h3>
                  Sacerdote o collaboratore
                </h3>

                <input
                  placeholder="Nome *"
                  value={persona.nome}
                  onChange={(evento) =>
                    aggiornaAltraPersona(
                      indice,
                      "nome",
                      evento.target.value
                    )
                  }
                  style={stileInput}
                />

                <input
                  placeholder="Cognome *"
                  value={persona.cognome}
                  onChange={(evento) =>
                    aggiornaAltraPersona(
                      indice,
                      "cognome",
                      evento.target.value
                    )
                  }
                  style={stileInput}
                />

                <select
                  value={persona.ruoloBase}
                  onChange={(evento) =>
                    aggiornaAltraPersona(
                      indice,
                      "ruoloBase",
                      evento.target.value
                    )
                  }
                  style={stileInput}
                >
                  <option value="sacerdote_collaboratore">
                    Sacerdote collaboratore
                  </option>
                  <option value="diacono">
                    Diacono
                  </option>
                  <option value="segretario">
                    Segretario/a
                  </option>
                  <option value="collaboratore">
                    Collaboratore
                  </option>
                  <option value="altro">
                    Altro
                  </option>
                </select>

                <input
                  type="email"
                  placeholder="Email"
                  value={persona.email}
                  onChange={(evento) =>
                    aggiornaAltraPersona(
                      indice,
                      "email",
                      evento.target.value
                    )
                  }
                  style={stileInput}
                />

                <input
                  placeholder="Telefono"
                  value={persona.telefono}
                  onChange={(evento) =>
                    aggiornaAltraPersona(
                      indice,
                      "telefono",
                      evento.target.value
                    )
                  }
                  style={stileInput}
                />

                <button
                  type="button"
                  onClick={() =>
                    rimuoviPersona(indice)
                  }
                  style={stilePulsanteElimina}
                >
                  Rimuovi
                </button>
              </div>
            )
          )}

          <button
            type="button"
            onClick={aggiungiPersona}
            style={stilePulsanteSecondario}
          >
            Aggiungi sacerdote o collaboratore
          </button>

          <div style={stileAzioni}>
            <button
              type="button"
              onClick={() => setPassaggio(2)}
              style={stilePulsanteSecondario}
            >
              Indietro
            </button>

            <button
              type="button"
              onClick={vaiAlleAutorizzazioni}
              style={stilePulsantePrincipale}
            >
              Continua
            </button>
          </div>
        </div>
      )}

      {passaggio === 4 && (
        <div>
          <h2>Autorizzazioni iniziali</h2>

          <div style={stileScheda}>
            <h3>
              Registrante: {registrante.nome}{" "}
              {registrante.cognome}
            </h3>

            {renderPermessi(
              registrante,
              cambiaPermessoRegistrante
            )}
          </div>

          {!registranteParroco && (
            <div style={stileScheda}>
              <h3>
                Parroco: {parroco.nome}{" "}
                {parroco.cognome}
              </h3>

              {renderPermessi(
                parroco,
                (codicePermesso) =>
                  cambiaPermessoPersona(
                    parroco,
                    setParroco,
                    codicePermesso
                  )
              )}
            </div>
          )}

          {viceparrocoPresente && (
            <div style={stileScheda}>
              <h3>
                Viceparroco: {viceparroco.nome}{" "}
                {viceparroco.cognome}
              </h3>

              {renderPermessi(
                viceparroco,
                (codicePermesso) =>
                  cambiaPermessoPersona(
                    viceparroco,
                    setViceparroco,
                    codicePermesso
                  )
              )}
            </div>
          )}

          {altrePersone.map(
            (persona, indice) => (
              <div
                key={persona.idTemporaneo}
                style={stileScheda}
              >
                <h3>
                  {persona.nome}{" "}
                  {persona.cognome}
                </h3>

                {renderPermessi(
                  persona,
                  (codicePermesso) =>
                    cambiaPermessoAltraPersona(
                      indice,
                      codicePermesso
                    )
                )}
              </div>
            )
          )}

          <label style={stileDichiarazione}>
            <input
              type="checkbox"
              checked={
                dichiarazioneAutorizzazione
              }
              onChange={(evento) =>
                setDichiarazioneAutorizzazione(
                  evento.target.checked
                )
              }
            />

            Dichiaro di essere autorizzato ad
            attivare Ars Liturgica per questa
            parrocchia e a indicare le
            autorizzazioni iniziali.
          </label>

          <div style={stileAzioni}>
            <button
              type="button"
              onClick={() => setPassaggio(3)}
              style={stilePulsanteSecondario}
            >
              Indietro
            </button>

            <button
              type="button"
              onClick={completaAttivazione}
              disabled={salvataggioInCorso}
              style={stilePulsantePrincipale}
            >
              {salvataggioInCorso
                ? "Attivazione in corso..."
                : "Conferma e attiva"}
            </button>
          </div>
        </div>
      )}

      {messaggio && (
        <div
          role={
            tipoMessaggio === "errore"
              ? "alert"
              : "status"
          }
          style={{
            ...stileMessaggio,
            background:
              tipoMessaggio === "successo"
                ? "#edf8f0"
                : tipoMessaggio === "errore"
                  ? "#fff0ef"
                  : "#fff8ea",
            color:
              tipoMessaggio === "successo"
                ? "#1f6b3a"
                : tipoMessaggio === "errore"
                  ? "#a12622"
                  : "#5a0000",
          }}
        >
          {messaggio}
        </div>
      )}
    </section>
  );
}

const stileContenitore = {
  maxWidth: "820px",
  margin: "40px auto",
  padding: "32px",
  textAlign: "left",
  background: "#fff8ea",
  border: "2px solid #d6a23a",
  borderRadius: "18px",
  color: "#5a0000",
  boxShadow:
    "0 8px 22px rgba(90, 50, 0, 0.20)",
};

const stileIndicatore = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "10px",
  margin: "24px 0 32px",
};

const stileVoceIndicatore = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "6px",
  textAlign: "center",
};

const stileNumeroIndicatore = {
  width: "34px",
  height: "34px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
};

const stileTitoloIndicatore = {
  fontSize: "13px",
  fontWeight: "bold",
};

const stileInput = {
  boxSizing: "border-box",
  width: "100%",
  padding: "13px",
  marginTop: "10px",
  marginBottom: "6px",
  borderRadius: "8px",
  border: "1px solid #d6a23a",
  fontSize: "16px",
  background: "#ffffff",
};

const stilePulsantePrincipale = {
  padding: "13px 20px",
  marginTop: "16px",
  background: "#0b2f55",
  color: "#fff8e8",
  border: "1px solid #d6a23a",
  borderRadius: "8px",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer",
};

const stilePulsanteSecondario = {
  ...stilePulsantePrincipale,
  background: "transparent",
  color: "#0b2f55",
};

const stilePulsanteElimina = {
  ...stilePulsantePrincipale,
  background: "#a12622",
};

const stileAzioni = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  marginTop: "18px",
};

const stileScheda = {
  margin: "18px 0",
  padding: "18px",
  background: "#ffffff",
  border: "1px solid #d6a23a",
  borderRadius: "10px",
};

const stileElencoPermessi = {
  display: "grid",
  gap: "9px",
  marginTop: "12px",
};

const stileCheckbox = {
  display: "flex",
  alignItems: "center",
  gap: "9px",
  margin: "10px 0",
};

const stileDichiarazione = {
  display: "flex",
  alignItems: "flex-start",
  gap: "9px",
  margin: "16px 0",
  padding: "16px",
  background: "#ffffff",
  border: "1px solid #d6a23a",
  borderRadius: "10px",
  lineHeight: 1.5,
};

const stileMessaggio = {
  marginTop: "22px",
  padding: "14px",
  borderRadius: "10px",
  fontWeight: "bold",
  lineHeight: 1.5,
};
