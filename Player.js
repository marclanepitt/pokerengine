var Player = function (name, budget) {
  this.name = name,
  this.budget = budget,
  this.active = true
  this.player_id = name.hashCode();
  this.hand = [];  // best way to initalize this?
}

Player.prototype.deactivate = function() { this.active = false; }
Player.prototype.activate = function() { this.active = true; }

Player.prototype.addBudget(winnings) { this.budget += winnings; }
Player.prototype.subBudget(losings) { this.budget += -losings; }
Player.prototype.getBudget() { return this.budget; }
Player.prototype.setBudget(amount) { this.budget = amount; }

Player.prototype.getId() { return this.player_id; }

Player.prototype.getHand() { return this.hand; }
Player.prototype.addCard(card) {
  if(this.hand.length > 2) {
    return false;
  } else {
    this.hand.push(card);
    return true;
  }
}

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
