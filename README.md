# Ars Liturgica — Versione Test Privata

Questa è una versione tecnica di prova composta da:

- **Frontend grafico**: interfaccia Ars Liturgica in stile bordeaux/oro/avorio
- **Motore CEI**: recupero dati dalla pagina Liturgia del Giorno CEI
- **Collegamento shop**: pulsante fisso verso https://www.genesiartesacra.it/shop/
- **Modalità test**: data manuale in formato AAAAMMGG

## Struttura

```text
ars-liturgica-test/
  backend/
    src/server.js
  frontend/
    src/App.jsx
```

## Avvio locale

Aprire due terminali.

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

Il motore sarà disponibile su:

```text
http://localhost:3001/api/liturgia-oggi
http://localhost:3001/api/liturgia?data=20260521
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

L'app sarà disponibile su:

```text
http://localhost:5173
```

## Nota importante

Questa versione è pensata per **test privato**, non per pubblicazione.
Prima della pubblicazione definitiva andranno verificati:

- diritti d'uso dei testi liturgici
- stabilità del recupero dati CEI
- eventuali autorizzazioni o modalità ufficiali di citazione fonte
- deploy privato protetto da password