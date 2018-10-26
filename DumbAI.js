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

      current_round.registerEventHandler(Poker.BET_START_EVENT, function(e) {
        if(e.getBetter().player_id === id) {
          let keys = Object.keys(e.getValidActions())
          let key = keys[ keys.length * Math.random() << 0];
          let action = e.getValidActions()[key];
          if(key === "raise") {
            let maxBet  = getMax(current_round.pot);
            let aiPot = current_round.pot[id];
            let amt_to_raise = (maxBet-aiPot)+1;
            if(amt_to_raise <= e.getBetter().actions.budget - (maxBet - aiPot)) {
              action((maxBet-aiPot)+1, e.getBetter().player_id);
            } else {
              // if bet is too high, call/check
              if(e.getValidActions()['call']) {
                e.getValidActions()['call'](id);
              } else {
                e.getValidActions()['check'](id);
              }
            }
          } else {
            action(e.getBetter().player_id);
          }
        }
      });
    }
  }
