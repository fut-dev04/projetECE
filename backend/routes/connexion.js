const express = require('express');
const jwt = require('jsonwebtoken');  
const bcrypt = require('bcryptjs');    
const User = require('../models/modelUser');

const router = express.Router();

let users = []; 
let idCounter = 1;
const SECRET = "mon_secret"; 

// Inscription
router.post('/inscription', async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Champs manquants" });
  }

  // Vérifier si username déjà utilisé
  const exist = users.find(u => u.username === username);
  if (exist) return res.status(400).json({ error: "Nom d'utilisateur déjà pris" });

  // Hash du mot de passe
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User(idCounter++, username, hashedPassword, role || "user");
  users.push(user);

  res.status(201).json({
    message: "Utilisateur créé",
    user: { id: user.id, username: user.username, role: user.role }
  });
});

//  Connexion
router.post('/connexion', async (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ error: "Utilisateur non trouvé" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: "Mot de passe incorrect" });

  // Générer un token JWT
  const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: "1h" });

  res.json({
    message: "Connexion réussie",
    token,
    user: { id: user.id, username: user.username, role: user.role }
  });
});

module.exports = router;