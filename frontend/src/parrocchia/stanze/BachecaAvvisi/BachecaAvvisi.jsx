{mostraAnteprima && (
  <aside className="anteprima-avviso">
    <article className="foglio-ufficiale">
      <header className="foglio-intestazione">
        <p className="foglio-sovratitolo">Parrocchia</p>

        <div
          className="foglio-simbolo-chiesa"
          aria-hidden="true"
        >
          <svg viewBox="0 0 120 90">
            <path d="M60 7v16" />
            <path d="M52 15h16" />
            <path d="M18 78h84" />
            <path d="M24 78V43l36-24 36 24v35" />
            <path d="M34 78V50h16v28" />
            <path d="M70 78V50h16v28" />
            <path d="M52 78V52c0-8 16-8 16 0v26" />
            <path d="M24 43h72" />
          </svg>
        </div>

        <h1 className="foglio-nome-parrocchia">
          {localStorage.getItem("ars_nome_parrocchia") ||
            "Nome della Parrocchia"}
        </h1>

        <p className="foglio-localita">
          Comunicazione alla comunità parrocchiale
        </p>

        <div
          className="foglio-separatore foglio-separatore-croce"
          aria-hidden="true"
        >
          <span />
          <strong>✝</strong>
          <span />
        </div>

        <p className="foglio-tipo-documento">
          Avviso Ufficiale
        </p>

        <div className="foglio-dati-documento">
          <div>
            <span>Data</span>
            <strong>
              {new Intl.DateTimeFormat("it-IT").format(
                new Date()
              )}
            </strong>
          </div>

          <div>
            <span>Pubblicazione</span>
            <strong>
              {pubblicazione === "subito"
                ? "Immediata"
                : dataPubblicazione
                  ? new Intl.DateTimeFormat("it-IT").format(
                      new Date(
                        `${dataPubblicazione}T12:00:00`
                      )
                    )
                  : "Da definire"}
            </strong>
          </div>
        </div>
      </header>

      <main className="foglio-corpo">
        {(categoria ||
          categoriaPersonalizzata.trim()) && (
          <p className="foglio-categoria">
            {categoria === "Altro"
              ? categoriaPersonalizzata ||
                "Categoria personalizzata"
              : categoria}
          </p>
        )}

        <h2 className="foglio-titolo">
          {titolo || "Titolo dell’avviso"}
        </h2>

        <div className="foglio-ornamento" aria-hidden="true">
          <span />
          <strong>◆</strong>
          <span />
        </div>

        <div className="foglio-testo">
          {testo
            ? testo.split("\n").map((riga, indice) => (
                <p key={`${indice}-${riga}`}>
                  {riga || "\u00A0"}
                </p>
              ))
            : (
              <p>
                Il testo dell’avviso comparirà qui.
              </p>
            )}
        </div>

        {immagine && (
          <div className="foglio-allegato">
            <span>Immagine o locandina</span>
            <strong>{immagine.name}</strong>
          </div>
        )}

        {allegato && (
          <div className="foglio-allegato">
            <span>Documento allegato</span>
            <strong>{allegato.name}</strong>
          </div>
        )}

        <div className="foglio-firma">
          <p>
            {firma === "parroco"
              ? "Il Parroco"
              : firma === "nessuna"
                ? ""
                : localStorage.getItem(
                    "ars_nome_parrocchia"
                  ) || "La Parrocchia"}
          </p>
        </div>
      </main>

      <footer className="foglio-piede">
        <div
          className="foglio-separatore foglio-separatore-finale"
          aria-hidden="true"
        >
          <span />
          <strong>✦</strong>
          <span />
        </div>

        <p>
          {localStorage.getItem("ars_nome_parrocchia") ||
            "Nome della Parrocchia"}
        </p>

        <div className="foglio-informazioni-finali">
          <span>
            Destinazioni:{" "}
            {destinazioni.length > 0
              ? destinazioni.join(" · ")
              : "da definire"}
          </span>

          <span>
            Scadenza:{" "}
            {tipoScadenza === "nessuna"
              ? "nessuna"
              : dataScadenza
                ? new Intl.DateTimeFormat("it-IT").format(
                    new Date(
                      `${dataScadenza}T12:00:00`
                    )
                  )
                : "da definire"}
          </span>
        </div>
      </footer>
    </article>
  </aside>
)}
