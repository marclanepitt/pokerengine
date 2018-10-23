/* Model object for a playing card. */

var Card = function(rank, suit) {
    this.getRank = function () {
    	// Make sure that the rank is an integer
		return parseInt(rank);
    }

    this.getSuit = function () {
		return suit;
    }
}

Card.prototype.equals = function (other) {
    return ((other.getRank() == this.getRank()) &&
	    (other.getSuit() == this.getSuit()));
}

Card.prototype.toString = function () {
    return (Card.RankStrings[this.getRank()] + " of " + Card.SuitStrings[this.getSuit()]);
}

Card.Suit = {
    HEART : 0,
    SPADE : 1,
    DIAMOND : 2,
    CLUB: 3
}

Card.Rank = {
    ACE : 14,
    KING : 13,
    QUEEN : 12,
    JACK : 11
}

Card.RankStrings = ["", "", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight",
		    "Nine", "Ten", "Jack", "Queen", "King", "Ace"];
Card.SuitStrings = ["Hearts", "Spades", "Diamonds", "Clubs"];

Card.parseRank = function(rank) {
    var rank_val = parseInt(rank);

    if (isNaN(rank_val)) {
		var first_char = rank.trim().substring(0,1).toLowerCase();
		if (first_char == "a") {
		    rank_val = 14;
		} else if (first_char == "k") {
		    rank_val = 13;
		} else if (first_char == "q") {
		    rank_val = 12;
		} else if (first_char == "j") {
		    rank_val = 11;
		} else {
		    rank_val = -1;
		}
    }

    if (rank_val < 2 || rank_val > 14) {
		return undefined;
    }
    return rank_val;
}

Card.parseSuit = function(suit) {
    var first_char = suit.trim().substring(0,1).toLowerCase();

    switch (first_char) {
	    case "h": return Card.Suit.HEART;
	    case "s": return Card.Suit.SPADE;
	    case "c": return Card.Suit.CLUB;
	    case "d": return Card.Suit.DIAMOND;
    }
    return undefined;
}

var Deck = function () {
    var cards = [];

    [Card.Suit.HEART, Card.Suit.SPADE, Card.Suit.DIAMOND, Card.Suit.CLUB].forEach( function (suit) {
		for (var rank=2; rank<=Card.Rank.ACE; rank++) {
		    cards.push(new Card(rank, suit));
		}
    });

    var next_to_deal = 0;

    this.shuffle = function () {
        for (var i=0; i<cards.length; i++) {
            var shuffle_pos = Math.floor((cards.length - i) * Math.random()) + i;
            var tmp = cards[i];
            cards[i] = cards[shuffle_pos];
            cards[shuffle_pos] = tmp;
        }
    }

    this.deal = function (num_to_deal) {
        if (next_to_deal + num_to_deal > cards.length) {
            return null;
	}

	var dealt = [];
	for (var i=0; i<num_to_deal; i++) {
	    dealt.push(cards[next_to_deal]);
	    next_to_deal++;
	}
	return dealt;
    }
}

var Hand = function (dealt_cards, player_key, game) {
    var unplayed_cards = [];
    var played_cards = [];
    
    dealt_cards.forEach(function (card) {
	unplayed_cards.push(card);
    });

    this.contains = function(card, key) {
		if ((key != player_key) &&
		    (!game.isKey(key))) {
		    return undefined;
		}

		return (dealt_cards.find(function (c) {return c.equals(card);})) != undefined;
    }

    this.removePassedCard = function (card, key) {
		if (!game.isKey(key)) {
		    return false;
		}

		if (!this.contains(card, key)) {
		    return false;
		}

		var card_from_unplayed = unplayed_cards.find(function (c) {return c.equals(card);});
		if (!card_from_unplayed) {
		    return false;
		}

		var idx = unplayed_cards.indexOf(card_from_unplayed);
		unplayed_cards.splice(idx, 1);
		return true;
    }

    this.addPassedCard = function (card, key) {
		if (!game.isKey(key)) {
		    return false;
		}

		unplayed_cards.push(card);
		return true;
    }

    this.getUnplayedCards = function (key) {
		if ((key != player_key) &&
		    (!game.isKey(key))) {
		    return undefined;
		}

		return unplayed_cards.slice(0);
    }

    this.getPlayedCards = function (key) {
		if ((key != player_key) &&
		    (!game.isKey(key))) {
		    return undefined;
		}

		return played_cards.slice(0);
    }

    this.getDealtCards = function (key) {
		if ((key != player_key) &&
		    (!game.isKey(key))) {
		    return undefined;
		}

		return dealt_cards.slice(0);
    }
	
    this.getPlayableCards = function (key) {
		if ((key != player_key) &&
		    (!game.isKey(key))) {
		    return undefined;
		}
		
		var playable = [];
		var trick = game.getCurrentTrick();
		if (!trick) {
		    return playable;
		}
		if (unplayed_cards.length == 0) {
		    return playable;
		}
		
		if (trick.onLead()) {
		    if (game.onFirstTrick()) {
			// Only possibility is 2 of clubs if we have it.
			var two_of_clubs = new Card(2, Card.Suit.CLUB);
			var my_two_of_clubs = unplayed_cards.find(function (c) {
			    return two_of_clubs.equals(c);
			});
			if (my_two_of_clubs) {
			    playable.push(my_two_of_clubs);
			}
		    } else if (!game.pointsBroken()) {
			// Can only lead non-point cards unless that is all we have.
			unplayed_cards.forEach(function (c) {
			    if (c.pointValue() == 0) {
				playable.push(c);
			    }
			});
			if (playable.length == 0) {
			    // Must only have point cards.
			    // Add all cards as playable.
			    unplayed_cards.forEach(function (c) {playable.push(c)});
			}
		    } else {
			// Can lead anything.
			unplayed_cards.forEach(function (c) {playable.push(c)});
		    }
		} else {
		    // Must follow suit if possible.
		    unplayed_cards.forEach(function (c) {
			if (c.getSuit() == trick.getSuitLed()) {
			    playable.push(c);
			}
		    });
		    if (playable.length == 0) {
			// Must be void. All cards possible.
			unplayed_cards.forEach(function (c) {playable.push(c)});
		    }
		}
		return playable;
    }

    this.markCardPlayed = function(card, key) {
		if (!game.isKey(key)) {
		    return false;
		}

		var actual_card = unplayed_cards.find(function (c) {return card.equals(c);});
		if (actual_card == undefined) {
		    return false;
		}

		var idx = unplayed_cards.indexOf(actual_card);
		unplayed_cards.splice(idx, 1);

		played_cards.push(actual_card);
    }
    
	
    this.toString = function () {
		var str = "";

		str += "Dealt:\n";
	    
		dealt_cards.forEach(function (card) {
		    str += "\t" + card.toString() + "\n";
		});

		str += "Unplayed:\n";

		unplayed_cards.forEach(function (card) {
		    str += "\t" + card.toString() + "\n";
		});

		str += "Played:\n";

		played_cards.forEach(function (card) {
		    str += "\t" + card.toString() + "\n";
		});

		return str;
    }
}