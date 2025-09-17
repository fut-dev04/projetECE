const express = require('express');
const router = express.Router();
const Model=require('../models/model');

let tableauDemandes = [];
let idCounter = 1;

router.post('/', (req, res) => {
  console.log("Body reçu :", req.body); // <-- ça va afficher dans le terminal ce que Postman envoie

  const { prenom, nom, sexe, handicap, type } = req.body;

  // Si le body est vide → erreur
  if (!prenom || !nom || !sexe || !handicap || !type) {
    return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
  }

  const nouvelleDemande = new Model(
    idCounter++,
    prenom,
    nom,
    sexe,
    handicap,
    type
  );

  tableauDemandes.push(nouvelleDemande);
  res.status(201).json(nouvelleDemande);
});

router.get('/', (req, res) => {
  res.json(tableauDemandes);
});

module.exports = router;