const app = require("express")();
const http = require('http').Server(app);
const port = process.env.PORT || 3000;
const io = require("socket.io")(http);
const soap = require("soap");
const request = require('request');

//const urlSoap = 'http://localhost:8000/?wsdl';
const urlSoap = "https://info802tp-soap-python.herokuapp.com/?wsdl";

//const urlRest = 'http://localhost:5000';
const urlRest = 'https://info802tp-rest-python.herokuapp.com/';

app.use(require("express").static("public"));

app.get('/', function(req, res) {
    res.sendfile("./index.html");
});
   
http.listen(port, function() { 
    console.log('Server listening on port ' + port); 
});

io.on("connect", function(socket) {
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

    socket.on("CalculeTempsParcours", function(distance, autonomie, tempsDeRecharge, vitesseMoyenne) {
        request(urlRest + '/calculeTempsParcours/' + distance + '/' + autonomie + '/' + tempsDeRecharge + '/' + vitesseMoyenne, function(error, response) {
            console.error('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            console.log("Temps : " + response.body);
            io.emit("ReponseTempsParcours", response.body);
        });
    });
});
