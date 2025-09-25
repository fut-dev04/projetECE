const app = angular.module("adminApp", []);

app.controller("AdminController", function($scope, $http) {
  const API_URL = "http://localhost:4000";
  const socket = io("http://localhost:4000");

  $scope.demandes = [];
  $scope.currentUser = {};

  // Charger toutes les demandes
  function chargerDemandes() {
    $http.get(API_URL + "/route").then(res => {
      $scope.demandes = res.data;
    });
  }

  // Vérifier si connecté et admin
  function checkLogin() {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      $scope.currentUser = JSON.parse(user);
      $http.defaults.headers.common["Authorization"] = "Bearer " + token;

      if ($scope.currentUser.role !== "admin") {
        alert("Accès réservé aux administrateurs !");
        window.location.href = "/";
        return;
      }

      chargerDemandes();
    } else {
      alert("Veuillez vous connecter d’abord !");
      window.location.href = "/";
    }
  }

  // Déconnexion
  $scope.logout = function() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete $http.defaults.headers.common["Authorization"];
    window.location.href = "/";
  };

  // Supprimer une demande
  $scope.supprimerDemande = function(id) {
    $http.delete(API_URL + "/route/" + id).then(res => {
      $scope.demandes = $scope.demandes.filter(d => d.id !== id);
    }, err => { 
      alert(err.data.error || "Erreur suppression"); 
    });
  };

  // Changer statut
  $scope.changerStatut = function(demande, nouveauStatut) {
    $http.put(API_URL + "/route/" + demande.id + "/statut", { statut: nouveauStatut }).then(res => {
      const index = $scope.demandes.findIndex(d => d.id === res.data.demande.id);
      if (index !== -1) $scope.demandes[index] = res.data.demande;
    }, err => { 
      alert(err.data.error || "Erreur changement statut"); 
    });
  };


  // Nouvelle demande
  socket.on("nouvelleDemande", (data) => {
    $scope.$apply(() => {
      $scope.demandes.push(data);
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