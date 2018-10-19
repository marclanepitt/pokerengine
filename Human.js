var Human = function (name) {
  this.actions = new Player(name);

  var match = null;
  var current_round = null;
  var player_id = null;
  var executeToken = 1;

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
      console.log("round start");
    });

    current_round.registerEventHandler(Poker.TURN_STARTED_EVENT, function (e) {
      console.log("turn started");

    });


    current_round.registerEventHandler(Poker.BET_START_EVENT, function(e) {
      console.log("bet started ");
      console.log(e.getBetter().getName());
      if(e.getBetter().player_id === id) {
        $("#betButton").on("click", function(e) {
          current_round.raise($("#betAmount").val(),id);
        });
        $("#callButton").on("click", function(e) {
            current_round.call(id);
        });
        $("#checkButton").on("click", function(e) {
          current_round.check(id);
        });
        $("#foldButton").on("click", function(e) {
          current_round.fold(id);
        });
      }
    });


    current_round.registerEventHandler(Poker.BET_ENDED_EVENT, function(e) {
      console.log("bet ended");
    });

    current_round.registerEventHandler(Poker.TURN_ENDED_EVENT, function (e) {
      console.log("turn ended");
    });
  }
}
