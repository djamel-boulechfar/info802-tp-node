const app = require('express')();
const http = require('http').Server(app);
const port = process.env.port;// || 3000;
const io = require("socket.io")(http);
const soap = require("soap");

const url = 'http://localhost:8080/Info802-TP1-1.0-SNAPSHOT/HelloWorld?wsdl';

app.use(require("express").static("./"));

app.get('/', function(req, res){
    res.sendfile("/public/index.html");
});
   
http.listen(port, function(){ 
    console.log('listening on *:' + port); 
});

io.on("connect", function(socket){

    console.log("Client connecté");

    socket.on("RecupererListeVoitures", function(){
        var args = {};
        soap.createClient(url, function(err, client) {
            if (err) {
                throw err;
            }
            client.recupererListeVoitures(args, function(err, result) {
                if (err) {
                    throw err;
                }
                io.emit("ListeVoitures", result.return);
            });
        });
    });

});