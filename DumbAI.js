var DumbAI = function (name) {
    this.actions = new Player(name);

    var match = null;
    var current_round = null;
    var player_id = null;

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

      current_round.registerEventHandler(Poker.ROUND_STARTED_EVENT, function (e) {
      });

      current_round.registerEventHandler(Poker.TURN_STARTED_EVENT, function (e) {

      });

      current_round.registerEventHandler(Poker.BET_START_EVENT, function(e) {
        // if(e.getBetter().player_id === id) {
        //   current_round.call(id);
        // }
        if(e.getBetter().player_id === id) {
            let action = e.getValidActions()[1+Math.floor(Math.random()*(e.getValidActions().length-1))];
            if(action.length === 2) {
              let maxBet  = getMax(current_round.pot);
              let aiPot = current_round.pot[id];
              console.log("comp to raise : " + (maxBet-aiPot+1));
              let amt_to_raise = (maxBet-aiPot)+1;
              console.log(e.getBetter().actions.budget);
              console.log(amt_to_raise);
              if(amt_to_raise <= e.getBetter().actions.budget - (maxBet - aiPot)) {
                action((maxBet-aiPot)+1, e.getBetter().player_id);
              } else {
                // if bet is too high, call/check
                console.log('bet averted - check/call instead');
                console.log(e.getValidActions()[2]);
                e.getValidActions()[2](e.getBetter().player_id);
              }
            } else {
              action(e.getBetter().player_id);
            }
            // $("#callButton").on("click", function(e) {
          //   current_round.call(id);
          // });
        }
      });

      current_round.registerEventHandler(Poker.BET_ENDED_EVENT, function(e) {
        if(e.getPreviousBetter().player_id === id) {
          console.log(e.getBetType());
        }
      });

      current_round.registerEventHandler(Poker.ERROR, function(e) {
      //   if(e.getBetter().player_id === id) {
      //   if(e.getError().substring(0,2) == "E0") {
      //     current_round.call();
      //     current_round.check();
      //   }
      // }
      });
    }
  }
