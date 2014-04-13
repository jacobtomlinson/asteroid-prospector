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

        Physics.body('asteroid-s', 'asteroid', function( parent ){
            var ast1 = new Image();
            ast1.src = require.toUrl('images/asteroidS1.png');

            return {
                init: function( options ){
                    parent.init.call(this, options);

                    this.view = ast1;
                },
                blowUp: function(){
                    var pickups = {
                        'pickup-c' : 34,
                        'pickup-p' : 33,
                        'pickup-w' : 34
                    };
                    parent.blowUp.call(this, pickups);
                }
            };
        });
    }
);