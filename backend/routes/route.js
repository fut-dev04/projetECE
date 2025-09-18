const express = require('express');
const router = express.Router();
const Model=require('../models/model');

let tableauDemandes = [];
let idCounter = 1;

router.post('/', (req, res) => {              // route post me permet de creer une demande
  console.log("Body reçu :", req.body);       // <-- ça va afficher dans le terminal ce que Postman envoie

  const { prenom, nom, sexe, handicap, type } = req.body;

  // Si le body est vide --> erreur
  if (!prenom || !nom || !sexe || !handicap || !type) {
    return res.status(400).json({ error: 'Tous les champs doivent être obligatoires' });
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
  const chercherId=tableauDemandes.find(x=>x.id===id);
  if(chercherId){
    res.json(chercherId);
  }else{
    res.status(404).json({message:"Cette id n'existe pas"});
  }
});

router.put('/:id',(req,res)=>{       // cette route me permet de modifier une demande par son id
  const id=parseInt(req.params.id);
  const chercherIndex=tableauDemandes.findIndex(x=>x.id===id);
  if(chercherIndex!==-1){
    tableauDemandes[chercherIndex]={
      ...tableauDemandes[chercherIndex],
      prenom:req.body.prenom || tableauDemandes[chercherIndex].prenom,
      nom:req.body.nom || tableauDemandes[chercherIndex].nom,
      sexe:req.body.sexe || tableauDemandes[chercherIndex].sexe,
      handicap:req.body.handicap || tableauDemandes[chercherIndex].handicap,
      type:req.body.type || tableauDemandes[chercherIndex].type,
      date: new Date().toLocaleString('fr-FR',{timeZone:'Africa/Dakar'})
    };
    res.json(tableauDemandes[chercherIndex]);
}else{
  res.status(404).json({message:'Demande non trouvée'});
}

});

router.delete('/:id',(req,res)=>{
  const id=parseInt(req.params.id);
  const chercherId=tableauDemandes.find(x=>x.id===id);
  if(!chercherId){
    return res.status(404).json({messaage:'Demande non trouvée'});
  }
  tableauDemandes=tableauDemandes.filter(x=>x.id !==id); 
  res.json(chercherId);     
});

module.exports = router;