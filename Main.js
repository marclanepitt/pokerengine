$(document).ready(function(){
    $('#usernameEnter').click(function() {
        let username = $('#usernameInput').val();
        if(username === '') {
            console.log('Invalid username');
        } else {
            $('#usernameConsole').hide();
            $('#matchConsole').show();
	    
            var player = new Player(username);
            var ai = new DumbAI("CPU1");
            var ai1 = new DumbAI("CPU2");
            var ai2 = new DumbAI("CPU3");
            var ai3 = new DumbAI("CPU4");
	    
            var players = [player,ai,ai1,ai2, ai3]
            var match = new PokerMatch(players, {startingBudget: 100, blindIncreaseFrequency: 5});
	    
            match.run();
        }
    });
});
