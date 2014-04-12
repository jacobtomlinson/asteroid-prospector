function GameState() {
	this.score = {};

}

/**
 * Take the score from the world object
 *
 * @param score
 */
GameState.prototype.setScore = function(score) {
	this.score = score;
	this.render();
};


/**
 * Core UI rendering functions
 *
 * updates score, etc
 *
 */
GameState.prototype.render = function() {
	$('#score').html(this.score + ' points');
}