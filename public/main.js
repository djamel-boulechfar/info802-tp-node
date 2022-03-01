const socket = io();

// Chargement de la liste des voitures et assignation d'un event pour calculer la durée du trajet (avec ma propre API, sans Google Maps, partie de gauche du site)
window.onload = function() {
    recupererListeVoitures(); // Récupération de la liste des voitures

    // Ajout du listener sur le submit du formulaire (partie gauche du site)
    document.querySelector("#formulaireParcours").addEventListener("submit", (e) => {
        e.preventDefault(); // Annulation de l'effet de base de l'event submit
        var selectListeVoitures = document.getElementById("selectListeVoitures");
        var nomVoiture = selectListeVoitures.options[selectListeVoitures.selectedIndex].value; // Récupération du nom de la voiture sélectionnée
        if (nomVoiture === "none") {
            alert("ERREUR: Veuillez d'abord sélectionner une voiture.");
        } else {
            var distance = document.getElementById("inputDistance").value;
            var autonomie = document.getElementById("inputAutonomie").value;
            var tempsDeRecharge = document.getElementById("inputTempsDeRecharge").value;
            var vitesseMoyenne = document.getElementById("inputVitesseMoyenne").value;
            // Emission de l'event permettant de demander au serveur de calculer la durée du trajet grâce à mon API Rest (sans Google Maps)
            socket.emit("CalculeTempsParcours", distance, autonomie, tempsDeRecharge, vitesseMoyenne);
        }
    });
}

// Fonction émettant sur la socket l'event permettant de demander au serveur la liste des véhicules disponibles grâce à mon service Soap
function recupererListeVoitures() {
    socket.emit("RecupererListeVoitures");
}

// Fonction émettant sur la socket l'event permettant de demander au serveur les informations relatives au véhicule sélectionné grâce à mon service Soap
function recupererInfosVoiture() {
    var selectListeVoitures = document.getElementById("selectListeVoitures");
    var nomVoiture = selectListeVoitures.options[selectListeVoitures.selectedIndex].value;
    socket.emit("RecupererInfosVoiture", nomVoiture);
}

// Ecoute l'event sur lequel le serveur envoie la liste des véhicules récupérés grâce à mon service Soap
socket.on("ListeVoitures", function(voitures) {
    var tableauVoitures = JSON.parse(voitures); // Parsing de la chaîne de caractères reçue en JSON
    var selectListeVoitures = document.getElementById("selectListeVoitures");
    for (let i = 0; i < tableauVoitures.length; i++) { // Ajout d'une option dans le select pour chaque voiture
        var optionVoiture = document.createElement("option");
        optionVoiture.setAttribute("value", tableauVoitures[i].nom);
        optionVoiture.innerHTML = tableauVoitures[i].nom;
        selectListeVoitures.appendChild(optionVoiture);
    }
});

// Ecoute l'event sur lequel le serveur envoie les informations du véhicule sélectionné récupérées grâce à mon service Soap
socket.on("InfosVoiture", function(nomVoiture, voitures) {
    var tableauVoitures = JSON.parse(voitures); // Parsing de la chaîne de caractères en JSON
    var inputAutonomie = document.getElementById("inputAutonomie");
    var inputTempsDeRecharge = document.getElementById("inputTempsDeRecharge");
    for (let i = 0; i < tableauVoitures.length; i++) {
        if (tableauVoitures[i].nom === nomVoiture) { // Affichage des informations si le nom du véhicule correspond au nom du véhicule sélectionné
            inputAutonomie.setAttribute("value", tableauVoitures[i].autonomie);
            inputTempsDeRecharge.setAttribute("value", tableauVoitures[i].tempsDeRecharge);
        }
    } 
});

// Ecoute l'event sur lequel le serveur envoie le temps de parcours calculé grâce à mon API Rest (sans Google Maps)
socket.on("ReponseTempsParcours", function(response) {
    var tempsParcours = JSON.parse(response).tempsParcours;
    var pReponseTempsParcours = document.getElementById("pReponseTempsParcours");
    // Calcul du temps de trajet en heures et minutes
    var heures = Math.floor(tempsParcours / 60);
    var minutes = Math.floor(tempsParcours % 60);
    if (minutes != 0) { // Affichage du temps de trajet sur la page web
        pReponseTempsParcours.innerHTML = "Temps de parcours : " + heures + " heures et " + minutes + " minutes.";
    } else {
        pReponseTempsParcours.innerHTML = "Temps de parcours : " + heures + " heures.";
    }
});

// Fonction appelée pour afficher la map grâce à l'API de Google Maps
function initMap() {
    // Coordonnées de départ pour l'affichage de la map
    const latitudeLongitudeDepart = {
        lat: 45.649392,
        lng: 5.859076
    };
    
    // Options de départ pour l'affichage de la map
    const mapOptions = {
        center: latitudeLongitudeDepart,
        zoom: 10,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    
    // Instanciation de la map dans la div créée pour la contenir
    const map = new google.maps.Map(document.getElementById("googleMap"), mapOptions);

    // DirectionsService
    const directionsService = new google.maps.DirectionsService();

    // DirectionsRenderer
    const directionsRenderer = new google.maps.DirectionsRenderer();

    // Liaison du renderer à la map
    directionsRenderer.setMap(map);

    // Ajout d'un listener sur le bouton "Calculer le trajet" pour afficher le trajet entre deux villes données sur la carte,
    // calculer la distance de ce trajet et sa durée et demander au serveur de faire appel à mon API Rest pour ajouter le temps
    // de recharge nécessaire en fonction de l'autonomie du véhicule et de la distance du trajet à la durée de base du trajet
    document.querySelector("#formulaireGoogleMaps").addEventListener("submit", (e) => {
        e.preventDefault(); // Annulation de l'effet de base de l'event submit
        var selectListeVoitures = document.getElementById("selectListeVoitures");
        var nomVoiture = selectListeVoitures.options[selectListeVoitures.selectedIndex].value;
        if (nomVoiture === "none") {
            alert("ERREUR: Veuillez d'abord sélectionner une voiture.");
        } else {
            // Récupération de la ville de départ et de la ville d'arrivée
            var depart = document.getElementById("inputDepart").value;
            var arrivee = document.getElementById("inputArrivee").value;
    
            // Requête pour obtenir le chemin entre deux villes en voiture
            var request = {
                origin: depart,
                destination: arrivee,
                travelMode: google.maps.TravelMode.DRIVING,
                unitSystem: google.maps.UnitSystem.METRIC
            }
            
            // Execution de la requête avec les services de Google
            directionsService.route(request, function(result, status) {
                if (status == google.maps.DirectionsStatus.OK) { // Si la requête a fonctionné
                    // Récupération des informations du trajet
                    var distanceParcours = Math.floor(result.routes[0].legs[0].distance.value / 1000);
                    var dureeParcours = result.routes[0].legs[0].duration.value;
                    var autonomie = document.getElementById("inputAutonomie").value;
                    var tempsDeRecharge = document.getElementById("inputTempsDeRecharge").value;
                    distanceTrajet.innerHTML = result.routes[0].legs[0].distance.text; // Affichage de la distance du trajet
                    directionsRenderer.setDirections(result); // Affichage du tracé sur la map
                    // Emission de l'event permettant de demander au serveur de calculer la durée du trajet grâce à mon API Rest (en prenant en compte Google Maps)
                    socket.emit("CalculeTempsParcoursAvecGoogleMaps", distanceParcours, autonomie, tempsDeRecharge, dureeParcours);
                } else { // Si la requête a échoué
                    alert("Erreur sur le calcul du trajet, veuillez vérifier les informations entrées. Il se peut également que le trajet demandé ne soit pas réalisable.")
                }
            });
        }
    });
}

// Ecoute l'event sur lequel le serveur envoie le temps de parcours calculé grâce à mon API Rest (en prenant en compte Google Maps)
socket.on("ReponseTempsParcoursAvecGoogleMaps", function(resultat) {
    var infosTempsParcours = JSON.parse(resultat); // Parsing de la chaîne de caractères reçue en JSON
    var elementTempsParcours = document.getElementById("dureeTrajet");
    // Calcule de la durée en heures et minutes
    var heures = Math.floor(infosTempsParcours.tempsParcours / 3600);
    var minutes = Math.floor((infosTempsParcours.tempsParcours % 3600) / 60);
    // Affichage du temps de parcours sur le site
    elementTempsParcours.innerHTML = heures + " heure(s) et " + minutes + " minute(s) dont " + infosTempsParcours.nbRecharges + " recharge(s) de " + infosTempsParcours.tempsChargement + " minute(s) chacune";
});
