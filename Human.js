var Human = function (name) {
    this.player = new Player(name);
    
    var match = null;
    var current_round = null;
    var player_id = null;

    this.setupMatch = function (poker_match) {
	    match = poker_match;
    }

    this.getName = function () {
	    return name;
    }

    this.setId = function(id) {
        player_id = id;
    }

    this.setupNextRound = function (round_of_poker, id) {
        current_round = round_of_poker;
        player_id = id;
        console.log(current_round.registerEventHandler);
        console.log(registerEventHandler);
        current_round.registerEventHandler(Poker.ROUND_STARTED_EVENT, function (e) {
        console.log(e);
        });
    }
}