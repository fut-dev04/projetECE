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

// POST → Ajouter une demande
router.post('/', authMiddleware(), (req, res) => {
  const { prenom, nom, sexe, handicap, type } = req.body;

  if (!prenom || !nom || !sexe || !handicap || !type) {
    return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
  }

  const nouvelleDemande = new Model(
    idCounter++,
    prenom,
    nom,
    sexe,
    handicap,
    type,
    req.user.id
  );

  tableauDemandes.push(nouvelleDemande);

  // 🔔 Émettre uniquement aux admins
  const io = req.app.get('io');
  io.emit('nouvelleDemande', nouvelleDemande);

  res.status(201).json(nouvelleDemande);
});

// GET → Voir les demandes
router.get('/', authMiddleware(), (req, res) => {
  if (req.user.role === "admin") {
    // admin → toutes les demandes
    res.json(tableauDemandes);
  } else {
    // utilisateur → seulement ses propres demandes
    const demandesUser = tableauDemandes.filter(d => d.userId === req.user.id);
    res.json(demandesUser);
  }
});

// GET/:id → Voir une demande précise
router.get('/:id', authMiddleware(), (req, res) => {
  const id = parseInt(req.params.id);
  const demande = tableauDemandes.find(d => d.id === id);

  if (!demande) return res.status(404).json({ message: "Demande non trouvée" });

  // utilisateur ne peut voir que ses demandes
  if (req.user.role !== "admin" && demande.userId !== req.user.id) {
    return res.status(403).json({ error: "Accès interdit" });
  }

  res.json(demande);
});

// PUT/:id  Modifier une demande
router.put('/:id', authMiddleware(), (req, res) => {
  const id = parseInt(req.params.id);
  const index = tableauDemandes.findIndex(d => d.id === id);

  if (index === -1) return res.status(404).json({ message: "Demande non trouvée" });

  const demande = tableauDemandes[index];

  // Vérification des droits
  if (req.user.role !== "admin" && demande.userId !== req.user.id) {
    return res.status(403).json({ error: "Accès interdit" });
  }

  if (req.user.role !== "admin" && demande.statut !== "en_attente") {
    return res.status(403).json({ error: "Vous ne pouvez pas modifier cette demande car elle est déjà en cours/traitée." });
  }

  tableauDemandes[index] = {
    ...demande,
    prenom: req.body.prenom || demande.prenom,
    nom: req.body.nom || demande.nom,
    sexe: req.body.sexe || demande.sexe,
    handicap: req.body.handicap || demande.handicap,
    type: req.body.type || demande.type,
    date: new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Dakar' })
  };
  const io=req.app.get('io');
  io.emit("demandeModifiee",tableauDemandes[index]);

  res.json(tableauDemandes[index]);
});

// DELETE/:id Supprimer une demande
router.delete('/:id', authMiddleware(), (req, res) => {
  const id = parseInt(req.params.id);
  const demande = tableauDemandes.find(d => d.id === id);

  if (!demande) return res.status(404).json({ message: "Demande non trouvée" });

  if (req.user.role !== "admin" && demande.userId !== req.user.id) {
    return res.status(403).json({ error: "Accès interdit" });
  }

  if (req.user.role !== "admin" && demande.statut !== "en_attente") {
    return res.status(403).json({ error: "Vous ne pouvez pas supprimer cette demande car elle est déjà en cours/traitée." });
  }

  tableauDemandes = tableauDemandes.filter(d => d.id !== id);

  const io=req.app.get('io');
  io.emit("demandeSupprimee",id);

  res.json({ message: "Demande supprimée", demande });
});

// PUT/:id/statut Changer le statut (admin uniquement)
router.put('/:id/statut', authMiddleware("admin"), (req, res) => {
  const id = parseInt(req.params.id);
  const { statut } = req.body;

  const demande = tableauDemandes.find(d => d.id === id);
  if (!demande) return res.status(404).json({ message: "Demande non trouvée" });

  demande.statut = statut;

  const io = req.app.get('io');
  io.emit('statutChange', demande);

  res.json({ message: "Statut mis à jour", demande });
});

module.exports = router;