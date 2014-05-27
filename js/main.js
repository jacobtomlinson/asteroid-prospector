require(
{
    // use top level so we can access images
    baseUrl: './',
    packages: [{
        name: 'physicsjs',
        location: 'js/physicsjs/',
        main: 'physicsjs-0.5.4.min'
    }]
},
[
    'require',
    'physicsjs',

    // custom modules
    'js/gamestate',
    'js/player/player',
    'js/player/player-behavior',
    'js/asteroids/asteroid-c',
    'js/asteroids/asteroid-s',
    'js/asteroids/asteroid-m',
    'js/pickups/pickup-c',
    'js/pickups/pickup-f',
    'js/pickups/pickup-p',
    'js/pickups/pickup-w',

    // official modules
    'physicsjs/renderers/canvas',
    'physicsjs/bodies/circle',
    'physicsjs/bodies/convex-polygon',
    'physicsjs/behaviors/newtonian',
    'physicsjs/behaviors/sweep-prune',
    'physicsjs/behaviors/body-collision-detection',
    'physicsjs/behaviors/body-impulse-response'
], function(
    require,
    Physics
){

    gamestate = new GameState();

    // set up the renderer and point it to the viewport
    var renderer = Physics.renderer('canvas', {
        el: 'viewport',
        width: window.innerWidth,
        height: window.innerHeight,
        // meta: true,
        // debug:true,
        styles: {
            'circle': {
                strokeStyle: 'rgb(0, 30, 0)',
                lineWidth: 1,
                fillStyle: 'rgb(255, 255, 255)',
                angleIndicator: false
            },
            'convex-polygon' : {
                strokeStyle: 'rgb(60, 0, 0)',
                lineWidth: 1,
                fillStyle: 'rgb(255, 0, 0)',
                angleIndicator: false
            }
        }
    });

    // create an asteroid
    function spawnAsteroid(Physics, world, ship, renderer){
        var x = 0;
        var y = 0;

        // find a location for the asteroid, in a circular belt
        // while loop makes sure the asteroid doesn't appear on the current view
        // (check that none of the asteroid belt overlaps with view at start
        // otherwise asteriod belt will have a gap in it)
        while (x == 0 && y == 0 || (
            x > ship.state.pos.get(0) - (renderer.options.width / 2) &&
            x < ship.state.pos.get(0) + (renderer.options.width / 2) &&
            y > ship.state.pos.get(1) - (renderer.options.height / 2) &&
            y < ship.state.pos.get(1) + (renderer.options.height / 2)
            )){
            var ang = 4 * (Math.random() - 0.5) * Math.PI;
            //var rmin = 500;
            //var rmax = 900;
            var rmin = 1000;
            var rmax = 1400;
            var r = rmin + (rmax - rmin) * Math.random();
            //var x0 = 0;
            //var y0 = 0;
            var x0 = -1500;
            var y0 = 0;
            x = x0 + Math.cos( ang ) * r;
            y = y0 + Math.sin( ang ) * r;
        }

        // set distribution of asteroid types (given as percentages)
        var asteroidTypes = {
            'asteroid-m': 8,
            'asteroid-s' : 17,
            'asteroid-c' : 75
        };

        // select type of asteroid to be created
        var randomAsteroid = Math.floor(Math.random() * 100);

        for (key in asteroidTypes) {
              randomAsteroid -= asteroidTypes[key];
              if (randomAsteroid <= 0){
                useAsteroid = key;
                break;
              }
        }

        // create the asteroid
        var asteroid = Physics.body(useAsteroid, {
            x: x,
            y: y,
            vx: 0.03 * Math.sin( ang ),
            vy: - 0.03 * Math.cos( ang ),
            angularVelocity: (Math.random() - 0.5) * 0.001,
            radius: 40,
            mass: 30,
            restitution: 0.6
        })

        asteroid.gameType = useAsteroid;

        world.add( asteroid );

    }

    var init = function init( world, Physics ){

    	var maxAsteroids = 50;

    	if (lowHW==true) {
    		world.options({timestep: 1000/20, maxIPF: 4}); // set the physics resolution to 30 fps
    		maxAsteroids = 40;
    	} else {
    		world.options({timestep: 1000/30, maxIPF: 8}); // set the physics resolution to 30 fps
    	}


        // create spaceship which will be controlled by the user
        var ship = Physics.body('player', {
            x: 0,
            y: 0,
            vx: 0.08,
            radius: 30,
            mass: 30,
            restitution: 0
        });
        ship.gameType = 'ship';

        var playerBehavior = Physics.behavior('player-behavior', { player: ship });

        // create asteroids
        var asteroids = [];

        for ( var i = 0, l = maxAsteroids; i < l; ++i ){
            spawnAsteroid(Physics, world, ship, renderer);
        }

        // create saturn
        var saturn = Physics.body('circle', {
            fixed: true,
            // hidden: true,
            mass: 0.001,
            radius: 0,
            x: 1500,
            y: -100
        });
        saturn.gameType = 'planet';
        saturn.view = new Image();
        saturn.view.src = require.toUrl('images/saturn.png');

        // create the main base
        var mainbase = Physics.body('circle', {
            fixed: true,
            // hidden: true,
            mass: 500,
            radius: 60,
            x: 200, // make sure it's not in the asteroid belt
            y: 300,
            restitution: 0
        });
        mainbase.gameType = 'base';
        mainbase.view = new Image();
        mainbase.view.src = require.toUrl('images/station.png');

        // render on every step
        world.subscribe('step', function(){
            // middle of canvas
            var middle = {
                x: 0.5 * window.innerWidth,
                y: 0.5 * window.innerHeight
            };
            // follow player
            renderer.options.offset.clone( middle ).vsub( ship.state.pos );
            world.render();
        });

        // count number of asteroids destroyed
        var killCount = 0;
        world.subscribe('blow-up', function( data ){

            killCount++;
            if ( killCount === asteroids.length ){
                world.publish('win-game');
            }

            spawnAsteroid(Physics, world, ship, renderer);
        });

        world.subscribe('collect-point', function( point ){
            gamestate.pickup(point.body, 1);
        });

        var countDown = setInterval(function(){
           gamestate.useFuel(1);
        },1000);

        // take action when a collision is detected
        world.subscribe('collisions:detected', function( data ){
            var collisions = data.collisions
                ,col
                ;

            for ( var i = 0, l = collisions.length; i < l; ++i ){
                col = collisions[ i ];

                // blow up anything that touches a laser pulse apart from the base
                if ( col.bodyA.gameType === 'laser' || col.bodyB.gameType === 'laser'){
                    if ( col.bodyA.blowUp ){
                        col.bodyA.blowUp();
                        world.removeBody( col.bodyB );
                    } else {
                        if (col.bodyA.gameType !== 'base'){
                            world.removeBody( col.bodyA );
                        }
                    }
                    if ( col.bodyB.blowUp ){
                        col.bodyB.blowUp();
                        world.removeBody( col.bodyA );
                    } else {
                        if (col.bodyB.gameType !== 'base'){
                            world.removeBody( col.bodyB );
                        }
                    }
                    return;
                }
                // collect the pickups if the ship collides with them
                if ( col.bodyA.gameType === 'ship' || col.bodyB.gameType === 'ship' ){
                    if ( col.bodyA.gameType === 'pickup' ) {
                        col.bodyA.collect();
                        return;
                    } else if (col.bodyB.gameType === 'pickup' ){
                        col.bodyB.collect();
                        return;
                    }
                }
            }
        });

        // draw minimap
        world.subscribe('render', function( data ){
            // radius of minimap
            var r = 100;
            // padding
            var shim = 15;
            // x,y of center
            var x = renderer.options.width - r - shim;
            var y = renderer.options.height - (r + shim);
            // the ever-useful scratchpad to speed up vector math
            var scratch = Physics.scratchpad();
            var d = scratch.vector();
            var lightness;

            // move and resize radar for smaller screens
            if ($( window ).height() < 500) {
            	r = 70;
            	x = renderer.options.width - (r*3) - shim;
            }

            // draw the radar guides
            renderer.drawCircle(x, y, r, { strokeStyle: '#B3B3B3', fillStyle: '#010' });
            renderer.drawCircle(x, y, r * 2 / 3, { strokeStyle: '#B3B3B3' });
            renderer.drawCircle(x, y, r / 3, { strokeStyle: '#B3B3B3' });

            for (var i = 0, l = data.bodies.length, b = data.bodies[ i ]; b = data.bodies[ i ]; i++){

                // get the displacement of the body from the ship and scale it
                d.clone( ship.state.pos ).vsub( b.state.pos ).mult( -0.05 );

                // if it has a mass bigger than 1
                if (b.mass > 1){
                    // if out side the minimap set the vector to the edge of the mini map
                    if (d.norm() > r && b.mass > 1){
                        var bx = r * Math.cos(d.angle());
                        var by = r * Math.sin(d.angle());
                        d.set(bx,by);
                    }
                    // draw the dot
                    if (b.gameType == 'base'){
                        renderer.drawCircle(x + d.get(0), y + d.get(1), 4, '#FFFFFF');
                    } else if (b.gameType == 'ship'){
                        renderer.drawCircle(x + d.get(0), y + d.get(1), 1, '#FF0000');
                    } else if (b.gameType == 'asteroid-s'){
                        renderer.drawCircle(x + d.get(0), y + d.get(1), 1, '#8A8077'); //#58493C
                    } else if (b.gameType == 'asteroid-c'){
                        renderer.drawCircle(x + d.get(0), y + d.get(1), 1, '#6B6B6B'); //#2C2C2C
                    } else if (b.gameType == 'asteroid-m'){
                        renderer.drawCircle(x + d.get(0), y + d.get(1), 1, '#848484'); //#505050
                    } else {
                        // color the dot based on how massive the body is
                        lightness = Math.max(Math.min(Math.sqrt(b.mass*10)|0, 100), 10);
                        renderer.drawCircle(x + d.get(0), y + d.get(1), 2, 'hsl(60, 100%, '+lightness+'%)');
                    }
                }
            }

            scratch.done();

            $('body').css('background-position', - Math.floor(ship.state.pos.get(0) / 2) + 'px ' + - Math.floor(ship.state.pos.get(1) / 2) + 'px');
        });

        // add things to the world
        world.add([
            //saturn,
            mainbase,
            ship,
            playerBehavior,
            Physics.behavior('newtonian', { strength: 1e-4 }),
            Physics.behavior('sweep-prune'),
            Physics.behavior('body-collision-detection'),
            Physics.behavior('body-impulse-response'),
            renderer
        ]);
    };

    var world = null;
    // reset for a new game
    newGame = function newGame(){

        if (world){
            world.destroy();
        }

        world = Physics( init );
        gamestate.setWorld(world);

    };

    // subscribe to ticker and start looping
    Physics.util.ticker.subscribe(function( time ){
        if (world){
            world.step( time );
        }
    }).start();
});
