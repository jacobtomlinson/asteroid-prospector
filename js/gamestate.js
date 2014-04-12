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

	this.isPaused = true;
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
			keyboard: false,
			show:true
		});
	});
	$('#handbook-company').on('click',function() {
		$('#gameHandbookModal').modal({
			backdrop: 'static',
			keyboard: false,
			show:true
		});
	});
	$('#handbook-achievements').on('click',function() {
		$('#gameHandbookModal').modal({
			backdrop: 'static',
			keyboard: false,
			show:true,
			remote: 'res/handbook/achieve/list.html',
		});
	});

};

GameState.prototype.startGame = function () {
	newGame();
	this.unpause();
};

/**
 * Call game over, with a particular reason

 * @param reason - hit, fuel
 */
GameState.prototype.gameOver = function(reason) {
	this.pause();
	$('#restartGameBtn').show();
	$('#gameOver').modal({
		backdrop: 'static',
		keyboard: false,
		show:true
	});
};

GameState.prototype.pause = function() {
	this.isPaused=true;
	this._world.pause();
	$('#fuel').removeClass('active');
};

GameState.prototype.unpause = function() {
	this.isPaused=false;
	this._world.unpause();
	$('#fuel').addClass('active');
};

/**
 * When your ship picks up resources, add them by calling this function
 *
 * @param type
 * @param amount
 */
GameState.prototype.pickup = function(type, amount) {

	this.checkAchievements();
};

/**
 * Called when the ship docks with the mothership
 *
 * @param dockingObject
 */
GameState.prototype.onDock = function(dockingObject) {
  this._shipFuel = 100;
};


/**
 * Get the current fuel levels
 */
GameState.prototype.getFuel = function() {
	return this._shipFuel;
};

/**
 * Use up some of your fuel reserves
 * @returns {Number}
 */
GameState.prototype.useFuel = function(units) {

	if (this.isPaused==true) return false;

	this._shipFuel -= units;
	this.render();

	if (this._shipFuel<0) {
		this.gameOver('fuel');
	}

	return this._shipFuel;
};

/**
 * Core UI rendering functions
 *
 * updates score, etc
 *
 */
GameState.prototype.render = function() {

	if (this.isPaused==true) return false;

	$('#score').html( 'points are happening...');
	// update fuel gauge
	$('#fuel .progress-bar ').attr('aria-valuenow',this._shipFuel).css('width', this._shipFuel+'%');

	if (this._shipFuel<15) {
		$('#fuel .progress-bar').addClass('progress-bar-danger').removeClass('progress-bar-warning');
	} else if (this._shipFuel<25) {
		$('#fuel .progress-bar').addClass('progress-bar-warning').removeClass('progress-bar-danger');
	} else {
		$('#fuel .progress-bar').removeClass('progress-bar-danger').removeClass('progress-bar-warning');
	}

};

/**
 * Check our scores to see if we should be interrupting the game with new achievements
 */
GameState.prototype.checkAchievements = function () {

};