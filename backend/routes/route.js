// POST -->ajouter une demande
// GET--> voir toutes les demandes 
//GET/:id--> voir une demande precise
//PUT/:id-->modifier une demande
// DELETE/:id-->supprimer une demande

const express = require('express');
const Model = require('../models/model');
const authMiddleware = require('../middlewares/middlewareConnexion');

const router = express.Router();

let tableauDemandes = [];
let idCounter = 1;

// Ajouter une demande
router.post('/', authMiddleware(), (req, res) => {
  const { prenom, nom, sexe, handicap, type } = req.body;
  if (!prenom || !nom || !sexe || !handicap || !type) {
    return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
  }

  const nouvelleDemande = new Model(idCounter++, prenom, nom, sexe, handicap, type, req.user.id);
  tableauDemandes.push(nouvelleDemande);

  req.app.get('io').emit('nouvelleDemande', nouvelleDemande);

  res.status(201).json(nouvelleDemande);
});

// Récupérer toutes les demandes
router.get('/', authMiddleware(), (req, res) => {
  res.json(tableauDemandes);
});

// Récupérer une demande précise
router.get('/:id', authMiddleware(), (req, res) => {
  const id = parseInt(req.params.id);
  const demande = tableauDemandes.find(d => d.id === id);
  if (!demande) return res.status(404).json({ message: "Demande non trouvée" });
  res.json(demande);
});

// Modifier une demande
router.put('/:id', authMiddleware(), (req, res) => {
  const id = parseInt(req.params.id);
  const demande = tableauDemandes.find(d => d.id === id);
  if (!demande) return res.status(404).json({ message: "Demande non trouvée" });

  if (req.user.role !== "admin") {
    if (demande.userId !== req.user.id) {
      return res.status(403).json({ error: "Vous ne pouvez modifier que vos propres demandes" });
    }
    if (demande.statut !== "en_attente") {
      return res.status(403).json({ error: "Impossible de modifier une demande en cours de traitement" });
    }
  }

  demande.prenom = req.body.prenom || demande.prenom;
  demande.nom = req.body.nom || demande.nom;
  demande.sexe = req.body.sexe || demande.sexe;
  demande.handicap = req.body.handicap || demande.handicap;
  demande.type = req.body.type || demande.type;
  demande.date = new Date().toLocaleString('fr-FR',{timeZone:'Africa/Dakar'});

  req.app.get('io').emit('demandeModifiee', demande);

  res.json(demande);
});

// Supprimer une demande
router.delete('/:id', authMiddleware(), (req, res) => {
  const id = parseInt(req.params.id);
  const demande = tableauDemandes.find(d => d.id === id);
  if (!demande) return res.status(404).json({ message: "Demande non trouvée" });

  if (req.user.role !== "admin") {
    if (demande.userId !== req.user.id) {
      return res.status(403).json({ error: "Vous ne pouvez supprimer que vos propres demandes" });
    }
    if (demande.statut !== "en_attente") {
      return res.status(403).json({ error: "Impossible de supprimer une demande en cours de traitement" });
    }
  }

  tableauDemandes = tableauDemandes.filter(d => d.id !== id);

  req.app.get('io').emit('demandeSupprimee', id);

  res.json({ message: "Demande supprimée", demande });
});

// Changer le statut (admin)
router.put('/:id/statut', authMiddleware("admin"), (req, res) => {
  const id = parseInt(req.params.id);
  const demande = tableauDemandes.find(d => d.id === id);
  if (!demande) return res.status(404).json({ message: "Demande non trouvée" });

  const { statut } = req.body;
  if (!statut || !["en_attente", "en_cours", "traitee"].includes(statut)) {
    return res.status(400).json({ error: "Statut invalide" });
  }

  demande.statut = statut;

  req.app.get('io').emit('statutChange', demande);

  res.json({ message: "Statut mis à jour", demande });
});

module.exports = router;