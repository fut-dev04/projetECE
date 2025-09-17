const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware pour autoriser toutes les origines (frontend ↔ backend)
app.use(cors());

// Middleware pour lire du JSON dans le body
// ⚠ c'est ça qui permet d'avoir req.body défini
app.use(bodyParser.json());

// Importer les routes
const demandesRoutes = require('./routes/route'); // ton fichier est route.js dans routes/
app.use('/route', demandesRoutes);

// Petit test pour la racine
app.get('/', (req, res) => {
  res.send('API fonctionne 🚀');
});

module.exports = app;