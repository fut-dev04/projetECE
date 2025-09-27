const app = angular.module("demandeApp", []);

app.controller("DemandeController", function($scope, $http) {
  const API_URL = "http://localhost:4000";
  const socket = io("http://localhost:4000");

  $scope.demandes = [];
  $scope.nouvelleDemande = {};
  $scope.loginData = {};
  $scope.isLoggedIn = false;
  $scope.currentUser = {};

  // Charger toutes les demandes
  function chargerDemandes() {
    $http.get(API_URL + "/route").then(res => {
      $scope.demandes = res.data;
    });
  }

  // Vérifier si déjà connecté (token dans localStorage)
  function checkLogin() {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      $scope.isLoggedIn = true;
      $scope.currentUser = JSON.parse(user);

      $http.defaults.headers.common["Authorization"] = "Bearer " + token;
      chargerDemandes();
    }
  }

  // Connexion
  $scope.login = function() {
    $http.post(API_URL + "/auth/connexion", $scope.loginData).then(res => {
      const token = res.data.token;

      // On récupère le vrai rôle depuis le backend
      $scope.currentUser = res.data.user;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      $scope.isLoggedIn = true;
      $http.defaults.headers.common["Authorization"] = "Bearer " + token;

      $scope.loginData = {};
      chargerDemandes();
    }, err => {
      alert("Erreur de connexion: " + err.data.error);
    });
  };

  // Déconnexion
  $scope.logout = function() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    $scope.isLoggedIn = false;
    $scope.currentUser = {};
    $scope.demandes = [];
    delete $http.defaults.headers.common["Authorization"];
  };

  //  Ajouter ou modifier une demande
  $scope.ajouterDemande = function() {
    if ($scope.nouvelleDemande.id) {
      // Modification
      $http.put(API_URL + "/route/" + $scope.nouvelleDemande.id, $scope.nouvelleDemande).then(res => {
        const index = $scope.demandes.findIndex(d => d.id === res.data.id);
        if (index !== -1) $scope.demandes[index] = res.data;
        $scope.nouvelleDemande = {};
      });
    } else {
      // Création
      $http.post(API_URL + "/route", $scope.nouvelleDemande).then(res => {
        $scope.nouvelleDemande = {};
      });
    }
  };

  // Supprimer
  $scope.supprimerDemande = function(id) {
    $http.delete(API_URL + "/route/" + id).then(res => {
      $scope.demandes = $scope.demandes.filter(d => d.id !== id);
    }, err => {
      alert(err.data.error || "Suppression refusée.");
    });
  };

  // Préparer l'édition
  $scope.editerDemande = function(demande) {
    $scope.nouvelleDemande = angular.copy(demande);
  };

  // Réinitialiser le formulaire
  $scope.resetForm = function() {
    $scope.nouvelleDemande = {};
  };

  // Changer statut (admin uniquement)
  $scope.changerStatut = function(demande, nouveauStatut) {
    $http.put(API_URL + "/route/" + demande.id + "/statut", { statut: nouveauStatut }).then(res => {
      const index = $scope.demandes.findIndex(d => d.id === res.data.demande.id);
      if (index !== -1) $scope.demandes[index] = res.data.demande;
    }, err => {
      alert(err.data.error || "Impossible de changer le statut.");
    });
  };

  // Nouvelle demande
  socket.on("nouvelleDemande", (data) => {
    $scope.$apply(() => {
      //on affiche seulement si c'est un une demande de l'utilisateur courant ou si c'est un admin
      if($scope.currentUser.role==="admin" || data.userId===$scope.currentUser.id){
        $scope.demandes.push(data);
      }
      
    });
  });

  // Demande modifiée
  socket.on("demandeModifiee", (demande) => {
    $scope.$apply(() => {
      const index = $scope.demandes.findIndex(d => d.id === demande.id);
      if (index !== -1) $scope.demandes[index] = demande;
    });
  });

  // Demande supprimée
  socket.on("demandeSupprimee", (id) => {
    $scope.$apply(() => {
      $scope.demandes = $scope.demandes.filter(d => d.id !== id);
    });
  });

  // Statut changé
  socket.on("statutChange", (demande) => {
    $scope.$apply(() => {
      const index = $scope.demandes.findIndex(d => d.id === demande.id);
      if (index !== -1) $scope.demandes[index] = demande;
    });
  });


  checkLogin();
});