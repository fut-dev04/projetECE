const express = require('express');
const router = express.Router();
const Model=require('../models/model');

let tableauDemandes = [];
let idCounter = 1;

router.post('/', (req, res) => {             // route post me permet de creer une demande
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

router.get('/', (req, res) => {        //route get me permet de recuperer les demandes
  res.json(tableauDemandes);
});

router.get('/:id',(req,res)=>{   //cette route nous permet de recuperer une demande par son id
  const recupererId=parseInt(req.params.id);
  const chercherId=tableauDemandes.find(index=>index.id===id);
  if(chercherId){
    res.json(chercherId);
  }else{
    res.status(404).json({message:"Cette id n'existe pas"});
  }
});

router.put('/:id',(req,res)=>{
  
})

module.exports = router;