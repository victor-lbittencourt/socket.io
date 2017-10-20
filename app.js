/* ----------------------------------VARIÁVEIS E REQUIRES-------------------- */
var express = require('express');
var app = express();
var http = require('http').Server(app);
var port = 8080;
var io = require('socket.io')(http);
var userId = 1; //Distribuição de IDs aos clientes
var connectionCount = 0; //Contador de clientes conectados
var firstConnection = true; //Verifica se a conexão é a primeira
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

/* ----------------------------------CONEXÃO SOCKET SERVER E EVENTOS----------*/
io.on('connection', function(socket) {
    /* A primeira conexão tem firstConnection=true para permitir
       sincronização dos clientes e garantir integridade de vm.msg */
    if(connectionCount === 0 && firstConnection === true){
        socket.emit('handshake', {
                id: userId,
                first: firstConnection
        });
        firstConnection = false;
    }
    connectionCount++;
    /* Handshake distribui IDs e firstConnection=false */
    socket.emit('handshake',{
        id: userId,
        first: firstConnection
    });
    userId++;
    /* Exibe mensagem de disconexão e decrementa contador de conexão */
    socket.on('disconnect', function() {
        connectionCount--;
        if(connectionCount == 0){
            firstConnection = true;
        }
        console.log('User disconnected');
    });
    /* Recebe handshake do cliente e exibe seu ID. Dispara um update
       request para que os clientes já conectados transmitam vm.msg para
       o novo cliente recém conectado*/
    socket.on('handshake2', function(data) {
        console.log('User ' + data.id + ' connected');
        io.emit('request-update');
    });
    /* Recebe vm.msg de um cliente e a transmite para os demais */
    socket.on('chat-message',function(data){
        io.emit('chat-message', data);
    });
});
/* ---------------------------------- |||| -----------------------------------*/
