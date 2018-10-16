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

	var TurnStartedEvent = function(state, flippedCards) {
		this.getTurnState = function() {
			switch(state) {
				case 0:
					return "flop";
				case 1:
					return "turn";
				case 2:
					return "river";
			}
		
		this.getFlippedCards = function() {
			return flippedCards;
		}
		}
	}

	var TurnEndedEvent = function() {
		this.getWinner = function() {
			return 
		}
	}
}