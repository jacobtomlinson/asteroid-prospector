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
                    var asteroidTypes = {
                        'asteroid-m' : 20,
                        'asteroid-s' : 20,
                        'asteroid-c' : 20
                    };
                    var randomAsteroid = Math.floor(Math.random()*asteroidTypes.length);
                    parent.blowUp.call(this, "pickup-c");
                }
            };
        });
    }
);
