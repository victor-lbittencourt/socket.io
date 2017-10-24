var app = angular.module('app', []);
app.controller('AppCtrl', function AppCtrl($scope, $timeout) {
    var vm = this;
    var timer = false;
    var userId = 0;
    vm.timer = true;
    vm.retainsField = false;
    vm.socket = io();


    vm.socket.on('handshake', function(data) {
        userId = data.id;
        if (data.field) {
            $scope.$apply(function() {
                vm.retainsField = true;
            });
        }
        vm.socket.emit('handshake2', {
            id: userId,
            fieldOccupied: vm.retainsField
        });
        console.log('Connected as user ' + userId);
    });

    vm.send = function(time) {
        if (time) {
            vm.timer = false;
            setTimeout(function() {
                vm.timer = true;
                vm.socket.emit('chat-message', {
                    msg: vm.msg
                });
            }, 750);
        }
    };

    vm.socket.on('chat-message', function(data) {
        $scope.$apply(function() {
            vm.msg = data.msg;
        });
    });

    vm.socket.on('requestUpdate', function() {
        if (vm.retainsField) {
            vm.socket.emit('chat-message', {
                msg: vm.msg
            });
        }
    });

    vm.socket.on('verifyFieldDetainer', function() {
        vm.socket.emit('fieldVerification', {
            fieldOccupied: vm.retainsField,
            id: userId
        });
    });

});
