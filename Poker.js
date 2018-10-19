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
  ERROR: -10,

  // Game event types
  ALL_EVENTS : -1,
  ROUND_STARTED_EVENT : 0,
  ROUND_ENDED_EVENT : 1,
  TURN_STARTED_EVENT : 2,
  TURN_ENDED_EVENT: 3,
  BET_START_EVENT : 4,
  BET_ENDED_EVENT : 5,
  //game over event
};

var RoundOfPoker = function (smallBlind, dealer, players) {

  this.players = players;
  this.dealer = dealer;

  var activePlayers = [];
  for(let i = 0; i < players.length; i++) {
    if(players[i].actions.getActiveStatus()) {
      activePlayers.push(players[i].player_id);
    }
  }

  var current_turn = 0;
  var flipped_cards = [];

  var bet_index = 3;
  var current_better = {};
  
  var bet_actions = {  //reset every turn
    numChecks: 0,
    numCalls: 0
  }

  var status = 0;

  this.pot = {
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

  var newTurn = function() {
    setTimeout(() => {
      bet_actions.numChecks = 0;
      bet_actions.numCalls = 0;
    
      current_turn++;
      if(current_turn != 1) {
        bet_index = 1;
      }
      if(current_turn === 4) {
        // check winner, add money
        // winnner <- activeHands.evaluate();
        // winner.addBudget(that.pot.total);
        // if(gameOverCheck(players)) dispatch(GAME_OVER_EVENT)
        dispatchEvent(new RoundEndedEvent());
      }
      dispatchEvent(new TurnStartedEvent(current_turn));
      return newBet();
    }, 500);
  }

  var newBet = function() {
    setTimeout(() => {
          //add bet logic
      var dealer_index = activePlayers.indexOf(that.dealer.player_id)
      current_better = players[activePlayers[(dealer_index+bet_index)%activePlayers.length]];
      dispatchEvent(new BetStartedEvent(current_better));
      bet_index++;
    }, 500);
  }

  var isBetter = function(player_id) {
    return current_better.player_id === player_id;
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
	  return newTurn();
  }

  this.raise = function(bet_amount, player_id) {
    if(!isBetter(player_id)) {
      dispatchEvent(new Error("Not "+player_id+"'s turn"));
      return;
    }

    if(player_id === that.pot.highBidder) {
      dispatchEvent(new TurnEndedEvent());
      return newTurn();
    } else if(bet_amount === current_better.actions.getBudget()) {
      that.pot.total += bet_amount;
      //subtract players money
      current_better.actions.subBudget(bet_amount);
      dispatchEvent(new BetEndedEvent("bet", bet_amount, player_id));
      return newBet();
    }
    else if(bet_amount <= that.pot.highBid) {
      dispatchEvent(new Error("Bet does not exceed current highest bid"));
    } else {
      that.pot.highBid = bet_amount;
      that.pot.highBidder = player_id;
      that.pot.total += bet_amount;
      //subtract players money
      current_better.actions.subBudget(bet_amount);
      dispatchEvent(new BetEndedEvent("bet", bet_amount, player_id));
      return newBet();
    }
  }

  this.fold = function(player_id) {
    if(!isBetter(player_id)) {
      dispatchEvent(new Error("Not "+player_id+"'s turn"));
      return;
    }

    activePlayers.splice(activePlayers.indexOf(player_id),1); //out of round not game
    
    dispatchEvent(new BetEndedEvent("fold", -1, player_id));
    return newBet();
  }

  this.check = function(player_id) {
    if(!isBetter(player_id)) {
      dispatchEvent(new Error("Not "+player_id+"'s turn"));
      return;
    }

    if(bet_actions.numChecks === activePlayers.length) {
      dispatchEvent(new TurnEndedEvent());
      return newTurn();
    }

    dispatchEvent(new BetEndedEvent("check", 0, player_id));
    bet_actions.numChecks++;
    return newBet();
  }

  this.call = function(player_id) {
    if(!isBetter(player_id)) {
      dispatchEvent(new Error("Not "+player_id+"'s turn"));
      return;
    } 

    bet_actions.numCalls++;


    if(current_better.actions.getBudget() < that.pot.highBid)  {
      dispatchEvent(new BetEndedEvent("call", current_better.actions.getBudget(), current_better.player_id));
      current_better.actions.setBudget(0);

    } else {
      dispatchEvent(new BetEndedEvent("call", that.pot.highBid, current_better.player_id));
      current_better.actions.subBudget(that.pot.highBid);
    }

    if(bet_actions.numCalls === activePlayers.length) {
      dispatchEvent(new TurnEndedEvent());
      return newTurn();
    }
    return newBet();
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


  }
}

var BetStartedEvent = function(current_better) {
	this.event_type = Poker.BET_START_EVENT;
	this.getBetter = function() {
		return current_better;
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
  
  //who won

}

// changed flipped cards from being parameter to function
var TurnStartedEvent = function(state) {
	this.event_type = Poker.TURN_STARTED_EVENT;
// var flippedCards = deck.getNextCards(state);
	this.getTurnState = function() {
		switch(state) {
    case 0:
    return "pre flop"
    case 1:
		return "flop";
		case 2:
		return "turn";
		case 3:
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
