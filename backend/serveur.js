const http=require('http');
const app=require('./app');
const {Server}=require('socket.io');//importation de socket.io
const DemandeSocket=require('./sockets/demandesockets');
const server=http.createServer(app);
const port=4000;

const io= new Server(server,{           //initialisation de socket.io pour le serveur 
    cors:{
        origin: '*',                  //autoriser toutes les origines
    }
});
app.set('io',io);       //attacher io à app pour l'utiliser daans les routes

DemandeSocket(io);      //charger les sockets


server.listen(port,()=>{
    console.log(`serveur démarré sur http://localhost:${port}`);
})