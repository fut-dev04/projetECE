const app = angular.module("demandeApp", []);

app.controller("DemandeController", function($scope, $http) {
  $scope.demandes = [];
  $scope.nouvelleDemande = {};

  const API_URL = "http://localhost:4000/route";
  const socket = io("http://localhost:4000");

  // Charger toutes les demandes
  function chargerDemandes() {
    $http.get(API_URL).then(res => {
      $scope.demandes = res.data;
    });
  }

  // Ajouter ou Modifier une demande
  $scope.ajouterDemande = function() {
    if ($scope.nouvelleDemande.id) {
      // Modification
      $http.put(API_URL + "/" + $scope.nouvelleDemande.id, $scope.nouvelleDemande)
        .then(res => {
          const index = $scope.demandes.findIndex(d => d.id === res.data.id);
          if (index !== -1) $scope.demandes[index] = res.data;
          $scope.nouvelleDemande = {};
        }, err => {
          alert("Erreur modification: " + err.data.message);
        });
    } else {
      // Ajout
      $http.post(API_URL, $scope.nouvelleDemande).then(res => {
        $scope.nouvelleDemande = {};
      }, err => {
        alert("Erreur ajout: " + err.data.error);
      });
    }
  };

  // Supprimer une demande
  $scope.supprimerDemande = function(id) {
    $http.delete(API_URL + "/" + id).then(res => {
      $scope.demandes = $scope.demandes.filter(d => d.id !== id);
    }, err => {
      alert("Erreur suppression: " + err.data.message);
    });
  };

  // Pré-remplir le formulaire pour modification
  $scope.editerDemande = function(demande) {
    $scope.nouvelleDemande = angular.copy(demande);
  };

  // Réinitialiser le formulaire
  $scope.resetForm = function() {
    $scope.nouvelleDemande = {};
  };

  // Réception en temps réel via Socket.IO
  socket.on("nouvelleDemande", (data) => {
    $scope.$apply(() => {
      $scope.demandes.push(data);
    });
  });

  // Charger au démarrage
  chargerDemandes();
});