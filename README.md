# Javascript Poker engine

### Custom Settings
##### startingBudget
* The amount of money each player starts with (default 100)
##### smallBlind 
* The amount of the small blind for each turn (default 2)
Note: Minimum bet for each round will be 2 * small blind
##### blindIncreaseFrequency
* The amount of rounds before the blinds double (default 3)

### Public Round Functions/Objects
##### Pot
* Player_id is key for all money that player has put in for current round

### Public Match Functions/Objects
##### getPlayerActiveStatus -> player_id
* returns true or false if a player is still in the match
##### getPlayerBudget -> player_id
* returns budget of player
##### players
* list of all players regardless of being active or not

### Events
##### ROUND_STARTED_EVENT
* getDealer \
Returns the player object of the dealer
* getHand -> player_id \
Returns the 2 card hand of the player with player_id
* getSmallBlind \
Returns the small blind amount
* getBigBlind \
Returns the big blind amount
* getBigBlindPlayer \
Returns the player object of the big blind
* getSmallBlindPlayer \
Returns the player object of the small blind
##### ROUND_ENDED_EVENT
* getWinner \
Returns the player object of the round winner
* getWinnings \
Returns the amount of money the player won
* getType \
Returns the way the player won the round
##### TURN_STARTED_EVENT
* getTurnState \
Returns the  name of the turn (i.e. preflop, flop, turn, river)
* getFlippedCards \
Returns the cards that have been flipped for each turn \
Note: No cards are flipped during preflop 
##### TURN_ENDED_EVENT
##### BET_STARTED_EVENT
* getBetter \
Returns the player who needs to bet
* getValidActions \
Returns a list of valid bet functions the player can use
##### BET_ENDED_EVENT
* getPreviousBetter \
Returns the player who just betted
* getBetType \
Returns the type of bet action the player did
* getBetAmount \
Returns the amount of money the player just bet (if any)
##### GAME_OVER_EVENT
* getWinner \
Returns the player object of the winner of the whole match
##### ERROR
* getError \
Returns error message

### Bet Actions
##### Raise -> bet_amount
* Raises the current max bet by bet_amount
##### Fold
* Eliminates player from round
##### Call
* Matches the current max bet
##### Check
* Player currently has the same amount as max bet, can opt to not add more money



