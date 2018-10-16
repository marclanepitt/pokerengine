var DumbAI = function (name) {

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

	current_round.registerEventHandler(Hearts.GAME_STARTED_EVENT, function (e) {
	    if (e.getPassType() != Hearts.PASS_NONE) {
		var cards = current_game.getHand(player_key).getDealtCards(player_key);
		
		current_game.passCards(cards.splice(0,3), player_key);
	    }
	});

	current_game.registerEventHandler(Hearts.TRICK_START_EVENT, function (e) {
	    if (e.getStartPos() == position) {
		var playable_cards = current_game.getHand(player_key).getPlayableCards(player_key);
		current_game.playCard(playable_cards[0], player_key);
	    }
	});

	current_game.registerEventHandler(Hearts.TRICK_CONTINUE_EVENT, function (e) {
	    if (e.getNextPos() == position) {
		var playable_cards = current_game.getHand(player_key).getPlayableCards(player_key);
		current_game.playCard(playable_cards[0], player_key);
	    }
	});
    }
}