var DumbAI = function (name) {
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

    this.setupNextRound = function (round_of_poker, id) {
	current_round = round_of_poker;
	player_id = id;
    }
}