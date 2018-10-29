var DumbAI = function (name) {
    this.actions = new PlayerActions();

    var current_round = null;
    var match = null;

    this.setupMatch = function (poker_match) {
      match = poker_match;
    }

    this.getName = function () {
      return name;
    }
    this.setupNextRound = function (round_of_poker, id) {
      current_round = round_of_poker;
      player_id = id;

      var getMax = function(pot) {
        var max = 0;
        for(var player in pot ) {
          if(pot[player] > max) {
            max = pot[player];
          }
        }
        return max;
      }

	current_round.registerEventHandler(Poker.BET_START_EVENT, function(e) {
	    console.log("BSE handler for DumbAI (" + match.players[id].getName() + ")");
	    
            if(e.getBetter().player_id === id) {
		let valid_actions = e.getValidActions();
		let action = valid_actions[ valid_actions.length * Math.random() << 0];
		if(action === "raise") {
		    let maxBet  = getMax(current_round.pot);
		    let aiPot = current_round.pot[id];
		    let amt_to_call = (maxBet-aiPot);

		    if (amt_to_call > match.getPlayerBudget(id)) {
			// Can't raise, can only call or check depending on which
			// is available to us.

			if (valid_actions.includes('call')) {
			    current_round.call();
			} else {
			    current_round.check();
			}
			return;
		    }
		    
		    let amt_to_raise = Math.floor(Math.random() * (match.getPlayerBudget(id) - amt_to_call) + 1);
		    current_round.raise(amt_to_raise);
		} else {
		    current_round[action]();
		}
            }
	});
    }
}
