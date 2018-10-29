/*
 *  COMP 426 - Fall 2018
 *  Basic UI
 */

var Player = function (name) {

    // The following two properties are required of all player objects
    // Do not touch these lines of code.
    
    this.actions = new PlayerActions();

    this.getName= function () {
	return name;
    }

    // These get set by the callback for later reference.
    
    var match = null;
    var current_round = null;
    var player_id = null;

    // Shouldn't need this if we use arrow functions.
    var that = this;


    // This appends a message to the message log of the
    // text-based interface. Your interface shouldn't need
    // this because everything will be graphical instead.
    
    this.appendMessage = function (message) {
	$('#messageLog').append('<p>' + message + '</p>');
	$('#messageLog').animate({scrollTop:$('#messageLog')[0].scrollHeight});
    }
    
    // Callback for setting up the match.
    
    this.setupMatch = function (poker_match) {
	match = poker_match;

	// Change the code below to update your interface
	// with player information.
	
	for(let i = 0; i < match.players.length; i++) {
	    let playerName = match.players[i].getName();
	    let playerMessage = "Created player: " + playerName;
	    this.appendMessage(playerMessage);
	}
    }


    // Callback at the beginning of each round.
    // This code should set up handlers for all of the round's events.
    // The code here appends messages to a message log. Your code should update
    // your graphical interface as appropriate.
    
    this.setupNextRound = function (round_of_poker, id) {
	current_round = round_of_poker;
	player_id = id;
	let allFlippedCards = [];

	current_round.registerEventHandler(Poker.ROUND_STARTED_EVENT, function (e) {
	    that.appendMessage("ROUND STARTED");
	    that.appendMessage("Current dealer: " + e.getDealer().getName() + ". SB = " + e.getSmallBlind() + "; BB = "  + e.getBigBlind());
	});

	current_round.registerEventHandler(Poker.ROUND_ENDED_EVENT, function (e) {
	    that.appendMessage("Round Ended, " + e.getWinner().getName() + " won $" + e.getWinnings() + " with " + e.getType());
	});

	current_round.registerEventHandler(Poker.TURN_STARTED_EVENT, function (e) {
	    
	    let cards_flipped_this_turn = e.getFlippedCards();
	    for(let i = 0; i < cards_flipped_this_turn.length; i++) {
		allFlippedCards.push(cards_flipped_this_turn[i]);
	    }

	    let turn_message = "Turn started (" + e.getTurnState() + ").";
	    
	    if (allFlippedCards.length == 0) {
		turn_message += " No flipped cards yet.";
	    } else {
		turn_message += "Flipped cards: <ul>";
		for(let i =0; i<allFlippedCards.length; i++) {
		    turn_message += "<li>" + allFlippedCards[i].toString() + "</li>";
		}
		turn_message += "</ul>";
	    }
	    that.appendMessage(turn_message);
	});

	// Check for all commands here
	current_round.registerEventHandler(Poker.BET_START_EVENT, function(e) {
	    // Checking player_id from event object against id saved when round started
	    // event was processed is how we know it is this player's turn.
	    if(e.getBetter().player_id === id) {
		let message = "Your turn - (budget: " + match.getPlayerBudget(e.getBetter().player_id) + ")";
		message += "<br>Valid actions: <ul>";
		let valid_actions = e.getValidActions();
		for (let i=0; i< valid_actions.length; i++) {
		    message += "<li>" + valid_actions[i] + "</li>";
		}
		message += "</ul>";
		that.appendMessage(message);
	    } else {
		that.appendMessage(e.getBetter().getName() + "'s turn - (budget: "+match.getPlayerBudget(e.getBetter().player_id)+")");
	    }
	});

	current_round.registerEventHandler(Poker.BET_ENDED_EVENT, function(e) {
	    if(e.getBetAmount() > 0) {
		that.appendMessage(e.getPreviousBetter().getName() + " action: " + e.getBetType() + " $" + e.getBetAmount());
	    } else {
		that.appendMessage(e.getPreviousBetter().getName() + " action: " + e.getBetType());
	    }

	    $(".player-"+e.getPreviousBetter().getName()+e.getPreviousBetter().player_id+" .money").text(match.getPlayerBudget(e.getPreviousBetter().player_id));
	});

	current_round.registerEventHandler(Poker.TURN_ENDED_EVENT, function (e) {
	    that.appendMessage("Turn ended");
	});

	current_round.registerEventHandler(Poker.GAME_OVER_EVENT, function(e) {
	    that.appendMessage(e.getWinner().getName() + " has won the entire game!");
	});

	current_round.registerEventHandler(Poker.ERROR, function (e) {
	    that.appendMessage("Error: " + e.getError());
	    console.log(e.getError());
	});
    }

    // The following handles the text-based commands. Your interface should
    // not need this but should be mouse/button driven (possibly with an input
    // for bet amounts).
    
    let handleTextInput =  function(event, isClick) {
	if(event.keyCode === 13 || isClick) {
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
		    playerHand += current_round.hands[player_id][i].toString();
		    if(i === 0) { playerHand += '<br />'; }
		}
        
		that.appendMessage(playerHand);
	    } else if(input === "pot") {
		let totalPot = 0;
		let pot_breakdown_mesg = "<ul>";

		for(var player in current_round.pot) {
		    totalPot += current_round.pot[player];
		    pot_breakdown_mesg += "<li>" + current_round.players[player].getName() + ": " + current_round.pot[player] + "</li>";
		}
		pot_breakdown_mesg += "</ul>";

		that.appendMessage("Current pot: " + totalPot + pot_breakdown_mesg);
		
	    } else if(input === "budgets") {
		let message = '<b>Budgets:</b>'
		for(let i = 0; i < current_round.players.length; i++) {
		    message += '<br />';
		    message += current_round.players[i].getName() + ': ' + match.getPlayerBudget(current_round.players[i].player_id);
		}
		that.appendMessage(message);
	    } else if(input === 'help') {
		that.appendMessage('Actions: raise (int), call, fold, check, hand, pot, budgets, help');
	    } else {
		that.appendMessage("Invalid command");
	    }
	    $("#pokerConsole").val("");
	}
    }

    $("#pokerConsole").on("keyup", (e)=>{handleTextInput(e, false)});
    $("#consoleSubmit").on("click", (e)=>{handleTextInput(e, true)});
}
