/**
 * Define a basic asteroid object, with function blowUp to disintegrate it into pickups 
 */

define(
    [
        'require',
        'physicsjs',
        'physicsjs/bodies/circle'
    ],
    function(
        require,
        Physics
    ){

        Physics.body('asteroid', 'circle', function( parent ){
            var ast1 = new Image();
            ast1.src = require.toUrl('images/asteroid.png');

            return {
                init: function( options ){
                    parent.init.call(this, options);

                    this.view = ast1;
                },
                // blowUp describes what happens to an asteroid when it gets hit by a laser
                // i.e. it disintegrates into pickups
                blowUp: function(pickup){
                    pickup = typeof pickup !== 'undefined' ? pickup : {"pickup" : 100};
                    var self = this;
                    var world = self._world;
                    if (!world){
                        return self;
                    }
                    var scratch = Physics.scratchpad();
                    var rnd = scratch.vector();
                    var pos = this.state.pos;
                    var n = Math.floor(Math.random() * 4) + 2;
                    var r = 40;
                    var size = 10;
                    var mass = 0.001;
                    var d;
                    var pickups = [];
                    var first = true;
                    
                    // create pickups
                    while ( n-- ){
                        rnd.set( Math.random() - 1, Math.random() - 1 ).mult( r );

                        if (first){
                            usePickup = "pickup-w"
                            first = false;
                        } else {
                            pickupProb = Math.floor(Math.random() * 100);
                            var usePickup = "pickup";
                            for (var key in pickup) {
                              pickupProb -= pickup[key];
                              if (pickupProb <= 0){
                                usePickup = key;
                                break;
                              }
                            }
                        }
                        d = Physics.body(usePickup, {
                            x: pos.get(0) + rnd.get(0),
                            y: pos.get(1) + rnd.get(1),
                            //vx: this.state.vel.get(0) + (Math.random() - 0.5),
                            //vy: this.state.vel.get(1) + (Math.random() - 0.5),
                            vx: 0,
                            vy: 0,
                            angularVelocity: (Math.random()-0.5) * 0.06,
                            mass: mass,
                            radius: size,
                            restitution: 0.8
                        });
                        d.gameType = 'pickup';

                        pickups.push( d );
                    }
                    
                    // the pickups disappear if they're not collected soon enough
                    setTimeout(function(){
                        for ( var i = 0, l = pickups.length; i < l; ++i ){
                            world.removeBody( pickups[ i ] );
                        }
                        pickups = undefined;
                    }, 10000);

                    world.add( pickups );
                    world.removeBody( self );
                    scratch.done();
                    world.publish({
                        topic: 'blow-up', 
                        body: self
                    });
                    return self;
                }
            };
        });
    }
);
