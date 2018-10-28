/*
 *  COMP 426 - Fall 2018
 *  Basic UI
 *  make enter button work
 *  clear input when command accepted
 */

 var TextPlayer = function (name) {
  this.actions = new PlayerActions();
  this.name = name;

  var match = null;
  var current_round = null;
  var player_id = null;

  var that = this;

  this.setupMatch = function (poker_match) {
    match = poker_match;

    for(let i = 0; i < match.players.length; i++) {
      let playerName = match.players[i].getName();
      let playerMessage = "Created player: " + playerName;
      this.appendMessage(playerMessage);
    }
  }

  this.appendMessage = function (message) {
    $('#messageLog').append('<p>' + message + '</p>');
    $('#messageLog').animate({scrollTop:$('#messageLog')[0].scrollHeight});
  }

  this.getName = function () {
    return name;
  }

  this.setupNextRound = function (round_of_poker, id) {
    current_round = round_of_poker;
    player_id = id;
    let allFlippedCards = "";

    current_round.registerEventHandler(Poker.ROUND_STARTED_EVENT, function (e) {
      that.appendMessage("ROUND STARTED");
      that.appendMessage("Current dealer: " + e.getDealer().getName() + ". SB = " + e.getSmallBlind() + "; BB = "  + (e.getSmallBlind()*2));

    });

    current_round.registerEventHandler(Poker.ROUND_ENDED_EVENT, function (e) {
      that.appendMessage("Round Ended, " + e.getWinner().name + " won $" + e.getWinnings() + " with " + e.getType());
    });

    current_round.registerEventHandler(Poker.TURN_STARTED_EVENT, function (e) {
      for(let i = 0; i < e.getFlippedCards().length; i++) {
        allFlippedCards += '<br />';
        allFlippedCards += e.getFlippedCards()[i].toString();
      }

      if(allFlippedCards.length != 0) {
        that.appendMessage("Turn started, flipped cards are:" + allFlippedCards);
      } else {
        that.appendMessage("Turn started, preflop (no flipped cards)");
      }
    });

    // Check for all commands here
    current_round.registerEventHandler(Poker.BET_START_EVENT, function(e) {
      if(e.getBetter().player_id === id) {
        that.appendMessage("Your turn - (budget: " + e.getBetter().actions.getBudget() + ")");

        if(e.getValidActions().hasOwnProperty('call')) {
          that.appendMessage("Valid bet actions: raise, fold, or call");
        } else {
          that.appendMessage("Valid bet actions: raise, fold, or check");
        }
      } else {
        that.appendMessage(e.getBetter().getName() + "'s turn - (budget: "+e.getBetter().actions.getBudget()+")");
      }
    });

    current_round.registerEventHandler(Poker.BET_ENDED_EVENT, function(e) {
      if(e.getBetAmount() > 0) {
        that.appendMessage(e.getPreviousBetter().getName() + " action: " + e.getBetType() + " $" + e.getBetAmount());
      } else {
        that.appendMessage(e.getPreviousBetter().getName() + " action: " + e.getBetType());
      }

      $(".player-"+e.getPreviousBetter().getName()+e.getPreviousBetter().player_id+" .money").text(e.getPreviousBetter().actions.getBudget());
    });

    current_round.registerEventHandler(Poker.TURN_ENDED_EVENT, function (e) {
      that.appendMessage("Turn ended");
    });

    current_round.registerEventHandler(Poker.GAME_OVER_EVENT, function(e) {
      that.appendMessage(e.getWinner().name + " has won the entire game!");
    });

    current_round.registerEventHandler(Poker.ERROR, function (e) {
      console.log(e.getError());
    });
  }

  $("#pokerConsole").on("keyup", function(event) {
    if(event.keyCode === 13) {
      let input = $("#pokerConsole").val();
      if(input.substring(0,5) === "raise") {
        let argList = input.split(' ');
        if(argList.length === 2 && !isNaN(parseInt(argList[1]))) {
          let number = parseInt(argList[1]);
          current_round.raise(number);
        }
      } else if(input === "call") {
        current_round.call();
      } else if(input ==="fold") {
        current_round.fold();
      } else if(input === "check"){
        current_round.check();
      } else if(input === "hand") {
        let playerHand = '';
        for(let i = 0; i < current_round.hands[player_id].length; i++) {
          let arr_key = player_id;
          playerHand += current_round.hands[arr_key][i].toString();
          if(i === 0) { playerHand += '<br />'; }
        }
        
        that.appendMessage(playerHand);
      } else if(input === "pot") {
        let totalPot = 0;
        for(var player in current_round.pot) {
          totalPot += current_round.pot[player];
        }

        that.appendMessage("Current pot: " + totalPot);
      } else if(input === "budgets") {
        let message = '<b>Budgets:</b>'
        for(let i = 0; i < current_round.players.length; i++) {
          message += '<br />';
          message += current_round.players[i].getName() + ': ' + current_round.players[i].actions.getBudget();
        }
        that.appendMessage(message);
      } else if(input === 'help') {
        that.appendMessage('Actions: raise (int), call, fold, check, hand, pot, budgets, help');
      } else {
        that.appendMessage("Invalid command");
      }
    }
  });
}
