class Model{
    constructor(id,prenom,nom,sexe,handicap,type){
        this.id=id;
        this.prenom=prenom;
        this.nom=nom;
        this.sexe=sexe;
        this.handicap=handicap;
        this.type=type;
        this.date=new Date().toLocaleString('fr-FR',{timeZone:'Africa/Dakar'});
    }
}
module.exports = Model;