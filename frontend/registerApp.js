const app = angular.module("registerApp", []);

app.controller("RegisterController", function($scope, $http) {
const API_URL = "http://localhost:4000";

$scope.user = {};

$scope.register = function() {
$http.post(API_URL + "/auth/inscription", $scope.user).then(res => {
alert("Utilisateur créé avec succès !");
window.location.href = "/login"; // redirection vers connexion
}, err => {
alert("Erreur : " + (err.data.error || "Impossible de s’inscrire"));
});
};
});