/*
 *  COMP 426 - Fall 2018
 *  Object model of PlayerActions
 *
 */

var PlayerActions = function (name, budget) {
  this.name = name,
  this.budget = budget,
  this.active = true,
  this.hasNotBet = true;
}

PlayerActions.prototype.resetHasBet = function() { this.hasNotBet = true; }
PlayerActions.prototype.hasBet = function() { this.hasNotBet = false; }
PlayerActions.prototype.canBet = function() { return this.hasNotBet; }

// name
PlayerActions.prototype.getName = function() { return this.name; }
// active
PlayerActions.prototype.deactivate = function() { this.active = false; }
PlayerActions.prototype.activate = function() { this.active = true; }
PlayerActions.prototype.getActiveStatus = function() { return this.active; }
// budget
PlayerActions.prototype.addBudget = function(winnings) { this.budget += winnings; }
PlayerActions.prototype.subBudget = function(losings) { this.budget += -1 * losings;}
PlayerActions.prototype.getBudget = function() { return this.budget; }
PlayerActions.prototype.setBudget = function(amount) { this.budget = amount; }