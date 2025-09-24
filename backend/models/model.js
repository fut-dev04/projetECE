class Model{
    constructor(id,prenom,nom,sexe,handicap,type,userId){
        this.id=id;
        this.prenom=prenom;
        this.nom=nom;
        this.sexe=sexe;
        this.handicap=handicap;
        this.type=type;
        this.userId=userId;
        this.date=new Date().toLocaleString('fr-FR',{timeZone:'Africa/Dakar'});
        this.statut="en_attente";
    }
}
module.exports = Model;