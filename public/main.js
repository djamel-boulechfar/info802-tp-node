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
    var minutes = tempsParcours % 60;
    if (minutes != 0) {
        pReponseTempsParcours.innerHTML = "Temps de parcours : " + heures + " heures et " + minutes + " minutes.";
    } else {
        pReponseTempsParcours.innerHTML = "Temps de parcours : " + heures + " heures.";
    }
    
});
