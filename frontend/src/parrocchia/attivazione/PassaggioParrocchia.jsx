import React from "react";

export default function PassaggioParrocchia({
  parrocchia,
  aggiornaParrocchia,
  setPassaggio,
  vaiAllaStrutturaPastorale,
  stileInput,
  stileAzioni,
  stilePulsanteSecondario,
  stilePulsantePrincipale,
}) {
  return (
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
        );
}
