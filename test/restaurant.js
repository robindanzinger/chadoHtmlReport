var buster = require('buster'); 
var assert = buster.assert;
var refute = buster.refute;
var chado = require('chado');
var assume = chado.assume;
var verify = chado.verify;
var precondition = chado.precondition;
var createDouble = chado.createDouble; 
buster.testCase("Restaurant Simulation", {
  "We have a waiter who takes the order" : {
    setUp : function () {
      this.waiter = createDouble('Waiter');
    },
    "the waiter returns the asked order" : function () {
      assume(this.waiter).canHandle('order').withArgs('steak').andReturns('broiled steak');
      assert.equals(this.waiter.order('steak'), 'broiled steak');
   }
  }
});
buster.testCase("Restaurant Simulation", {
  "Waiter" : {
    setUp : function () {
      this.cook = createDouble('Cook');
      this.waiter = new Waiter(this.cook); 
    },
    "if waiter is asked for a steak, he asks the cook to broil a steak" : function () {
      assume(this.cook).canHandle('broil').withArgs('steak').andReturns('broiled steak');
      verify('Waiter').canHandle('order').withArgs('steak').andReturns('broiled steak').on(this.waiter);
      assert(true);
    }
  }
});
buster.testCase("Restaurant Simulation", {
  "Cook" : { setUp : function () {
      this.cookbook = createDouble('Cookbook');
      this.pantry = createDouble('Pantry');
      this.cook = new Cook(this.cookbook, this.pantry);
    },
    "The cook can broil a steak if he has the recipe and enough ingredients in the pantry" : function () {
      assume(this.cookbook).canHandle('containsReceipt').withArgs('steak').andReturns(true);
      assume(this.cookbook).canHandle('getIngredientsForReceipt').withArgs('steak').andReturns([{name:'steak', amount:1}, {name:'salt', amount:1}, {name:'pepper', amount:1}]);
      assume(this.cookbook).canHandle('getResult').withArgs('steak').andReturns('broiled steak');
      assume(this.pantry).canHandle('hasIngredients').withArgs([{name:'steak', amount:1}, {name:'salt', amount:1}, {name:'pepper', amount:1}]).andReturns(true);
      verify('Cook').canHandle('broil').withArgs('steak').andReturns('broiled steak').on(this.cook);
      assert(true);
    },
    "The cook throws an error, if not enough ingredients are in the pantry" : function () {
      assume(this.cookbook).canHandle('containsReceipt').withArgs('steak').andReturns(true);
      assume(this.cookbook).canHandle('getIngredientsForReceipt').withArgs('steak').andReturns([{name:'steak', amount:1}, {name:'salt', amount:1}, {name:'pepper', amount:1}]);
      assume(this.cookbook).canHandle('getResult').withArgs('steak').andReturns('broiled steak');
      assume(this.pantry).canHandle('hasIngredients').withArgs([{name:'steak', amount:1}, {name:'salt', amount:1}, {name:'pepper', amount:1}]).andReturns(false);
      verify('Cook').canHandle('broil').withArgs('steak').andThrowsError('not enough ingredients in the pantry').on(this.cook);
      assert(true);
    }
  }
});
buster.testCase("Restaurant Simulation", {
  "MagicCook" : { setUp : function () {
      this.cook = new MagicCook();
      this.spell = createDouble('Spell');
    },
    "The cook can broil a steak if he has the recipe and enough ingredients in the pantry" : function () {
      assume(this.spell).canHandle('foo').andReturns('broiled steak');
      this.cook.setSpell(this.spell);
      verify('Cook').canHandle('broil').withArgs('steak').andReturns('broiled steak').on(this.cook);
      assert(true);
    }
  }
});
buster.testCase("Restaurant Simulation", {
  "Cookbook" : {
    setUp : function () {
       this.cookbook = new Cookbook();
       this.receipt = createDouble('Receipt');
    },
    "Can add new recipes" : function () {
      assume(this.receipt).canHandle('getName').andReturns('steak');
      assume(this.receipt).canHandle('getResult').andReturns('broiled steak');
      this.cookbook.addReceipt(this.receipt);
      verify('Cookbook').canHandle('containsReceipt').withArgs('steak').andReturns(true).on(this.cookbook);
      verify('Cookbook').canHandle('getResult').withArgs('steak').andReturns('broiled steak').on(this.cookbook);
      assert(true);
    },
    "Returns the ingredients of the recipe" : function () {
      assume(this.receipt).canHandle('getName').andReturns('steak');
      assume(this.receipt).canHandle('getIngredients').andReturns([{name:'steak', amount:1}, {name:'salt', amount:1}, {name:'pepper', amount:1}]);
      this.cookbook.addReceipt(this.receipt);
      verify('Cookbook').canHandle('getIngredientsForReceipt').withArgs('steak').andReturns([{name:'steak', amount:1}, {name:'salt', amount:1}, {name:'pepper', amount:1}]).on(this.cookbook);
      assert(true);
    }
  }
});
buster.testCase("Restaurant Simulation", {
  "Receipt" : {
    setUp : function () {
       this.receipt = new Receipt();
    },
    "A Receipt contains all necessary informations like name, ingredients and the result" : function () {
      this.receipt.setName('steak');
      this.receipt.setResult('broiled steak');
      this.receipt.addIngredient('steak', 1);
      this.receipt.addIngredient('salt', 1);
      this.receipt.addIngredient('pepper', 1);
      verify('Receipt').canHandle('getName').andReturns('steak').on(this.receipt);
      verify('Receipt').canHandle('getResult').andReturns('broiled steak').on(this.receipt);
      verify('Receipt').canHandle('getIngredients').andReturns(this.receipt.getIngredients()).on(this.receipt);
      assert(true);
    }
  }
});
buster.testCase("Restaurant Simulation", {
  "Pantry" : {
    setUp : function () {
       this.pantry = new Pantry();
    },
    "Can store ingredients" : function () {
      this.pantry.store('steak', 1);
      this.pantry.store('salt', 1);
      this.pantry.store('pepper', 1);
      verify('Pantry')
        .canHandle('hasIngredients')
        .withArgs([{name:'steak', amount:1}, {name:'salt', amount:1}, {name:'pepper', amount:1}])
        .andReturns(true)
        .on(this.pantry);
      assert(true);
    }
  }
});

function Waiter (cook) {

  function order (name) {
    return cook.broil(name);
  }

  return {
    order : order
  }
}

function Cook (cookbook, pantry) {
  function broil (menu) {
    if (cookbook.containsReceipt(menu)) { 
      if (pantry.hasIngredients(cookbook.getIngredientsForReceipt(menu))) {
        return cookbook.getResult(menu);
      } else {
        throw Error('not enough ingredients in the pantry');
      }
    }
    return null;
  } 
  return {
    broil : broil
  }
}

function MagicCook () {
  var spell;
  function broil (menu) {
    return spell.foo();
  }
  function setSpell(nSpell) {
    spell = nSpell;
  }
  return {
    setSpell: setSpell,
    broil : broil
  }
}

function Cookbook () {
  
  var recipes = {};

  function addReceipt(receipt) {
    recipes[receipt.getName()] = receipt;
  }

  function containsReceipt (name) {
    return recipes[name] != null && recipes[name] != undefined;
  }

  function getIngredientsForReceipt(name) {
    return recipes[name].getIngredients();
  }
  
  function getResult(name) {
    return recipes[name].getResult();
  }

  return {
    addReceipt : addReceipt,
    containsReceipt : containsReceipt,
    getIngredientsForReceipt : getIngredientsForReceipt,
    getResult : getResult
  }
}

function Receipt() {
  var name = '';
  var ingredients = [];
  var result = '';
  function addIngredient (name, amount){
    ingredients.push({name: name, amount: amount});
  }
  function setName(nName) {
    name = nName
  }
  function setResult(nResult) {
    result = nResult
  }
  function getResult(){
    return result;
  }
  function getName() {
    return name;
  }
  function getIngredients() {
    return ingredients;
  }
  return {
    addIngredient: addIngredient,
    setName: setName,
    getName: getName,
    setResult: setResult,
    getResult: getResult,
    getIngredients: getIngredients
  }
}

function Pantry() {

  var pantry = {};

  function store(ingredient, amount)
  {
    pantry[ingredient] = amount;
  }

  function hasIngredients(ingredients) 
  {
    return ingredients.every(function (ingredient) {return pantry[ingredient.name] >= ingredient.amount});
  }


  return {
    store : store,
    hasIngredients : hasIngredients,
  }
}
