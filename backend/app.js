const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');


const app = express();

// Middleware pour autoriser toutes les origines (frontend <-> backend)
app.use(cors());

// Middleware pour lire du JSON dans le body
// c'est ça qui permet d'avoir req.body défini
app.use(bodyParser.json());

// Importer les routes
const demandesRoutes = require('./routes/route'); 
app.use('/route', demandesRoutes);

const connexionRoute=require('./routes/connexion');
app.use('connexion',connexionRoute);

app.use(express.static(path.join(__dirname, '../frontend')));
app.get(/.*/,(req,res)=>{
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

module.exports = app;