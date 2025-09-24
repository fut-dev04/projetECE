const app = angular.module("demandeApp", []);

app.controller("DemandeController", function($scope, $http) {
  const API_URL = "http://localhost:4000";
  const socket = io("http://localhost:4000");

  $scope.demandes = [];
  $scope.nouvelleDemande = {};
  $scope.loginData = {};
  $scope.isLoggedIn = false;
  $scope.currentUser = {};

  // Charger les demandes
  function chargerDemandes() {
    $http.get(API_URL + "/route").then(res => {
      $scope.demandes = res.data;
    });
  }

  // Vérifier si déjà connecté
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

  // ✅ Connexion (avec récupération du rôle exact depuis backend)
  $scope.login = function() {
    $http.post(API_URL + "/auth/connexion", $scope.loginData).then(res => {
      const token = res.data.token;

      // On récupère le vrai rôle depuis backend
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

  // Ajouter ou modifier une demande
  $scope.ajouterDemande = function() {
    if ($scope.nouvelleDemande.id) {
      $http.put(API_URL + "/route/" + $scope.nouvelleDemande.id, $scope.nouvelleDemande).then(res => {
        const index = $scope.demandes.findIndex(d => d.id === res.data.id);
        if (index !== -1) $scope.demandes[index] = res.data;
        $scope.nouvelleDemande = {};
      });
    } else {
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

  // Éditer
  $scope.editerDemande = function(demande) {
    $scope.nouvelleDemande = angular.copy(demande);
  };

  $scope.resetForm = function() {
    $scope.nouvelleDemande = {};
  };

  // Changer statut (admin)
  $scope.changerStatut = function(demande, nouveauStatut) {
    $http.put(API_URL + "/route/" + demande.id + "/statut", { statut: nouveauStatut }).then(res => {
      const index = $scope.demandes.findIndex(d => d.id === res.data.demande.id);
      if (index !== -1) $scope.demandes[index] = res.data.demande;
    }, err => {
      alert(err.data.error || "Impossible de changer le statut.");
    });
  };

  // Socket.IO → mise à jour temps réel
  socket.on("nouvelleDemande", (data) => {
    $scope.$apply(() => {
      $scope.demandes.push(data);
    });
  });

  checkLogin();
});