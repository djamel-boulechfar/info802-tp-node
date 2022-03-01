const app = require("express")();
const http = require('http').Server(app);
const port = process.env.PORT || 3000;
const io = require("socket.io")(http);
const soap = require("soap");
const request = require('request');

const urlSoap = "https://info802tp-soap-python.herokuapp.com/?wsdl";

const urlRest = 'https://info802tp-rest-python.herokuapp.com';

app.use(require("express").static("public"));

app.get('/', function(req, res) {
    res.sendfile("./index.html");
});
   
http.listen(port, function() { 
    console.log('Server listening on port ' + port); 
});

io.on("connect", function(socket) {

    // Envoie une requête à mon service Soap pour récupérer la liste des véhicules disponibles
    // et renvoie cette liste au fichier js lié à ma page HTML
    socket.on("RecupererListeVoitures", function(){
        soap.createClient(urlSoap, function(err, client) {
            if (err) throw err;
            var args = {};
            client.recupererListeVoitures(args, function(err, result) {
                if (err) throw err;
                io.emit("ListeVoitures", result.recupererListeVoituresResult);
            });
        });
    });

    // Envoie une requête à mon service Soap pour récupérer les informations de la voiture
    // dont le nom est passé en paramètre et renvoie ces informations au fichier js lié à ma page HTML
    socket.on("RecupererInfosVoiture", function(nomVoiture) {
        soap.createClient(urlSoap, function(err, client) {
            if (err) throw err;
            var args = {};
            client.recupererListeVoitures(args, function(err, result) {
                if (err) throw err;
                io.emit("InfosVoiture", nomVoiture, result.recupererListeVoituresResult);
            });
        });
    });

    // Envoie une requête à mon API Rest pour calculer un temps de parcours en fonction des paramètres donnés
    // et renvoie ce temps de parcours au fichier js lié à ma page HTML
    socket.on("CalculeTempsParcours", function(distance, autonomie, tempsDeRecharge, vitesseMoyenne) {
        request(urlRest + '/calculeTempsParcours/' + distance + '/' + autonomie + '/' + tempsDeRecharge + '/' + vitesseMoyenne, function(error, response) {
            console.error('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            console.log("Temps : " + response.body);
            io.emit("ReponseTempsParcours", response.body);
        });
    });

    // Envoie une requête à mon API Rest pour calculer un temps de parcours en fonction du temps de trajet calculé
    // par Google Maps et du temps de recharge nécessaire en fonction de l'autonomie du véhicule sélectionné et de la distance du parcours
    // et renvoie ce temps de parcours au fichier js lié à ma page HTML
    socket.on("CalculeTempsParcoursAvecGoogleMaps", function(distanceParcours, autonomie, tempsDeRecharge, dureeParcours) {
        request(urlRest + '/calculeTempsParcoursAvecMaps/' + distanceParcours + '/' + autonomie + '/' + tempsDeRecharge + '/' + dureeParcours, function(error, response) {
            console.error('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            console.log("Temps : " + response.body);
            io.emit("ReponseTempsParcoursAvecGoogleMaps", response.body);
        });
    })
});
