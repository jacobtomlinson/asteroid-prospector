/**
 * Gamestate / UI helper functions
 *
 * @package Asteroid Prospector (NASA Space Apps 2014 Hackathon)
 * @author Kris Sum
 *
 */
function GameState() {

	// total score for the full game session
	this._gameScore = {
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
	this._shipShield = true;
	this._money = 0;
	this._world = null;
	this.isPaused = true;
	this.isGameOver = true;

	this.cashValues = {
			// values in $1000s
			preciousMetals: [
				{value: 50, name: 'ruthenium'},
				{value: 80, name: 'rhodium' },
				{value: 120, name: 'gold'},
				{value: 150, name: 'palladium'},
				{value: 300, name: 'iridium'},
				{value: 600, name: 'platinum'}
			],
			constructionMaterials: [
				{value: 40, name: 'nitrogen'},
				{value: 100, name: 'iron'},
				{value: 200, name: 'silicon'},
				{value: 250, name: 'magnesium'},
				{value: 400, name: 'aluminium'},
				{value: 500, name: 'nickel'},
			],
			waste: 5
	};

	this.achievements =	{
		achievement_w: {
			achieved: false,
	  },
		achievement_p: {
			achieved: false,
		},
	  achievement_c: {
		  achieved: false,
	  }
	};

}

GameState.prototype.init = function() {
	this.bindUI();

};

/**
 * Link our gamestate up to the physics world
 */
GameState.prototype.setWorld = function(world) {
	this._world = world;

	var thisGamestate = this;

	this.isGameOver = false;

	this._world.subscribe('lose-game', function(){
		thisGamestate.gameOver();
     });

};

GameState.prototype.bindUI = function() {

	$('#handbook-mining').on('click',function() {
		// load up mining info page in new tab
		gamestate.pause();
		return true;
	});
	$('#handbook-company').on('click',function() {
		$('#gameHandbookModal').modal({
			backdrop: 'static',
			keyboard: false,
			show:true
		}).on('hidden.bs.modal', function (e) {
			gamestate.unpause();
		});
		gamestate.pause();
	});
	$('#handbook-achievements').on('click',function() {
		$('#gameAchievementModal').modal({
			backdrop: 'static',
			keyboard: false,
			show:true,
		}).on('hidden.bs.modal', function (e) {
			gamestate.unpause();
		});
		gamestate.pause();
	});


};

GameState.prototype.togglePause = function () {
		if (this.isPaused==false) {
			this.pause();
		} else {
			this.unpause();
		}
}

GameState.prototype.pause = function() {
	this.isPaused=true;
	this._world.pause();

	$('#pause').addClass('active');
	$('#pause').html('<i class="glyphicon glyphicon-play"></i> Unpause');
	$('#fuel').removeClass('active');
	this.render();
};

GameState.prototype.unpause = function() {
	this.isPaused=false;
	this._world.unpause();
	$('#pause').removeClass('active');
	$('#pause').html('<i class="glyphicon glyphicon-pause"></i> Pause');
	$('#fuel').addClass('active');
	this.render();
};

GameState.prototype.startGame = function () {
	newGame();
	this.unpause();
	$('#pause').show();
};

/**
 * Call game over, with a particular reason

 * @param reason - hit, fuel
 */
GameState.prototype.gameOver = function(reason) {

	this.soundExplode.play();
	this.pause();
	this.isGameOver = true;
	$('#restartGameBtn').show();
	$('#pause').hide();
	$('#gameOver').modal({
		backdrop: 'static',
		keyboard: false,
		show:true
	});

	$('#gameOver .finalscore .money').html(gamestate._money);
	$('#gameOver .finalscore .preciousMetals').html(gamestate._gameScore.preciousMetals);
	$('#gameOver .finalscore .constructionMaterials').html(gamestate._gameScore.constructionMaterials);
	$('#gameOver .finalscore .waste').html(gamestate._gameScore.waste);

	// let the world keep on running
	this._world.unpause();
};



/**
 * When your ship picks up resources, add them by calling this function
 *
 * @param type
 * @param amount
 */
GameState.prototype.pickup = function(type, amount) {

	if (type=='none') return false;
	switch (type) {
		// we randomly pick up a different type of metal/material. This then gets converted to cash.
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

  this.soundDock.play();

  var score = 0;

  // increment gamescore
  this._gameScore.preciousMetals 			+= this._shipCargo.preciousMetals.length;
  this._gameScore.constructionMaterials 	+= this._shipCargo.constructionMaterials.length;
  this._gameScore.waste 					+= this._shipCargo.waste;

  // reset materials counts
  for (i=0; i<this.cashValues.preciousMetals.length; i++) {
	this.cashValues.preciousMetals[i].count = 0;
  }
  for (i=0; i<this.cashValues.constructionMaterials.length; i++) {
	this.cashValues.constructionMaterials[i].count = 0;
  }

  // work out how much of each thing we collected
  for (i=0; i<this._shipCargo.preciousMetals.length; i++) {
	  var pickupIndex = this._shipCargo.preciousMetals[i];
	  score += this.cashValues.preciousMetals[pickupIndex-1].value;
	  this.cashValues.preciousMetals[pickupIndex-1].count++;
  }
  for (i=0; i<this._shipCargo.constructionMaterials.length; i++) {
	  var pickupIndex = this._shipCargo.constructionMaterials[i];
	  score += this.cashValues.constructionMaterials[pickupIndex-1].value;
	  this.cashValues.constructionMaterials[pickupIndex-1].count++;
  }
  score += (this._shipCargo.waste *  this.cashValues.waste);

  this._money += score;

  if (score>0) {
	gamestate.pause();

	// generate the HTML breakdown

	var html='';

	html += '<div class="row">';

	html += '<div class="col-sm-6"><h2><img src="images/pickupP.png"> Precious Metals</h2>';

		html += '<table class="scores">';
		html += '<thead><tr><th>Element</th><th>Picked Up</th><th>Cash</th></tr></thead>';
		html += '<tbody>';

		for (i=0; i<this.cashValues.preciousMetals.length; i++) {
			var elementName = this.cashValues.preciousMetals[i].name;
			var count = this.cashValues.preciousMetals[i].count;
			var elementScore = count *  this.cashValues.preciousMetals[i].value;
			html += '<tr><td class="element"><a href="story.html#'+elementName+'" target="_blank">'+elementName.toUpperCase()+'</a></td><td>'+count+'</td><td>$'+elementScore+'K</td></tr>';
		}
		html += '</tbody>';

		html += '</table>';
	html += '</div>'; //precious metals

	html += '<div class="col-sm-6"><h2><img src="images/pickupC.png">  Construction Materials</h2>';

		html += '<table class="scores">';
		html += '<thead><tr><th>Element</th><th>Picked Up</th><th>Cash</th></tr></thead>';
		html += '<tbody>';

		for (i=0; i<this.cashValues.constructionMaterials.length; i++) {
			var elementName = this.cashValues.constructionMaterials[i].name;
			var count = this.cashValues.constructionMaterials[i].count;
			var elementScore = count *  this.cashValues.constructionMaterials[i].value;
			html += '<tr><td class="element"><a href="story.html#'+elementName+'" target="_blank">'+elementName.toUpperCase()+'</a></td><td>'+count+'</td><td>$'+elementScore+'K</td></tr>';
		}
		html += '</tbody>';

		html += '</table>';
	html += '</div>'; // construction

	html += '</div>'; // row

	html += '<h2><img src="images/pickupW.png"> Waste: $'+ (this._shipCargo.waste *  this.cashValues.waste)+'K </h2>';

	html += '<div class="totalscore">';
	html += '<h2>Cash Value: $'+ score +'K ';
	if (score != this._money) {
		html += ', Total: $'+ this._money +'K';
	}
	html += '</h2>';
	html + '</div>';

	// display message
	$('#gameModal').modal({
		backdrop: 'static',
		keyboard: true,
		show:true
	}).on('hidden.bs.modal', function (e) {
		gamestate.unpause();
	});
	$('#gameModal .modal-body').html(html);
	$('#gameModal .modal-title').html('<i class="glyphicon glyphicon-download"></i> Docking Complete. Resources transferred and converted to cash.');
	$('#gameModal .modal-footer .btn').focus();

  }

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

	$('#scores .preciousMetals span').html(this._shipCargo.preciousMetals.length);
	$('#scores .constructionMaterials span').html(this._shipCargo.constructionMaterials.length);
	$('#scores .waste span').html(this._shipCargo.waste);

	if (this._money>0) {
		$('#scores .money span.badge').html(this._money+'K');
	} else {
		$('#scores .money span.badge').html(0);
	}

	// update fuel gauge
	$('#fuel .progress-bar ').attr('aria-valuenow',this._shipFuel).css('width', this._shipFuel+'%');

	if (this._shipFuel<15) {
		$('#fuel .progress-bar').addClass('progress-bar-danger').removeClass('progress-bar-warning');
	} else if (this._shipFuel<25) {
		$('#fuel .progress-bar').addClass('progress-bar-warning').removeClass('progress-bar-danger');
	} else {
		$('#fuel .progress-bar').removeClass('progress-bar-danger').removeClass('progress-bar-warning');
	}

	if (this.isPaused) {
		if (!($('#pause').hasClass('active'))) {
			$('#pause').addClass('active');
		}
	} else {
		if (($('#pause').hasClass('active'))) {
			$('#pause').removeClass('active');
		}
	}


};

/**
 * Check our scores to see if we should be interrupting the game with new achievements
 */
GameState.prototype.checkAchievements = function () {

  if (this._shipCargo.waste + this._gameScore.waste >= 10) {
	  if (this.achievements.achievement_w.achieved == false) {
		  this.achievements.achievement_w.achieved = true;
		  gamestate.pause();
		  $('#achievement_w').addClass('achieved');
		  $('#gameAchievementModal').modal({
				backdrop: 'static',
				keyboard: true,
				show:true
			}).on('hidden.bs.modal', function (e) {
				gamestate.unpause();
			});
	  }
  }
  if (this._shipCargo.preciousMetals.length + this._gameScore.preciousMetals >= 10) {
	  if (this.achievements.achievement_p.achieved == false) {
		  this.achievements.achievement_p.achieved = true;
		  gamestate.pause();
		  $('#achievement_p').addClass('achieved');
		  $('#gameAchievementModal').modal({
			  backdrop: 'static',
			  keyboard: true,
			  show:true
		  }).on('hidden.bs.modal', function (e) {
			  gamestate.unpause();
		  });
	  }
  }
  if (this._shipCargo.constructionMaterials.length + this._gameScore.constructionMaterials >= 15) {
	  if (this.achievements.achievement_c.achieved == false) {
		  this.achievements.achievement_c.achieved = true;
		  gamestate.pause();
		  $('#achievement_c').addClass('achieved');
		  $('#gameAchievementModal').modal({
			  backdrop: 'static',
			  keyboard: true,
			  show:true
		  }).on('hidden.bs.modal', function (e) {
			  gamestate.unpause();
		  });
	  }
  }
};

GameState.prototype.getPlayerBehaviour = function() {
	var behaviours = this._world.getBehaviors();
	return behaviours[0];
};

GameState.prototype.getPlayer = function() {
	var behaviours = this._world.getBehaviors();
	return behaviours[0].player;
};

