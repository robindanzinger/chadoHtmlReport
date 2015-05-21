var buster = require('buster'); 
var assert = buster.assert;
var refute = buster.refute;
var chado = require('chado');
var assume = chado.assume;
var verify = chado.verify;
var createDouble = chado.createDouble; 
buster.testCase("Async Tests", {
  "Test" : function (done) {  
    var lib = createDouble('Test');
    var func = function (result) {
      assert.equals("foo", result);
      done();
    };
    assume(lib).canHandle('foo').withArgs('bar', chado.callback).andCallsCallbackWith("foo").andReturns("bar");
    assert.equals("bar", lib.foo('bar', func));

    assume(lib).canHandle('foo').andReturns(function (param) {return param+1;});
    assert.equals(2, lib.foo()(1));
  },
  "Verify" : function (done) {
    var sut = {
      foo : function (param1, callback) {
        callback("foo");
      }
    }
    verify('Test')
      .canHandle('foo')
      .withArgs('bar', chado.callback)
      .andCallsCallbackWith("foo")
      .on(sut, function (result) {
        assert(result); 
        done();
      });
  }
});

