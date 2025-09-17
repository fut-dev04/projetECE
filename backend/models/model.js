class Model{
    constructor(id,nom,prenom,sexe,handicap,type){
        this.id=id;
        this.nom=nom;
        this.prenom=prenom;
        this.sexe=sexe;
        this.handicap=handicap;
        this.type=type;
        this.date=new Date().toLocaleString('fr-FR',{timeZone:'Africa/Dakar'});
    }
}
module.exports = Model;