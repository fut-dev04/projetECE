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
app.use('/auth',connexionRoute);

//page d'accueil 
app.get('/',(req,res)=>{
  const filePath=path.resolve(__dirname, '../frontend/home.html');
  // res.sendFile(path.resolve(__dirname, '..frontend/home.html'));
  console.log("envoi du fichier: ",filePath);
  res.sendFile(filePath);
});

//page de connexion
app.get('/login',(req,res)=>{
  res.sendFile(path.resolve(__dirname, '../frontend/login.html'));
});

//page d'inscription
app.get('/register',(req,res)=>{
  res.sendFile(path.resolve(__dirname, '../frontend/register.html'));
});

//page d'admin
app.get('/admin',(req,res)=>{
  res.sendFile(path.resolve(__dirname, '../frontend/admin.html'));
});

app.use(express.static(path.resolve(__dirname, '../frontend')));
// app.get(/.*/,(req,res)=>{
//   res.sendFile(path.join(__dirname, '../frontend/index.html'));
// });



module.exports = app;