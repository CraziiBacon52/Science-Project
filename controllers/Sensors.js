'use strict';

var utils = require('../utils/writer.js');
var Sensors = require('../service/SensorsService');

module.exports.calibrateSensor = function calibrateSensor (req, res, next) {
  var direction = req.swagger.params['direction'].value;
  var value = req.swagger.params['value'].value;
  Sensors.calibrateSensor(direction,value)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getSensorValues = function getSensorValues (req, res, next) {
  Sensors.getSensorValues()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      console.log(response);
      utils.writeJson(res, response);
    });
};
