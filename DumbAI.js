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

      current_round.registerEventHandler(Poker.ROUND_STARTED_EVENT, function (e) {
      });

      current_round.registerEventHandler(Poker.TURN_STARTED_EVENT, function (e) {

      });

      current_round.registerEventHandler(Poker.BET_START_EVENT, function(e) {
          if(e.getBetter().player_id === id) {
              let action = e.getValidActions()[Math.floor(Math.random()*e.getValidActions().length)];
              if(action.length === 2) {
                action(Math.floor(e.getBetter().actions.getBudget()/3), e.getBetter().player_id);
              } else {
                action(e.getBetter().player_id);
              }
              // $("#callButton").on("click", function(e) {
            //   current_round.call(id);
            // });
          }
      });

      current_round.registerEventHandler(Poker.BET_ENDED_EVENT, function(e) {
      });

      current_round.registerEventHandler(Poker.ERROR, function(e) {
      })
    }
  }
