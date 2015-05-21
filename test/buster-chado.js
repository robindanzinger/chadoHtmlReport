var chado = require('chado');
var fs = require('fs');
var testRunner = require('buster').testRunner;
testRunner.on('suite:end', function () {
  console.log('BUSTERCHADO on suite:end');
  fs.writeFile(
    "chado-result.json", 
    JSON.stringify(chado.repo, null, 2)
  );
});
 
module.exports = {
  name : "buster-chado",

  create: function (options) {
    console.log("BUSTERCHADO: create");
    var instance = Object.create(this);
    return instance;
  },
  configure : function (config) {
    console.log("BUSTERCHADO: configure");
    this.config_name = config.name; 
  },
  beforeRun: function () {
    console.log("BUSTERCHADO: beforeRun");
  },
  testRun: function (testRunner) {
    console.log("BUSTERCHADO: testRun");
    testRunner.on('suite:end', function () {
      console.log("BUSTERCHADO: on suite:end");
  });
  }
}
