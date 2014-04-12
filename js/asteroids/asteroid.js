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
                blowUp: function(pickup){
                    pickup = typeof pickup !== 'undefined' ? pickup : "pickup";
                    var self = this;
                    var world = self._world;
                    if (!world){
                        return self;
                    }
                    var scratch = Physics.scratchpad();
                    var rnd = scratch.vector();
                    var pos = this.state.pos;
                    var n = Math.floor(Math.random() * 2) + 3;
                    var r = 40;
                    var size = 10;
                    var mass = 0.001;
                    var d;
                    var debris = [];
                    
                    // create pickups
                    while ( n-- ){
                        rnd.set( Math.random() - 1, Math.random() - 1 ).mult( r );
                        d = Physics.body(pickup, {
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

                        debris.push( d );
                    }

                    setTimeout(function(){
                        for ( var i = 0, l = debris.length; i < l; ++i ){
                            world.removeBody( debris[ i ] );
                        }
                        debris = undefined;
                    }, 10000);

                    world.add( debris );
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