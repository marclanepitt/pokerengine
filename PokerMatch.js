var PokerMatch = function (players, settings) {
    defaultSettings = {
        startingBudget:100,
    }

    this.settings = Object.assign(defaultSettings, settings);

    this.players = players;

    var round_setup_handlers = [];
    

    for(var i = 0; i < players.length; i++) {
        players[i].budget = this.settings.startingBudget;
        players[i].player_id = i;
    }

    var smallBlind = 1;
    var roundCount = 1;
    
    var that = this;

    var round_end_handler = function (e) {
    
        var count = 0;
        for(var i = 0; i < players.length; i++) {
            that.players[i].budget += e.round.getWinnings(that.players[i].player_id);
            if(that.players[i].budget === 0) {
                count++;
            }
        }
        if(count === that.players.length -1) {
            return;
            //match over
        }
		setTimeout(function() {setup_next_round();}, 1500);
    }

    var setup_next_round = function (e) {
        if(roundCount % 5 === 0) {
            smallBlind = smallBlind * 2;
        }
        var dealer = that.players[roundCount % that.players.length];
        var next_round = new RoundOfPoker(smallBlind, dealer, that.players);

        round_setup_handlers.forEach(function (callback) {
            callback(next_round);
        });
        
        next_round.registerEventHandler(Poker.ROUND_ENDED_EVENT, round_end_handler);
        
        for(var i = 0; i < that.players.length; i++) {
            that.players[i].setupNextRound(next_round, that.players[i].player_id);
        }

        next_round.startRound();
        roundCount++;
    }
        
    this.run = function() {
        setup_next_round();
    }

    for(var i = 0; i < that.players.length; i++) {
        that.players[i].setupMatch(this);
    }

    this.registerRoundSetupHandler = function(callback) {
	    round_setup_handlers.push(callback);
    }
}	    
	
 