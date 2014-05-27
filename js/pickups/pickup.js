/**
 * Define a basic pickup object, with function 'collect' that removes the pickup once it
 * has been collected by the ship and say how much points it was worth
 */

define(
    [
        'require',
        'physicsjs',
        'physicsjs/bodies/circle',
    ],
    function(
        require,
        Physics
    ){

        Physics.body('pickup', 'circle', function( parent ){
            //var ast1 = new Image();
            //ast1.src = require.toUrl('images/asteroid.png');

            return {
                init: function( options ){
                    parent.init.call(this, options);

                    //this.view = ast1;
                },
                collect: function (pickup) {
                	gamestate.soundCollect.play();
                    var self = this;
                    var world = self._world;
                    if (!world){
                        return self;
                    }
                    pickup = typeof pickup !== 'undefined' ? pickup : "none";
                    // remove pickup
                    world.publish({
                        topic: 'collect-point',
                        body: pickup
                    });
                    world.removeBody( this );
                }
            };
        });
    }
);
