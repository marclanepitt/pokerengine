var PokerMatch = function (players, settings) {
  defaultSettings = {
    startingBudget:100,
  }

  this.settings = Object.assign(defaultSettings, settings);

  this.players = players;

  var round_setup_handlers = [];


  for(var i = 0; i < players.length; i++) {
    players[i].actions.setBudget(this.settings.startingBudget);
    players[i].player_id = i;
  }

  var smallBlind = 2;
  var roundCount = 1;

  var that = this;

  var round_track = {};

  var round_end_handler = function (e) {
    var count = 0;
    for(var i = 0; i < players.length; i++) {

      if(that.players[i].actions.getBudget() === 0) {
        that.players[i].actions.deactivate();
        count++;
      }
    }
    if(count === that.players.length -1) {
      round_track.dispatchEventHack(new GameOverEvent(e.getWinner()));
      return;
      //match over
    }
    setTimeout(function() {setup_next_round();}, 1500);
  }

  var setup_next_round = function (e) {
    if(roundCount % 2 === 0) {
      smallBlind = smallBlind * 2;
    }

    var activePlayers = [];
    for(let i = 0; i < players.length; i++) {
      if(players[i].actions.getActiveStatus()) {
        activePlayers.push(players[i]);
      }
    }

    var dealer = activePlayers[roundCount % activePlayers.length];
    var next_round = new RoundOfPoker(smallBlind, dealer, that.players);
    round_track = next_round;

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

  var GameOverEvent = function(winner) {
    this.event_type = Poker.GAME_OVER_EVENT;

    this.getWinner = function() {
      return winner;
    }

  }

}
