/* Game of Hearts model object. */

/*
 * OBJECTS:
 * Poker
 * RoundOfPoker
 * -pot
 *
 * Events:
 *  startRound
 *  BetStartedEvent
 *  BetEndedEvent
 *  RoundStartedEvent
 *  RoundEndedEvent
 *  TurnStartedEvent
 *  TurnEndedEvent
 *
 * Functions:
 *  startRound
 *  newTurn
 *  newBet
 *  raise
 *  fold
 *  check
 *  call
 *
 */

var Poker = {

  FINISHED: -2,

  // Game event types
  ALL_EVENTS : -1,
  ROUND_STARTED_EVENT : 0,
  ROUND_ENDED_EVENT : 1,
  TURN_STARTED_EVENT : 2,
  TURN_ENDED_EVENT: 3,
  BET_START_EVENT : 4,
  BET_ENDED_EVENT : 5,
};

var PokerHandResult = function(cards, player, type, value) {
  this.cards = cards;
  this.player = player;
  this.type = type;
  this.value = value;
}

var RoundOfPoker = function (smallBlind, dealer, players) {

  this.players = players;
  this.dealer = dealer;

  var current_turn = 0;
  var flipped_cards = [];
  var bet_index = 0;

  var status = 0;

  var pot = {
    total: 0,
    highBid: 0,
    highBidder: null
  }

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

  var _ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];

  var dispatchEvent = function (e) {
    if (dispatching) {
      dispatch_queue.push(e);
    } else {
      dispatching = true;

      // If the game is over, don't generate events.
      if (that.status == Poker.FINISHED) {
        console.log("hi");
        return;
      }

      // If this is the game over event, update the
      // game status to be FINISHED and calculate
      // final scores
      if (e.event_type == Poker.GAME_OVER_EVENT) {
        that.status = Poker.FINISHED;
      }

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

      // Call all handlers registered for ALL_EVENTS
      handlers = registeredEventHandlers[Poker.ALL_EVENTS];

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

  this.startRound = function() {
	  dispatchEvent(new RoundStartedEvent(smallBlind, dealer));

    // need pre-flop logic
    // get deck
    // shuffle deck
    // deal "hole" cards
    // deal cards
    // pay blind
    // bet starting with player left of big blind
    // !!! must be able to pass dealer position to bet
	 dispatchEvent(new TurnStartedEvent(current_turn));
	 that.newBet();
  }

  this.newTurn = function() {
    that.current_turn++;
    if(current_turn === 3) {
      // check winner, add money
      // winnner <- activeHands.evaluate();
      // winner.addBudget(that.pot.total);
      // if(gameOverCheck(players)) dispatch(GAME_OVER_EVENT)
      dispatchEvent(new RoundEndedEvent());
    }
    dispatchEvent(new TurnStartedEvent(current_turn));
  }

  this.newBet = function() {
    dispatchEvent(new BetStartedEvent(that.dealer, that.players, bet_index));
    bet_index++;
  }

  this.raise = function(bet_amount, player_id) {
    if(player_id === that.pot.highBidder) {
      dispatchEvent(new TurnEndedEvent());
      that.newTurn();
    }
    else if(bet_amount <= that.pot.highBid) {
      dispatchEvent(new BettingError("Bet does not exceed current highest bid"));
    } else {
      that.pot.highBid = bet_amount;
      that.pot.highBidder = player_id;
      that.pot.total += bet_amount;
      //subtract players money
      that.players[player_id].subBudget(bet_amount);
      dispatchEvent(new BetEndedEvent("bet", bet_amount, player_id));
    }
  }

  this.fold = function(player_id) {
    //deactivate player
    console.log(that.players[player_id])
    that.players[player_id].player.deactivate();
    dispatchEvent(new BetEndedEvent("fold", -1, player_id));
  }

  this.check = function(player_id) {
    //make sure they can check
    if(player_id === that.pot.highBidder) {
      dispatchEvent(new TurnEndedEvent());
      that.newTurn();
    }
    dispatchEvent(new BetEndedEvent("check", 0, player_id));
  }

  this.call = function(player_id) {
	//make sure they can call
	var player = that.players[player_id];
    if(player.getBudget() < that.pot.highBid)  {
      dispatchEvent(new BetEndedEvent("call", player.getBudget(), getPlayerById(player_id)));
      player.setBudget(0);
    } else {
      dispatchEvent(new BetEndedEvent("call", that.pot.highBid, getPlayerById(player_id)));
      player.subBudget(that.pot.highBid);
    }
  }

  this.getPlayerById = function(player_id) {
	  return that.players[player_id];
  }

  this.evaluateWinner = function() {
    // Get a subset of all players that need to be evaluated
    var validPlayers = [];
    for(let i = 0; i < that.players.length; i++) {
      if(that.players[i].active) {
        validPlayers.push(that.players[i]);
      }
    }

    // TODO: fix this function to implement current cards on the table
    // Keep NULL player object for results below
    let tableCards = null;
    let best = new PokerHandResult(tableCards, null, 'none', 0);

    for(let i = 0; i < that.validPlayers.length; i++) {
      // Combine table cards with the player's cards
      let allCards = tableCards.concat(that.validPlayers[i].hand);

      for(let combination of _combinations(allCards, 5)) {
        // Calculate value of best 5 cards
        let result = _calculate(combination, validPlayers[i]);
        if(result.value > best.value) {
          best = result;
        }
      }
    }

    return best;
  }

  var _combinations = function (cards, group) {
    // Double array of card combinations
    let result = [];

    // Return null if length of cards is less than group size
    if(groups > cards.length)
      return result;

    // Return cards if length of cards is equal to group size
    if(groups === cards.length) {
      return [cards];
    }

    // One card in each group
    if(group === 1) {
      return cards.map((card) => [card]);
    }

    // All other cases
    for (let i = 0; i < cards.length - groups; i++) {
      let head = cards.slice(i, i + 1);
      let tails = _combinations(cards.slice(i + 1), groups - 1);
      for(let tail of tails) {
        results.push(head.concat(tail));
      }
    }

    return results;
  }

  var _calculate = function(cards, player) {
    // Check for card rank and whether it's a flush or straight
    let ranked = _ranked(cards);
    let isFlush = _isFlush(cards);
    let isStraight = _isStraight(cards);

    if (isStraight && isFlush && ranked[0][0].rank == 'ace') {
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

    for (let card of cards) {
      // TODO: reformat Card.js for this to work
      let r = _ranks.indexOf(card.getRank());
      // result[r] = result[r] || [];
      result[r].push(card);
    }

    // Condense results
    result = result.filter((rank) => !!rank);

    // High to low
    result.reverse();

    // Place pairs and sets first
    result.sort((a, b) => {
        return a.length > b.length ? -1 : a.length < b.length ? 1 : 0;
    });
  }

  // Will work regardless of refactoring of Card.js
  var _isFlush = function(cards) {
    let suit = cards[0][0].getSuit();

    for (let card of cards) {
      if(card.getSuit() !== suit) {
        return false;
      }
    }

    return true;
  }

  var _isStraight = function(cards) {
    // Must have 5 different ranks
    if(!cards[4]) { return false; }

    // Edge case for ace card
    // TODO: refactor Card.js for this to work
    if(cards[0][0].getRank() === 'ace' && cards[1][0].getRank() === 5 && cards[4][0] === 2) {
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

var BetStartedEvent = function(dealer, players, bet_index) {
	this.event_type = Poker.BET_START_EVENT;
	this.getBetter = function() {
		return players[(dealer.player_id+bet_index+1)%players.length];
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

var RoundStartedEvent = function(smallBlind, dealer) {
	this.event_type = Poker.ROUND_STARTED_EVENT;
	this.getSmallBlind = function() {
		return smallBlind;
	}

	this.getBigBlind = function() {
		return bigBlind;
	}

	this.getDealer = function() {
		return players[dealer];
	}
}

var RoundEndedEvent = function() {
	this.event_type = Poker.ROUND_ENDED_EVENT;

}

// changed flipped cards from being parameter to function
var TurnStartedEvent = function(state) {
	this.event_type = Poker.TURN_STARTED_EVENT;
// var flippedCards = deck.getNextCards(state);
	this.getTurnState = function() {
		switch(state) {
		case 0:
		return "flop";
		case 1:
		return "turn";
		case 2:
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
