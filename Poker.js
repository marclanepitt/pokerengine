/* Game of Hearts model object. */

var Poker = {

    // Game status constants
    FINISHED : -1,
    REGISTERING_PLAYERS : 0,
    PASSING : 1,
    BET_IN_PROGRESS : 2,

    // Game event types
    ALL_EVENTS : -1,
    GAME_OVER_EVENT : 0,
    GAME_STARTED_EVENT : 1,
    BET_START_EVENT : 2,
    BET_CONTINUE_EVENT : 3,
    BET_COMPLETE_EVENT : 4,
    CARD_PLAYED_EVENT : 5,
    PASSING_COMPLETE_EVENT : 6,
};

var RoundOfPoker = function (smallBlind, dealer, players) {

	dispatchEvent(new RoundStartedEvent(smallBlind, dealer));

	var current_turn = 0;
	var flipped_cards = [];
	var bet_index = 0;

	var pot = {
		total: 0,
		highBid: 0,
		highBidder: null
	}

    var registeredEventHandlers = {};

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
			return;
			}

			// If this is the game over event, update the
			// game status to be FINISHED and calculate
			// final scores
			if (e.event_type == Hearts.GAME_OVER_EVENT) {
				that.status = Hearts.FINISHED;
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
			handlers = registeredEventHandlers[Hearts.ALL_EVENTS];
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
		dispatchEvent(new TurnStartedEvent(current_turn));
	}

	this.newTurn = function() {
		that.current_turn++;
		if(current_turn === 3) {
			// check winner, add money
			dispatchEvent(new RoundEndedEvent());
		}
		dispatchEvent(new TurnStartedEvent(current_turn));
	}

	this.newBet = function() {
		dispatchEvent(new BetStartedEvent());
		that.bet_index++;
	}

	this.raise = function(bet_amount, player_id) {
		if(player_id === that.pot.highBidder) {
			dispatchEvent(new TurnEndedEvent());
			that.newTurn();
		}
		else if(bet_amount < that.pot.highBid) {
			dispatchEvent(new BettingError("Bet under current highest bid"));
		} else {
			that.pot.highBid = bet_amount;
			that.pot.highBidder = player_id;
			//subtract players money
			dispatchEvent(new BetEndedEvent("bet", bet_amount, player_id));
		}
	}

	this.fold = function(player_id) {
		//deactivate player
		dispatchEvent(new BetEndedEvent("fold", -1, player_id));
	}

	this.check = function(player_id) {
		//make sure they can check
		dispatchEvent(new BetEndedEvent("check", 0, player_id));
	}

	this.call = function(player_id) {
		//make sure they can call
		dispatchEvent(new BetEndedEvent("call", that.pot.highBid, player_id));
	}
	
	var BetStartedEvent = function(dealer, players) {
		this.getBetter = function() {
			return (dealer+that.bet_index+1)%players.length;
		}
	}

	var BetEndedEvent = function(bet_type, bet_amount, player_id) {
		this.getBetAmount = function() {
			return bet_amount;
		}

		this.getBetType = function() {
			return bet_type;
		}

		this.getPreviousBetter = function() {
			return getPlayerById(player_id);
		}
	}

	var RoundStartedEvent = function(smallBlind, dealer) {
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

	}

	var TurnStartedEvent = function(state, flippedCards) {
		that.newBet();
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

	}
}