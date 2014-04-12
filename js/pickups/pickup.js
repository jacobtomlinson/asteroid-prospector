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
                    var self = this;
                    var world = self._world;
                    if (!world){
                        return self;
                    }
                    pickup = typeof pickup !== 'undefined' ? pickup : "score1";
                    // remove pickup
                    world.removeBody( this );
                    world.publish({
                        topic: 'collect-point', 
                        body: pickup
                    });
                }
            };
        });
    }
);