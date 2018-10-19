/*
 *  COMP 426 - Fall 2018
 *  Object model for Player
 *
 */

var Player = function (name, budget) {
  this.name = name,
  this.budget = budget,
  this.active = true,
  this.player_id = name.hashCode(),
  this.hand = [],  // best way to initalize this?
  this.hasNotBet = true;
}

Player.prototype.resetHasBet = function() { this.hasNotBet = true; }
Player.prototype.hasBet = function() { this.hasNotBet = false; }
Player.prototype.canBet = function() { return this.hasNotBet; }

// name and id
Player.prototype.getName = function() { return this.name; }
Player.prototype.getId = function() { return this.player_id; }
Player.prototype.setId = function() { return this.player_id; }
// active
Player.prototype.deactivate = function() { this.active = false; }
Player.prototype.activate = function() { this.active = true; }
Player.prototype.getActiveStatus = function() { return this.active; }
// budget
Player.prototype.addBudget = function(winnings) { this.budget += winnings; }
Player.prototype.subBudget = function(losings) { this.budget += -losings; }
Player.prototype.getBudget = function() { return this.budget; }
Player.prototype.setBudget = function(amount) { this.budget = amount; }
// hand
Player.prototype.getHand = function() { return this.hand; }
Player.prototype.addCard = function(card) {
  if(this.hand.length > 2) {
    return false;
  } else {
    this.hand.push(card);
    return true;
  }
}
// helpers
String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};
