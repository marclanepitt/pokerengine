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
      // let playerEl = `<div class='player player-`+playerName+i+`'>
      // `+playerName+`
      // (Money: <div class="money" style="display:inline-block">`+ match.players[i].actions.getBudget() +`</div>)
      // </div>`;
      let playerMessage = "Created player: " + playerName;
      this.appendMessage(playerMessage);
    }

    // let pot = $("<div id='pot'></div>");
    // $("body").append(pot);
  }

  this.appendMessage = function (message) {
    $('#messageLog').append('<p>' + message + '</p>');
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
      that.appendMessage("Current dealer: " + e.getDealer().getName());
      // let dealer = e.getDealer();
      // $(".player-" + dealer.getName() + dealer.player_id).append("Dealer");
      // console.log(e.getHand(id))
// =======
//       let dealer = e.getDealer();
//       $(".dealer").remove();
//       $(".player-"+dealer.getName()+dealer.player_id).append("<div class='dealer' style='display:inline-block'>Dealer</div>");
//       for(let i = 0; i < match.players.length; i++) {
//         $(".player-"+match.players[i].getName()+match.players[i].player_id).append(`<div class='cards'>`+
//         e.getHand(match.players[i].player_id)[0].getRank() + e.getHand(match.players[i].player_id)[0].getSuit() + 
//         e.getHand(match.players[i].player_id)[1].getRank() + e.getHand(match.players[i].player_id)[1].getSuit() + `
//         </div>
//         `);
//       }

// >>>>>>> 8e3f730000e8a485b21b2fe7ba07ec4c65d13e95
    });

    current_round.registerEventHandler(Poker.ROUND_ENDED_EVENT, function (e) {
      that.appendMessage("Round Ended, ___ won ___ money")
    });

    current_round.registerEventHandler(Poker.TURN_STARTED_EVENT, function (e) {
      for(let i = 0; i < e.getFlippedCards().length; i++) {
        allFlippedCards += " " + e.getFlippedCards()[i].getSuit() + e.getFlippedCards()[i].getRank();
      }
      that.appendMessage("Turn started, flipped cards are " + allFlippedCards);
    });

    // Check for all commands here
    current_round.registerEventHandler(Poker.BET_START_EVENT, function(e) {
      $(".turn").remove();

      if(e.getBetter().player_id === id) {
        that.appendMessage("Your turn - (budget: "+e.getBetter().actions.getBudget()+")");
        // $("#consoleSubmit").on("click", function() {
        //   let input = $("#pokerConsole").val();
        //   if(input.substring(0,5) === "raise") {
        //     let argList = input.split(' ');
        //     if(argList.length === 2 && !isNaN(parseInt(argList[1]))) {
        //       let number = parseInt(argList[1]);
        //       current_round.raise(number, e.getBetter().player_id);
        //     }
        //   } else if(input === "call") {
        //     current_round.call(e.getBetter().player_id);
        //   } else if(input ==="fold") {
        //     current_round.fold(e.getBetter().player_id);
        //   } else if(input === "check"){
        //     current_round.check(e.getBetter().player_id);
        //   }else {
        //     that.appendMessage("Invalid command");
        //   }
        // });

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
              console.log(e.getBetter());
              // console.log(current_round.players[e.getBetter().getId()].actions.getBudget());
            } else {
              that.appendMessage("Invalid command");
            }
          }
        });
      } else {
        that.appendMessage(e.getBetter().getName() + "'s turn - (budget: "+e.getBetter().actions.getBudget()+")");
      }
    });


    current_round.registerEventHandler(Poker.BET_ENDED_EVENT, function(e) {

      that.appendMessage(e.getPreviousBetter().getName() + " " + e.getBetType())
      $("#pot").text(JSON.stringify(current_round.pot));
      console.log("bet ended");

      $(".player-"+e.getPreviousBetter().getName()+e.getPreviousBetter().player_id+" .money").text(e.getPreviousBetter().actions.getBudget());
    });

    current_round.registerEventHandler(Poker.TURN_ENDED_EVENT, function (e) {
      that.appendMessage("Turn ended");
    });

    current_round.registerEventHandler(Poker.ERROR, function (e) {
      console.log(e.getError());
    });
  }
}
