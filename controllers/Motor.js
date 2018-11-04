'use strict';

var utils = require('../utils/writer.js');
var Motor = require('../service/MotorService');

module.exports.setSpeed = function setSpeed (req, res, next) {
  var speed = req.swagger.params['speed'].value;
  Motor.setSpeed(speed)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
