const http=require('http');
const app=require('./app');
const {Server}=require('socket.io');//importation de socket.io
const server=http.createServer(app);
const port=4000;

const io= new Server(server,{           //initialisation de socket.io pour le serveur 
    cors:{
        origin: '*',                  //autoriser toutes les origines
    }
});

io.on('connection',(socket)=>{
    console.log("Utilisateur connecté");

    socket.on('disconnect',()=>{
        console.log("Utilisateur déconnecté!")
    });
});

module.exports={server,io}; // exportation pour l'utiliser dans les routes

server.listen(port,()=>{
    console.log(`serveur démarré sur http://localhost:${port}`);
})