/**
 * Define a carbonaceous asteroid object, inheriting from asteroid.
 * Specifies what resources it contains (i.e. distribution of pickups)
 */

define(
    [
        'require',
        'physicsjs',
        'js/asteroids/asteroid'
        //'physicsjs/bodies/circle'
    ],
    function(
        require,
        Physics
    ){

        Physics.body('asteroid-c', 'asteroid', function( parent ){
            var ast1 = new Image();
            ast1.src = require.toUrl('images/asteroidC1.png');

            return {
                init: function( options ){
                    parent.init.call(this, options);

                    this.view = ast1;
                },
                blowUp: function(){
                    var pickups = {
                        'pickup-c' : 25,
                        'pickup-f' : 50,
                        'pickup-w' : 25
                    };
                    parent.blowUp.call(this, pickups);
                }
            };
        });
    }
);
