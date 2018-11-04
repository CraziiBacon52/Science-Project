'use strict';
var phidget22 = require('phidget22'),
    fs = require('fs');

var SERVER_PORT = 5661;
var HOSTNAME = 'localhost';

var sensors = []

var baseline = {'0': 0, '1': 0};
var scale = {'0': 1, '1': 1};
var load = {'0': 0, '1': 0};

var loadDefaults = function() {
  if(fs.exists("baseline.json", function(exists) {
    if (exists) {
      fs.readFile("baseline.json", function(err, data) {
        var updated = JSON.parse(data.toString('utf-8'));
        baseline = updated;
        console.log('loaded baseline values');
      });
    }
  }));

  if(fs.exists("scale.json", function(exists) {
    if (exists) {
      fs.readFile("scale.json", function(err, data) {
        var updated = JSON.parse(data.toString('utf-8'));
        scale = updated;
        console.log('loaded scale values');
      });
    }
  }));
};

var writeDefaults = function() {
  console.log('write defaults');
  fs.writeFileSync("baseline.json", JSON.stringify(baseline, null, 2));
  fs.writeFileSync("scale.json", JSON.stringify(scale, null, 2));
}

var connectToLoadCell = function () {
  var conn = new phidget22.Connection(SERVER_PORT, HOSTNAME, { name: 'Server Connection', passwd: '' });
  var phidgetConnection;

  phidgetConnection = new phidget22.VoltageRatioInput();
  phidgetConnection.setChannel(0);
	phidgetConnection.onVoltageRatioChange = function (ratio) {
    load['0'] = ratio;
	};
  phidgetConnection.onAttach = function (ch) {
    console.log('attached channel 0');
    ch.setEngaged(0);
  };
  sensors.push(phidgetConnection);

  phidgetConnection = new phidget22.VoltageRatioInput();
  phidgetConnection.setChannel(1);
	phidgetConnection.onVoltageRatioChange = function (ratio) {
    load['1'] = ratio;
	};
  phidgetConnection.onAttach = function (ch) {
    console.log('attached channel 1');
    ch.setEngaged(0);
  };
  sensors.push(phidgetConnection);

  conn.connect()
    .then(function() {
      sensors.forEach(function (sensor) {
        sensor.open()
          .then(function (connection) {
            console.log('channel open');
          }).catch(function (err) {
            console.log('failed to open the channel:' + err);
          });
      })
    })
    .catch(function (err) {
      console.error(err.message);
      process.exit(1);
    });
}

exports.calibrateSensor = function(direction, value) {
  var position = getSensorPosition(direction);
  if(value == 0) {
    baseline[position] = load[position];
  }
  else {
    var delta = load[position] - baseline[position];
    var _scale = value / delta;
    scale[position] = _scale;
  }
  writeDefaults();

  return new Promise(function(resolve, reject) {
    resolve({
      code: 200,
      message: 'successfully calibrated ' + direction
    });
  });
}

exports.getSensorValues = function() {
  return new Promise(function(resolve, reject) {
    var lift = getLift();
    var drag = getDrag();
    var amplitude = Math.sqrt(Math.pow(lift, 2) + Math.pow(drag, 2));
    var angle = Math.atan(lift / drag) * 180 / Math.PI;
    var output = {
      "amplitude" : amplitude,
      "lift" : lift,
      "angle" : angle,
      "drag" : drag
    };
    resolve(output);
  });
}

var getDrag = function () {
  var position = getSensorPosition('drag');
  var drag = scale[position] * (load[position] - baseline[position]);
  return drag;
}

var getLift = function () {
  var position = getSensorPosition('lift');
  var lift = scale[position] * (load[position] - baseline[position]);
  return lift;
}

var getSensorPosition = function(direction) {
  if(direction === 'lift') {
    return '1';
  }
  if(direction === 'drag') {
    return '0';
  }
  return -1;
}

loadDefaults();
connectToLoadCell();
