/*
 *  COMP 426 - Fall 2018
 *  Object model for Player
 *
 */

var Player = function (name) {
  this.name = name,
  this.active = true,
  this.hand = []  // best way to initalize this?
}
// name and id
Player.prototype.getName = function() { return this.name; }
Player.prototype.getId = function() { return this.player_id; }
// active
Player.prototype.deactivate = function() { this.active = false; }
Player.prototype.activate = function() { this.active = true; }
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
