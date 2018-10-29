/*
*  COMP 426 - Fall 2018
*
* Events:
*  BetStartedEvent
*  BetEndedEvent
*  RoundStartedEvent
*  RoundEndedEvent
*  TurnStartedEvent
*  TurnEndedEvent
*  GameOverEvent
*
* Game functions:
*  startRound
*  newTurn
*  newBet
*
* Bet action functions:
*   raise
*   fold
*   check
*   call
*
* Helpers:
*   getMaxBet
*   getTotalPot
*   resetBetTokens
*   getNextActiveBetter
*   isValidAction
*   getValidActions
*   isBetter
*   payBlind
*   getPlayerId
*   endRoundAllButOneFolded
*   endRoundAllCardsFlopped
*   endRoundPlayersHaveNoMoney
*   allPlayersAllIn
*   dealCardsAndPush
*
*/

var Poker = {

  FINISHED: -2,
  ERROR: -10,

  // Game event types
  ALL_EVENTS : -1,
  ROUND_STARTED_EVENT : 0,
  ROUND_ENDED_EVENT : 1,
  TURN_STARTED_EVENT : 2,
  TURN_ENDED_EVENT: 3,
  BET_START_EVENT : 4,
  BET_ENDED_EVENT : 5,
  GAME_OVER_EVENT : 6,
  //game over event
};

var PokerHandResult = function(cards, player, type, value) {
  this.cards = cards;
  this.player = player;
  this.type = type;
  this.value = value;
}

var RoundOfPoker = function (smallBlind, dealer, players) {

  this.deck = new Deck();

  this.players = players;
  this.dealer = dealer;
  this.pot = {};

  this.hands = {};
  this.allFlippedCards = [];

  var activePlayerIds = [];
  for(let i = 0; i < players.length; i++) {
    if(players[i].actions.getActiveStatus()) {
      activePlayerIds.push(players[i].player_id);
      this.pot[players[i].player_id] = 0;
    }
  }
  var current_turn = 0;

  var current_better = this.players[activePlayerIds[(activePlayerIds.indexOf(dealer.player_id) + 2) % activePlayerIds.length]];

  var terminatingPlayerId = null;

  var registeredEventHandlers = {};

  this.registerEventHandler = function(type, handler) {
    if (registeredEventHandlers[type] == null) {
      registeredEventHandlers[type] = [];
    }
    registeredEventHandlers[type].push(handler);
  };

  var that = this;

  var dispatch_queue = [];
  var dispatching = false;

  var _ranks = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

  var getMaxBet = function(){
    var max = 0;
    for(var player in that.pot ) {
      if(that.pot[player] > max) {
        max = that.pot[player];
      }
    }
    return max;
  }

  var getTotalPot = function() {
    let total = 0;
    for(var player in that.pot) {
      total += that.pot[player];
    }
    return total;
  }

  var dispatchEvent = function (e) {
    if (dispatching) {
      dispatch_queue.push(e);
    } else {
      dispatching = true;

      // A bit of a hack to add a game property
      // to every event that is fired without having to
      // remember to build it into the definition of each event type.
      e.game = that;

      // Call all registered handlers for the event type if any.
      var handlers = registeredEventHandlers[e.event_type];
      if (handlers != null) {
        handlers.forEach(function (h) {
          var e_clone = $.extend(true, {}, e);
          h(e_clone);
        });
      }

      dispatching = false;

      if (dispatch_queue.length > 0) {
        var next_to_dispatch = (dispatch_queue.splice(0, 1))[0];
        dispatchEvent(next_to_dispatch);
      }
    }
  }

  this.dispatchEventHack = dispatchEvent;

  var resetBetTokens = function() {
    for(var i = 0; i < that.players.length; i++) {
      that.players[i].actions.resetHasBet();
    }
  }

  var getNextActiveBetter = function(current_better_id) {
    let next_player_id = that.players[(current_better_id + 1) % that.players.length].player_id;
    if(next_player_id === terminatingPlayerId) {
      if(activePlayerIds.length > 1) {
        return that.players[next_player_id];
      } else {
        return null;
      }
    } else {
      if(activePlayerIds.indexOf(next_player_id) === -1) {
        // out of game
        return getNextActiveBetter(next_player_id);
      } else if(that.players[next_player_id].actions.getBudget() === 0) {
        // skips all-in players
        return getNextActiveBetter(next_player_id);
      } else {
        return that.players[next_player_id];
      }
    }
  }

    var isValidAction = function(bet_action) {
	return getValidActions().includes(bet_action);
    }

  var isBetter = function(player_id) {
    return current_better.player_id === player_id;
  }

  var getValidActions = function() {
    // returns valid poker bet actions
      let validActions = ["fold", "raise"];
      that.pot[current_better.player_id] < getMaxBet() ? validActions.push('call') : validActions.push('check');
      return validActions;
  }

  var payBlind = function(blind_idx) {
    let bid = activePlayerIds[(activePlayerIds.indexOf(dealer.player_id) + blind_idx ) % activePlayerIds.length];

    if(players[bid].actions.getBudget() > smallBlind * blind_idx) {
      // if player has enough money
      that.pot[bid] += smallBlind * blind_idx;
      players[bid].actions.subBudget(smallBlind * blind_idx);
    } else {
      // if they dont
      that.pot[bid] += players[bid].actions.getBudget();
      players[bid].actions.setBudget(0);
    }
  }

  this.getPlayerById = function(player_id) {
    return that.players[player_id];
  }

  var endRoundPlayersHaveNoMoney = function () {
    switch(current_turn) {
      case 1:
        // pre flop
        dealCardsAndPush(5);
      case 2:
        // flop
        dealCardsAndPush(2);
      case 3:
        // turn
        dealCardsAndPush(1);
    }
    let winner = that.evaluateWinner();
    winner.player.actions.addBudget(getTotalPot());
    dispatchEvent(new TurnEndedEvent());
    dispatchEvent(new RoundEndedEvent(winner.player, getTotalPot(), winner.type));
  }

  var allPlayersAllIn = function() {
    let players_all_in = 0;
    for(let i = 0; i < activePlayerIds.length; i++) {
      if(players[activePlayerIds[i]].actions.getBudget() === 0) {
        players_all_in++;
      }
    }
    return (players_all_in === activePlayerIds.length);
  }

  var endRoundAllButOneFolded = function() {
    that.players[activePlayerIds[0]].actions.addBudget(getTotalPot());
    dispatchEvent(new RoundEndedEvent(that.players[activePlayerIds[0]], getTotalPot(), "Everyone folded"))
  }

  var endRoundAllCardsFlopped = function() {
    let winner = that.evaluateWinner();
    winner.player.actions.addBudget(getTotalPot());
    dispatchEvent(new RoundEndedEvent(winner.player, getTotalPot(), winner.type));
  }

  var dealCardsAndPush = function(num_cards) {
    let flippedCards = that.deck.deal(num_cards);
    for(let i = 0; i < flippedCards.length; i++) {
      that.allFlippedCards.push(flippedCards[i]);
    }
  }

  // event functions
  var newTurn = function() {
    if(current_turn != 0) {
      terminatingPlayerId = null;
    }

    if(allPlayersAllIn()) {
      return endRoundPlayersHaveNoMoney();
    }

    resetBetTokens();

    current_turn++;
    if(current_turn != 1) {
      current_better = that.dealer;
    }

    // all players fold
    if(activePlayerIds.length === 1) {
      return endRoundAllButOneFolded();
    }

    // round over - cards flopped
    if(current_turn === 5) {
      return endRoundAllCardsFlopped();
    }

    // continue to next turn
    let flippedCards = that.deck.deal(current_turn < 2 ? 0 : current_turn === 2 ? 3 : 1);
    for(let i = 0; i < flippedCards.length; i++) {
      that.allFlippedCards.push(flippedCards[i]);
    }

    dispatchEvent(new TurnStartedEvent(current_turn, flippedCards));
    return newBet();
  }

  var newBet = function() {
    setTimeout(() => {
      current_better = getNextActiveBetter(current_better.player_id);
      if(current_better === null || allPlayersAllIn()) {
        return endRoundPlayersHaveNoMoney();
      }

      //end turn and new turn if we reach terminating player
      if(current_better.player_id === terminatingPlayerId || activePlayerIds.length === 1) {
        dispatchEvent(new TurnEndedEvent());
        return newTurn();
      }

      if(terminatingPlayerId === null) {
        terminatingPlayerId = current_better.player_id;
      }
      //if they fold while terminating player in start of new turn
      if(activePlayerIds.indexOf(terminatingPlayerId) === -1) {
        terminatingPlayerId = getNextActiveBetter(terminatingPlayerId).player_id;
      }

      dispatchEvent(new BetStartedEvent(current_better, getValidActions()));
    }, 500);
  }

  var isBetter = function(player_id) {
    return current_better.player_id === player_id;
  }

  this.startRound = function() {

    that.deck.shuffle();
    for(let i = 0; i < activePlayerIds.length; i++) {
      let cards = that.deck.deal(2);
      that.hands[activePlayerIds[i]] = [cards[0], cards[1]];
    }
    dispatchEvent(new RoundStartedEvent(smallBlind, dealer, that.hands, that.players, activePlayerIds));

    // pay blinds

    let small_blind_idx = 1;
    let big_blind_idx = 2;
    payBlind(small_blind_idx);
    payBlind(big_blind_idx);

    return newTurn();
  }

  this.raise = function(bet_amount) {
    if(!isBetter(current_better.player_id)) {
      dispatchEvent(new Error("Not "+current_better.player_id+"'s turn"));
      return;
    }

      if (bet_amount < 1) {
	  dispatchEvent(new Error("Illegal raise: " + bet_amount));
	  return;
      }

    if(current_better.actions.canBet()) {

      if(!isValidAction("raise")) {
        dispatchEvent(new Error("Not a valid bet action"));
        return;
      }

      if(getMaxBet() - that.pot[current_better.player_id] + bet_amount > current_better.actions.getBudget()) {
        // not enough money case
        dispatchEvent(new Error("E0: Insufficent funds to raise"));
      } else {
        // bet case
        terminatingPlayerId = current_better.player_id;
        var curr_pot_diff = getMaxBet() - that.pot[current_better.player_id];
        // move money from budget to pot
        that.pot[current_better.player_id] += curr_pot_diff + bet_amount;
        current_better.actions.subBudget(curr_pot_diff + bet_amount);
        // dispatch and adjust state
        dispatchEvent(new BetEndedEvent("raise", (getMaxBet() - that.pot[current_better.player_id]) + bet_amount, current_better));
        resetBetTokens();
        current_better.actions.hasBet();
        return newBet();
      }
    } else {
	dispatchEvent(new Error("Not your turn to make bet action" + " (" + current_better.getName() + ")"));
    }
  }

  this.fold = function() {
    if(!isBetter(current_better.player_id)) {
      dispatchEvent(new Error("Not "+current_better.player_id+"'s turn"));
      return;
    }

    if(current_better.actions.canBet()) {

      if(!isValidAction("fold")) {
        dispatchEvent(new Error("Not a valid bet action"));
        return;
      }

      activePlayerIds.splice(activePlayerIds.indexOf(current_better.player_id),1); //out of round not game

      dispatchEvent(new BetEndedEvent("fold", -1, current_better));
      current_better.actions.hasBet();
      return newBet();
    } else {
      dispatchEvent(new Error("Not your turn to make bet action"));
    }
  }

  this.check = function() {
    if(!isBetter(current_better.player_id)) {
      dispatchEvent(new Error("Not "+current_better.player_id+"'s turn"));
      return;
    }

    if(current_better.actions.canBet()) {
      if(!isValidAction("check")) {
        dispatchEvent(new Error("Not a valid bet action"));
        return;
      }

      dispatchEvent(new BetEndedEvent("check", 0, current_better));
      current_better.actions.hasBet();
      return newBet();
    } else {
      dispatchEvent(new Error("Not your turn to make bet action"));
    }
  }

  this.call = function() {
    if(!isBetter(current_better.player_id)) {
      dispatchEvent(new Error("Not " + current_better.player_id + "'s turn"));
      return;
    }

    if(current_better.actions.canBet()) {

      if(!isValidAction("call")) {
        dispatchEvent(new Error("Not a valid bet action"));
        return;
      }

      if(current_better.actions.getBudget() < getMaxBet() - that.pot[current_better.player_id])  {
        // player does not have enough money
        that.pot[current_better.player_id] += current_better.actions.getBudget();
        current_better.actions.setBudget(0);
        dispatchEvent(new BetEndedEvent("call", current_better.actions.getBudget(), current_better));
      } else {
        // player has enough
        current_better.actions.subBudget(getMaxBet() - that.pot[current_better.player_id]);
        that.pot[current_better.player_id] += (getMaxBet() - that.pot[current_better.player_id]);
        dispatchEvent(new BetEndedEvent("call", getMaxBet() - that.pot[current_better.player_id], current_better));
      }
      current_better.actions.hasBet();
      return newBet();
    } else {
      dispatchEvent(new Error("Not your turn to make bet action"));
    }
  }

  this.getPlayerById = function(player_id) {
    return that.players[player_id];
  }

  this.evaluateWinner = function() {
    // TODO: fix this function to implement current cards on the table
    // Keep NULL player object for results below
    let tableCards = that.allFlippedCards;
    let best = new PokerHandResult(tableCards, null, 'none', 0);

    for(let i = 0; i < activePlayerIds.length; i++) {
      // Combine table cards with the player's cards
      let allCards = tableCards.concat(that.hands[activePlayerIds[i]]);

      for(let combination of _combinations(allCards, 5)) {
        // Calculate value of best 5 cards
        let result = _calculate(combination, that.players[activePlayerIds[i]]);
        if(result.value > best.value) {
          best = result;
        }
      }
    }

    return best;
  }

  var _combinations = function (cards, groups) {
    // Double array of card combinations
    let result = [];

    // Return null if length of cards is less than group size
    if(groups > cards.length) { return result; }

    // Return cards if length of cards is equal to group size
    if(groups === cards.length) {
      return [cards];
    }

    // One card in each group
    if(groups === 1) {
      return cards.map((card) => [card]);
    }

    // All other cases
    for (let i = 0; i < cards.length - groups; i++) {
      let head = cards.slice(i, i + 1);
      let tails = _combinations(cards.slice(i + 1), groups - 1);
      for(let tail of tails) {
        result.push(head.concat(tail));
      }
    }

    return result;
  }

  var _calculate = function(cards, player) {
    // Check for card rank and whether it's a flush or straight
    let ranked = _ranked(cards);
    let isFlush = _isFlush(cards);
    let isStraight = _isStraight(ranked);

    if (isStraight && isFlush && ranked[0][0].rank == 14) {
      return new PokerHandResult(cards, player, 'royal flush', _calculateValue(ranked, 9));
    } else if (isStraight && isFlush) {
      return new PokerHandResult(cards, player, 'straight flush', _calculateValue(ranked, 8));
    } else if (ranked[0].length == 4) {
      return new PokerHandResult(cards, player, 'four of a kind', _calculateValue(ranked, 7));
    } else if (ranked[0].length == 3 && ranked[1].length == 2) {
      return new PokerHandResult(cards, player, 'full house', _calculateValue(ranked, 6));
    } else if (isFlush) {
      return new PokerHandResult(cards, player, 'flush', _calculateValue(ranked, 5));
    } else if (isStraight) {
      return new PokerHandResult(cards, player, 'straight', _calculateValue(ranked, 4));
    } else if (ranked[0].length == 3) {
      return new PokerHandResult(cards, player, 'three of a kind', _calculateValue(ranked, 3));
    } else if (ranked[0].length == 2 && ranked[1].length == 2) {
      return new PokerHandResult(cards, player, 'two pair', _calculateValue(ranked, 2));
    } else if (ranked[0].length == 2) {
      return new PokerHandResult(cards, player, 'one pair', _calculateValue(ranked, 1));
    } else {
      return new PokerHandResult(cards, player, 'high card', _calculateValue(ranked, 0));
    }
  }

  var _ranked = function(cards) {
    // Split cards by rank
    // 2D array of cards, sorted by rank and number of cards in that rank
    let result = [];

    for(let i = 2; i <= 14; i++) {
      result.push([]);
    }
    for (let card of cards) {
      let r = _ranks.indexOf(card.getRank());
      result[r].push(card);
    }

    // Condense results
    result = result.filter((rank) => !(rank.length === 0));

    // High to low
    result.reverse();

    // Place pairs and sets first
    result.sort((a, b) => {
      return a.length > b.length ? -1 : a.length < b.length ? 1 : 0;
    });
    return result;
  }

  // Will work regardless of refactoring of Card.js
  var _isFlush = function(cards) {
    let suit = cards[0].getSuit();

    for (let card of cards) {
      if(card.getSuit() !== suit) {
        return false;
      }
    }

    return true;
  }

  var _isStraight = function(ranked) {
    // Must have 5 different ranks
    if(!ranked[4]) { return false; }

    // Edge case for ace card, ACE = 14
    if(ranked[0][0].getRank() === 14 && ranked[1][0].getRank() === 5 && ranked[4][0] === 2) {
      // Ace is low, 5 is high
      ranked.push(ranked.shift());
      return true;
    }

    // Make sure that the cards are 5 in a row
    let startCard = _ranks.indexOf(ranked[0][0].getRank());
    let endCard = _ranks.indexOf(ranked[4][0].getRank());
    return (startCard - endCard) === 4;
  }

  // Primary is a number determined by the type of hand the player has
  var _calculateValue = function(cards, primary) {
    let result = '';

    for (let card of cards) {
      // Create two digit value
      let rank = _ranks.indexOf(card[0].getRank());
      let value = (rank < 10 ? '0' : '') + rank;

      for (let i = 0; i < card.length; i++) {
        // Append value of each card
        result += value;
      }
    }

    // Return an integer
    return (primary * 10000000000) + parseInt(result);
  }
}

var BetStartedEvent = function(current_better, validActions) {
  this.event_type = Poker.BET_START_EVENT;
  this.getBetter = function() {
    return current_better;
  }
  this.getValidActions = function() {
    return validActions;
  }
}

var BetEndedEvent = function(bet_type, bet_amount, player) {
  this.event_type = Poker.BET_ENDED_EVENT;

  this.getBetAmount = function() {
    return bet_amount;
  }

  this.getBetType = function() {
    return bet_type;
  }

  this.getPreviousBetter = function() {
    return player;
  }

}

var RoundStartedEvent = function(smallBlind, dealer, hands, players, activePlayerIds) {
  this.event_type = Poker.ROUND_STARTED_EVENT;
  this.getSmallBlind = function() {
    return smallBlind;
  }

  this.getBigBlind = function() {
    return smallBlind * 2;
  }

  this.getDealer = function() {
    return dealer;
  }

  this.getBigBlindPlayer = function() {
    return players[activePlayerIds[(activePlayerIds.indexOf(dealer.player_id) + 2 ) % activePlayerIds.length]];
  }

  this.getSmallBlindPlayer = function() {
    return players[activePlayerIds[(activePlayerIds.indexOf(dealer.player_id) + 1 ) % activePlayerIds.length]];
  }

  this.getHand = function(player_id) {
    return hands[player_id];
  }
}

var RoundEndedEvent = function(winner, winnings, type) {
  this.event_type = Poker.ROUND_ENDED_EVENT;

  this.getWinner = function() {
    return winner;
  }

  this.getWinnings = function() {
    return winnings;
  }

  this.getType = function() {
    return type;
  }

}

// changed flipped cards from being parameter to function
var TurnStartedEvent = function(state,flippedCards) {
  this.event_type = Poker.TURN_STARTED_EVENT;

  this.getTurnState = function() {
    switch(state) {
      case 1:
        return "pre flop"
      case 2:
        return "flop";
      case 3:
        return "turn";
      case 4:
        return "river";
    }
  }
  this.getFlippedCards = function() {
    return flippedCards;
  }
}

var TurnEndedEvent = function() {
  this.event_type = Poker.TURN_ENDED_EVENT;

}

var Error = function(error) {
  this.event_type = Poker.ERROR;
  this.getError = function() {
    return error;
  }
}
