const socket = io();

function recupererListeVoitures() {
    socket.emit("RecupererListeVoitures");
}

socket.on("ListeVoitures", function(voitures) {
    const tableauVoitures = JSON.parse(voitures).voitures;
    const ulListeVoitures = document.getElementById("ulListeVoitures");
    ulListeVoitures.innerHTML = "";
    for (let i = 0; i < tableauVoitures.length; i++) {
        var liVoiture = document.createElement("li");
        liVoiture.innerHTML = tableauVoitures[i].nom + " (autonomie : " + tableauVoitures[i].autonomie + "km, temps de rechargement : " + tableauVoitures[i].tempsDeRecharge + "h)";
        ulListeVoitures.appendChild(liVoiture);
    }
});