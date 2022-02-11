const app = require("express")();
const http = require('http').Server(app);
const port = process.env.PORT || 3000;
const io = require("socket.io")(http);
const soap = require("soap");

// const url = 'http://localhost:8000/?wsdl';
const url = "https://info802tp-soap-python.herokuapp.com/?wsdl";

app.use(require("express").static("public"));

app.get('/', function(req, res) {
    res.sendfile("./index.html");
});
   
http.listen(port, function() { 
    console.log('listening on *:' + port); 
});

io.on("connect", function(socket) {
    socket.on("RecupererListeVoitures", function(){
        soap.createClient(url, function(err, client) {
            if (err) throw err;
            var args = {};
            client.recupererListeVoitures(args, function(err, result) {
                if (err) throw err;
                io.emit("ListeVoitures", result.recupererListeVoituresResult);
            });
        });
    });
});