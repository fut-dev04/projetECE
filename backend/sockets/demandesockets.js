function DemandeSocket(io){
    io.on('connect',(socket)=>{
        console.log("Un client s'est connecté(e)!", socket.id);

        socket.on('message',(msg)=>{
            console.log("Message reçu du client:",msg);
        });
        socket.on('disconnect',()=>{
            console.log("Client déconecté:",socket.id);
        });
    });
}
module.exports = DemandeSocket;