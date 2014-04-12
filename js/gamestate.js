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
		'waste': 0,
	}

	this._shipFuel = 100;
	this._unlockedAchievements = { }

	this._world = null;
}

GameState.prototype.setWorld = function(world) {
	this._world = world;
};

/**
 * Override the score
 *
 * @param score
 */
GameState.prototype.setScore = function(score) {
	this._score = score;
	this.render();
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