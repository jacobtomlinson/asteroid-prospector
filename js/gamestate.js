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
	// not used
	this._missionScore = {
		'preciousMetals' : 0,
		'constructionMaterials' : 0,
		'waste': 0,
	};

	this._shipCargo = {
		'preciousMetals' : [],
		'constructionMaterials' : [],
		'waste': 0
	};

	this._shipFuel = 100;
	this._unlockedAchievements = { };
	this._storyProgression = 1;

	this._money = 0;

	this._world = null;
	this.isPaused = true;

	this.cashValues = {
			// values in $1000s
			preciousMetals: [
				{value: 50},
				{value: 80},
				{value: 120},
				{value: 150},
				{value: 300},
				{value: 600}
			],
			constructionMaterials: [
				{value: 40},
				{value: 100},
				{value: 200},
				{value: 250},
				{value: 400},
				{value: 500},
			],
			waste: 5
	};


}

GameState.prototype.init = function() {
	this.bindUI();
};

GameState.prototype.setWorld = function(world) {
	this._world = world;

	var thisGamestate = this;

	this._world.subscribe('lose-game', function(){
		thisGamestate.gameOver();
     });

};

GameState.prototype.bindUI = function() {

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
	console.log('picked up ',type,amount);

	if (type=='none') return false;
	switch (type) {
		case 'preciousMetals':
			this._shipCargo.preciousMetals.push( Math.floor((Math.random()*6)+1) );
		break;
		case 'constructionMaterials':
			this._shipCargo.constructionMaterials.push( Math.floor((Math.random()*6)+1) );
		break;
		case 'waste':
			this._shipCargo.waste+=amount;
		break;
		case 'fuel':
			this.addFuel(5);
		break;
	}

	this.render();
	this.checkAchievements();
};

/**
 * Called when the ship docks with the mothership
 *
 * @param dockingObject
 */
GameState.prototype.onDock = function(dockingObject) {
  this._shipFuel = 100;

  var score = 0;

  for (i=0; i<this._shipCargo.preciousMetals.length; i++) {
	  var pickupIndex = this._shipCargo.preciousMetals[i];
	  score += this.cashValues.preciousMetals[pickupIndex].value;
  }
  for (i=0; i<this._shipCargo.constructionMaterials.length; i++) {
	  var pickupIndex = this._shipCargo.constructionMaterials[i];
	  score += this.cashValues.constructionMaterials[pickupIndex].value;
  }
  score += (this._shipCargo.waste *  this.cashValues.waste);

  this._money += score;

  alert('YOU GOT: '+  score);

  // display message

  // reset cargo
  this._shipCargo.constructionMaterials = Array();
  this._shipCargo.preciousMetals = Array();
  this._shipCargo.waste = 0;

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

GameState.prototype.addFuel = function(units) {
	this._shipFuel += units;
	if (this._shipFuel >100) {
		this._shipFuel = 100;
	}
};

/**
 * Core UI rendering functions
 *
 * updates score, etc
 *
 */
GameState.prototype.render = function() {

	if (this.isPaused==true) return false;

	$('#scores .preciousMetals span.badge').html(this._shipCargo.preciousMetals.length);
	$('#scores .constructionMaterials span.badge').html(this._shipCargo.constructionMaterials.length);
	$('#scores .waste span.badge').html(this._shipCargo.waste);
	$('#scores .money span.badge').html(this._money);

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