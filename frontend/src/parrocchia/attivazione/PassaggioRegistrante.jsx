import React from "react";

export default function PassaggioRegistrante({
  registrante,
  aggiornaRegistrante,
  codiceOtp,
  setCodiceOtp,
  otpInviato,
  otpVerificato,
  invioOtpInCorso,
  verificaOtpInCorso,
  inviaCodiceOtp,
  verificaCodiceOtp,
  stileInput,
  stilePulsantePrincipale,
}) {
  return (
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
              setCodiceOtp(evento.target.value)
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
  );
}
