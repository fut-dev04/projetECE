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

// 🔔 Émettre en temps réel via Socket.IO
const io = req.app.get('io');
io.emit('nouvelleDemande', nouvelleDemande);

res.status(201).json(nouvelleDemande);
});

// GET → Voir toutes les demandes
router.get('/', authMiddleware(), (req, res) => {
res.json(tableauDemandes);
});

// GET/:id → Voir une demande précise
router.get('/:id', authMiddleware(), (req, res) => {
const id = parseInt(req.params.id);
const demande = tableauDemandes.find(d => d.id === id);

if (!demande) return res.status(404).json({ message: "Demande non trouvée" });
res.json(demande);
});

// PUT/:id → Modifier une demande
router.put('/:id', authMiddleware(), (req, res) => {
const id = parseInt(req.params.id);
const index = tableauDemandes.findIndex(d => d.id === id);

if (index === -1) return res.status(404).json({ message: "Demande non trouvée" });

const demande = tableauDemandes[index];

// Vérification des droits
if (req.user.role !== "admin" && demande.userId !== req.user.id) {
return res.status(403).json({ error: "Accès interdit" });
}

// L’utilisateur normal ne peut modifier que si la demande est encore en attente
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

res.json(tableauDemandes[index]);
});

// DELETE/:id → Supprimer une demande
router.delete('/:id', authMiddleware(), (req, res) => {
const id = parseInt(req.params.id);
const demande = tableauDemandes.find(d => d.id === id);

if (!demande) return res.status(404).json({ message: "Demande non trouvée" });

// Vérification des droits
if (req.user.role !== "admin" && demande.userId !== req.user.id) {
return res.status(403).json({ error: "Accès interdit" });
}

// L’utilisateur normal ne peut supprimer que si la demande est encore en attente
if (req.user.role !== "admin" && demande.statut !== "en_attente") {
return res.status(403).json({ error: "Vous ne pouvez pas supprimer cette demande car elle est déjà en cours/traitée." });
}

tableauDemandes = tableauDemandes.filter(d => d.id !== id);
res.json({ message: "Demande supprimée", demande });
});

// PUT/:id/statut → Changer le statut (réservé aux admins)
router.put('/:id/statut', authMiddleware("admin"), (req, res) => {
const id = parseInt(req.params.id);
const { statut } = req.body;

const demande = tableauDemandes.find(d => d.id === id);
if (!demande) return res.status(404).json({ message: "Demande non trouvée" });

demande.statut = statut;

const io = req.app.get('io');
io.emit('majStatut', demande);

res.json({ message: "Statut mis à jour", demande });
});

module.exports = router;