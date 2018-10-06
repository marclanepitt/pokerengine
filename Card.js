/* Model object for a playing card. */

var Card = function(rank, suit) {

    this.getRank = function () {
	return rank;
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