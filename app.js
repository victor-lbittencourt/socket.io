/* ----------------------------------VARIÁVEIS E REQUIRES-------------------- */
var express = require('express');
var app = express();
var http = require('http').Server(app);
var port = 8080;
var io = require('socket.io')(http);
var userId = 0; //Distribuição de IDs aos clientes
var connectionCount = 0;
var freeField = false;
var count = 0;
var detainerConnected = false;
var idsConnected = [];
/* ---------------------------------- |||| -----------------------------------*/

/* ----------------------------------ROTEAMENTO INICIAL-----------------------*/
app.use(express.static('public'));
app.use(express.static('src/views'));
app.get('/', function(req, res) {
    res.send('Hello there');
});
app.get('/books', function(req, res) {
    res.send('Hello books');
});
/* ---------------------------------- |||| -----------------------------------*/

/* ----------------------------------SETANDO SERVIDOR-------------------------*/
http.listen(port, function(err) {
    console.log("Listening on port " + port);
});
/* ---------------------------------- |||| -----------------------------------*/

/* ----------------------------------FUNÇÕES AUXILIARES-----------------------*/
var updateConnectedIds = function(ids){
    var numOfConnections = ids.length() - 1;
    var count = 0;
    io.emit('verifyFieldDetainer');
    socket.on('fieldVerification', function(data) {
        count++;
        if (numOfConnection == 0) {
            freeField = true;
            console.log('Field Freed: 0 Connections.');
        }
        if (data.fieldOccupied && detainerConnected == false) {
            detainerConnected = true;
        }
        if (count == connectionCount && detainerConnected == false) {
            freeField = true;
            console.log('Field Freed: Detainer Disconnected.\n');
        }
    });
};


/* ----------------------------------CONEXÃO SOCKET SERVER E EVENTOS----------*/
io.on('connection', function(socket) {
    connectionCount++;
    userId++;
    if(userId==1){
        freeField=true;
    }
    else {
        freeField=false;
    }
    socket.emit('handshake', {
        id: userId,
        field: freeField
    });

    socket.on('handshake2', function(data) {
        idsConnected.push(data.id);
        console.log('User ' + data.id + ' connected');
        console.log('retainsField:' + data.fieldOccupied + '\n');
        if (data.id > 1) {
            io.emit('requestUpdate');
        }
        if (data.fieldOccupied) {
            freeField = false;
        }
    });

    socket.on('disconnect', function() {
        updateConnectedIds(idsConnected);
        count = 0;
        detainerConnected = false;
        console.log('User disconnected');
    });



    socket.on('chat-message', function(data) {
        io.emit('chat-message', data);
    });


});

/* ---------------------------------- |||| -----------------------------------*/
