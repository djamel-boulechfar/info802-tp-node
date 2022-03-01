const socket = io();

window.onload = function() {
    recupererListeVoitures();

    document.querySelector("#formulaireParcours").addEventListener("submit", (e) => {
        e.preventDefault();
        var selectListeVoitures = document.getElementById("selectListeVoitures");
        var nomVoiture = selectListeVoitures.options[selectListeVoitures.selectedIndex].value;
        if (nomVoiture === "none") {
            alert("ERREUR: Veuillez d'abord sélectionner une voiture.");
        } else {
            var distance = document.getElementById("inputDistance").value;
            var autonomie = document.getElementById("inputAutonomie").value;
            var tempsDeRecharge = document.getElementById("inputTempsDeRecharge").value;
            var vitesseMoyenne = document.getElementById("inputVitesseMoyenne").value;
            socket.emit("CalculeTempsParcours", distance, autonomie, tempsDeRecharge, vitesseMoyenne);
        }
    });
}

function recupererListeVoitures() {
    socket.emit("RecupererListeVoitures");
}

function recupererInfosVoiture() {
    var selectListeVoitures = document.getElementById("selectListeVoitures");
    var nomVoiture = selectListeVoitures.options[selectListeVoitures.selectedIndex].value;
    socket.emit("RecupererInfosVoiture", nomVoiture);
}

socket.on("ListeVoitures", function(voitures) {
    var tableauVoitures = JSON.parse(voitures);
    var selectListeVoitures = document.getElementById("selectListeVoitures");
    for (let i = 0; i < tableauVoitures.length; i++) {
        var optionVoiture = document.createElement("option");
        optionVoiture.setAttribute("value", tableauVoitures[i].nom);
        optionVoiture.innerHTML = tableauVoitures[i].nom;
        selectListeVoitures.appendChild(optionVoiture);
    }
});

socket.on("InfosVoiture", function(nomVoiture, voitures) {
    var tableauVoitures = JSON.parse(voitures);
    var inputAutonomie = document.getElementById("inputAutonomie");
    var inputTempsDeRecharge = document.getElementById("inputTempsDeRecharge");
    for (let i = 0; i < tableauVoitures.length; i++) {
        if (tableauVoitures[i].nom === nomVoiture) {
            inputAutonomie.setAttribute("value", tableauVoitures[i].autonomie);
            inputTempsDeRecharge.setAttribute("value", tableauVoitures[i].tempsDeRecharge);
        }
    } 
});

socket.on("ReponseTempsParcours", function(response) {
    var tempsParcours = JSON.parse(response).tempsParcours;
    var pReponseTempsParcours = document.getElementById("pReponseTempsParcours");
    var heures = Math.floor(tempsParcours / 60);
    var minutes = Math.floor(tempsParcours % 60);
    if (minutes != 0) {
        pReponseTempsParcours.innerHTML = "Temps de parcours : " + heures + " heures et " + minutes + " minutes.";
    } else {
        pReponseTempsParcours.innerHTML = "Temps de parcours : " + heures + " heures.";
    }
});

// Partie pour Google Maps
function initMap() {
    const latitudeLongitudeDepart = {
        lat: 45.649392,
        lng: 5.859076
    };
    
    const mapOptions = {
        center: latitudeLongitudeDepart,
        zoom: 10,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    
    const map = new google.maps.Map(document.getElementById("googleMap"), mapOptions);

    // Direction service
    const directionsService = new google.maps.DirectionsService();

    // DirectionsRenderer
    const directionsRenderer = new google.maps.DirectionsRenderer();

    // Liaison du renderer à la map
    directionsRenderer.setMap(map);

    // Listener sur le bouton "Calculer le trajet"
    document.querySelector("#formulaireGoogleMaps").addEventListener("submit", (e) => {
        e.preventDefault();
        var selectListeVoitures = document.getElementById("selectListeVoitures");
        var nomVoiture = selectListeVoitures.options[selectListeVoitures.selectedIndex].value;
        if (nomVoiture === "none") {
            alert("ERREUR: Veuillez d'abord sélectionner une voiture.");
        } else {
            var depart = document.getElementById("inputDepart").value;
            var arrivee = document.getElementById("inputArrivee").value;
    
            // Requête pour obtenir le chemin entre deux villes
            var request = {
                origin: depart,
                destination: arrivee,
                travelMode: google.maps.TravelMode.DRIVING,
                unitSystem: google.maps.UnitSystem.METRIC
            }
    
            directionsService.route(request, function(result, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    var distanceParcours = Math.floor(result.routes[0].legs[0].distance.value / 1000);
                    var dureeParcours = result.routes[0].legs[0].duration.value;
                    var autonomie = document.getElementById("inputAutonomie").value;
                    var tempsDeRecharge = document.getElementById("inputTempsDeRecharge").value;
                    distanceTrajet.innerHTML = distanceParcours + " km";
                    //dureeTrajet.innerHTML = dureeParcours;
                    console.log(result.routes[0].legs[0].duration.text);
                    directionsRenderer.setDirections(result);
                    socket.emit("CalculeTempsParcoursAvecGoogleMaps", distanceParcours, autonomie, tempsDeRecharge, dureeParcours);
                } else {
                    alert("Erreur sur le calcul du trajet, veuillez vérifier les informations entrées. Il se peut également que le trajet demandé ne soit pas réalisable.")
                }
            });
        }
    });
}

socket.on("ReponseTempsParcoursAvecGoogleMaps", function(resultat) {
    var infosTempsParcours = JSON.parse(resultat);
    var elementTempsParcours = document.getElementById("dureeTrajet");
    var heures = Math.floor(infosTempsParcours.tempsParcours / 3600);
    var minutes = Math.floor((infosTempsParcours.tempsParcours % 3600) / 60);
    elementTempsParcours.innerHTML = heures + " heure(s) et " + minutes + " minute(s) dont " + infosTempsParcours.nbRecharges + " recharge(s) de " + infosTempsParcours.tempsChargement + " minute(s) chacune";
});
