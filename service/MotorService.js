'use strict';
var phidget22 = require('phidget22');

var SERVER_PORT = 5661;
var HOSTNAME = 'localhost';

console.log('connecting to server');
var phidgetConnection;

var connectToServoController = function () {
  phidgetConnection = new phidget22.RCServo();
  var conn = new phidget22.Connection(SERVER_PORT, HOSTNAME, { name: 'Server Connection', passwd: '' });
  conn.connect()
    .then(function() {
      console.log('connected');
    })
    .catch(function (err) {
      console.error(err.message);
      process.exit(1);
    });

  phidgetConnection.onAttach = function (ch) {
    console.log(ch + ' attached');
    ch.setTargetPosition(0);
    ch.setEngaged(1);
  };
  
  
  phidgetConnection.open().then(function (connection) {
    console.log('channel open');
  }).catch(function (err) {
    console.log('failed to open the channel:' + err);
  });
}

exports.setSpeed = function(speed) {
  if(speed.speed > 180) {
    speed.speed = 180;
  }
  if(speed.speed < 0) {
    speed.speed = 0;
  }
  return new Promise(function(resolve, reject) {
    phidgetConnection.setTargetPosition(speed.speed);
    resolve({
      code: 200,
      message: 'set speed to ' + speed.speed
    });
  });
}
connectToServoController();
