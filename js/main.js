require(
{
    // use top level so we can access images
    baseUrl: './',
    packages: [{
        name: 'physicsjs',
        location: 'http://wellcaffeinated.net/PhysicsJS/assets/scripts/vendor/physicsjs-0.5.2/',
        main: 'physicsjs-0.5.2.min'
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

    function spawnAsteroid(Physics, world, ship, renderer){
        var x = 0;
        var y = 0;
        while (x == 0 && y == 0 && 
            x > ship.state.pos.get(0) - (renderer.options.width / 2) && 
            x < ship.state.pos.get(0) + (renderer.options.width / 2) && 
            y > ship.state.pos.get(1) - (renderer.options.height / 2) && 
            y < ship.state.pos.get(1) + (renderer.options.height / 2) 
            ){
            var ang = 4 * (Math.random() - 0.5) * Math.PI;
            var r = 400 + 400 * Math.random() + 100;
            x = 400 + Math.cos( ang ) * r;
            y = 300 + Math.sin( ang ) * r;
        }

        var asteroidTypes = [
            'asteroid-m',
            'asteroid-s',
            'asteroid-c'
        ];
        var randomAsteroid = Math.floor(Math.random()*asteroidTypes.length);

        world.add( Physics.body(asteroidTypes[randomAsteroid], {
            x: x,
            y: y,
            vx: 0.03 * Math.sin( ang ),
            vy: - 0.03 * Math.cos( ang ),
            angularVelocity: (Math.random() - 0.5) * 0.001,
            radius: 40,
            mass: 30,
            restitution: 0.6
        }));
    }

    var init = function init( world, Physics ){

    	world.options({timestep: 1000/30}); // set the physics resolution to 30 fps

        // bodies
        var ship = Physics.body('player', {
            x: 400,
            y: 100,
            vx: 0.08,
            radius: 30,
            mass: 30
        });
        ship.gameType = 'ship';

        var playerBehavior = Physics.behavior('player-behavior', { player: ship });

        var asteroids = [];
        for ( var i = 0, l = 50; i < l; ++i ){
            spawnAsteroid(Physics, world, ship, renderer);
        }

        var mainbase = Physics.body('circle', {
            fixed: true,
            // hidden: true,
            mass: 500,
            radius: 60,
            x: 400,
            y: 300
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

        // blow up anything that touches a laser pulse
        world.subscribe('collisions:detected', function( data ){
            var collisions = data.collisions
                ,col
                ;

            for ( var i = 0, l = collisions.length; i < l; ++i ){
                col = collisions[ i ];

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

            document.body.style.backgroundPosition = (ship.state.pos.get(0) / 2) + " " + (ship.state.pos.get(1) / 2);

            // draw the radar guides
            renderer.drawCircle(x, y, r, { strokeStyle: '#B3B3B3', fillStyle: '#010' });
            renderer.drawCircle(x, y, r * 2 / 3, { strokeStyle: '#B3B3B3' });
            renderer.drawCircle(x, y, r / 3, { strokeStyle: '#B3B3B3' });

            for (var i = 0, l = data.bodies.length, b = data.bodies[ i ]; b = data.bodies[ i ]; i++){

                // get the displacement of the body from the ship and scale it
                d.clone( ship.state.pos ).vsub( b.state.pos ).mult( -0.05 );
                // color the dot based on how massive the body is
                lightness = Math.max(Math.min(Math.sqrt(b.mass*10)|0, 100), 10);
                // if it's inside the minimap radius
                if (d.norm() < r && b.mass > 1){
                    // draw the dot
                    renderer.drawCircle(x + d.get(0), y + d.get(1), 1, 'hsl(60, 100%, '+lightness+'%)');
                }
            }

            scratch.done();
        });

        // add things to the world
        world.add([
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
