/*
 *  COMP 426 - Fall 2018
 *  basic UI
 *
 */

 var TextPlayer = function (name) {
  this.actions = new Player(name);

  var match = null;
  var current_round = null;
  var player_id = null;
  var executeToken = 1;

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
      that.appendMessage("Round Ended, "+e.getWinner().actions.getName()+" won $" + e.getWinnings() + " with " + e.getType())
    });

    current_round.registerEventHandler(Poker.TURN_STARTED_EVENT, function (e) {
      for(let i = 0; i < e.getFlippedCards().length; i++) {
        allFlippedCards += " suit: " + e.getFlippedCards()[i].getSuit() + " rank: " + e.getFlippedCards()[i].getRank();
      }
      if(allFlippedCards.length != 0) {
        that.appendMessage("Turn started, flipped cards are " + allFlippedCards);
      } else {
        that.appendMessage("Turn started, preflop (no flipped cards)");

      }
    });

    // Check for all commands here
    current_round.registerEventHandler(Poker.BET_START_EVENT, function(e) {
      $(".turn").remove();
      let temp = "";
      for(let i = 0; i < current_round.hands[e.getBetter().player_id].length; i++) {
        let arr_key = e.getBetter().player_id;
        temp += " suit: " + current_round.hands[arr_key][i].getSuit() + " rank: " + current_round.hands[arr_key][i].getRank();
      }
      if(e.getBetter().player_id === id) {
        that.appendMessage("Your turn - (budget: "+e.getBetter().actions.getBudget()+") your cards ("+temp+")");

        $("#pokerConsole").on("keydown", function(event) {
          if(event.keyCode === 13) {
            let input = $("#pokerConsole").val();
            if(input.substring(0,5) === "raise") {
              let argList = input.split(' ');
              if(argList.length === 2 && !isNaN(parseInt(argList[1]))) {
                let number = parseInt(argList[1]);
                current_round.raise(number, e.getBetter().player_id);
              }
            } else if(input === "call") {
              current_round.call(e.getBetter().player_id);
            } else if(input ==="fold") {
              current_round.fold(e.getBetter().player_id);
            } else if(input === "check"){
              current_round.check(e.getBetter().player_id);
            } else if(input === "budget") {
              that.appendMessage(e.getBetter().getBudget());
            } else if(input === "hand") {
            } else {
              that.appendMessage("Invalid command");
            }
          }
        });
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
      $("#pot").text(JSON.stringify(current_round.pot));
      $(".player-"+e.getPreviousBetter().getName()+e.getPreviousBetter().player_id+" .money").text(e.getPreviousBetter().actions.getBudget());
    });

    current_round.registerEventHandler(Poker.TURN_ENDED_EVENT, function (e) {
      that.appendMessage("Turn ended");
    });

    current_round.registerEventHandler(Poker.GAME_OVER_EVENT, function(e) {
      that.appendMessage(e.getWinner().actions.getName() + " has won the entire game!");
    });

    current_round.registerEventHandler(Poker.ERROR, function (e) {
      console.log(e.getError());
    });
  }
}
