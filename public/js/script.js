var app = angular.module('app', []);
app.controller('AppCtrl', function AppCtrl($scope, $timeout) {
    var vm = this;
    var timer = false;
    var userId = 0;
    var synced = false;
    vm.socket = io();


    vm.socket.on('handshake', function(data) {
        if (data.first == false && synced == false) {
            userId = data.id;
            vm.socket.emit('handshake2', {
                id: userId
            });
            console.log(userId);
            console.log('waiting sync');
            vm.socket.once('chat-message', function(data) {
                console.log('update received');
                synced = true;
                $scope.$apply(function() {
                    vm.msg = data.msg;
                });
            });
        }
        if (data.first == true && synced == false) {
            userId = data.id;
            console.log(userId);
            vm.msg = "";
            synced = true;
            vm.socket.emit('handshake2', {
                id: userId
            });
        }

    });

    vm.send = function() {
        if (synced == true) {
            console.log('Mensagem enviada: ' + vm.msg);
            vm.socket.emit('chat-message', {
                msg: vm.msg
            });
        }
    };
    vm.socket.on('chat-message', function(data) {
        $scope.$apply(function() {
            console.log('Mensagem recebida: ' + data.msg + '\n<--------------->\n');
            vm.msg = data.msg;
        });
    });

    vm.socket.on('request-update', function() {
        if (synced == true) {
            vm.socket.emit('chat-message', {
                msg: vm.msg
            });
        }
    });

});
