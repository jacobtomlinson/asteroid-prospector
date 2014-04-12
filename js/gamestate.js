/**
 * Gamestate helper functions
 */
function GameState() {

	// total score for the full game session
	this._gameScore = {
		'preciousMetals' : 0,
		'constructionMaterials' : 0,
		'waste': 0,
	};

	// current mission score
	this._missionScore = {
		'preciousMetals' : 0,
		'constructionMaterials' : 0,
		'waste': 0,
	};

	this._shipCargo = {
		'preciousMetals' : 0,
		'constructionMaterials' : 0,
		'waste': 0
	};

	this._shipFuel = 100;
	this._unlockedAchievements = { };

	this._world = null;
}

GameState.prototype.init = function() {
	this.bindUI();
}

GameState.prototype.setWorld = function(world) {
	this._world = world;

	var thisGamestate = this;

	this._world.subscribe('lose-game', function(){
		thisGamestate.gameOver();
     });

};

GameState.prototype.bindUI = function() {
	console.log('#handbook-mining');
	$('#handbook-mining').on('click',function() {
		$('#gameHandbookModal').modal({
			backdrop: 'static',
			show:true
		});
	});
	$('#handbook-company').on('click',function() {
		$('#gameHandbookModal').modal({
			backdrop: 'static',
			show:true
		});
	});
	$('#handbook-achievements').on('click',function() {
		$('#gameHandbookModal').modal({
			backdrop: 'static',
			show:true
		});
	});
};

GameState.prototype.startGame = function () {
	newGame();
};

GameState.prototype.gameOver = function() {
	this._world.pause();
	alert('GameOver!');
	$('#restartGameBtn').show();

};


/**
 * When your ship picks up resources, add them by calling this function
 *
 * @param type
 * @param amount
 */
GameState.prototype.pickup = function(type, amount) {

	this.checkAchievements();
}

/**
 * Called when the ship docks with the mothership
 *
 * @param dockingObject
 */
GameState.prototype.onDock = function(dockingObject) {

}


/**
 * Get the current fuel levels
 */
GameState.prototype.getFuel = function() {
	return this._shipFuel;
}

/**
 * Use up some of your fuel reserves
 * @returns {Number}
 */
GameState.prototype.useFuel = function(units) {
	this._shipFuel -= units;
	return this._shipFuel;
}

/**
 * Core UI rendering functions
 *
 * updates score, etc
 *
 */
GameState.prototype.render = function() {
	$('#score').html( 'points are happening...');
}

/**
 * Check our scores to see if we should be interrupting the game with new achievements
 */
GameState.prototype.checkAchievements = function () {

}