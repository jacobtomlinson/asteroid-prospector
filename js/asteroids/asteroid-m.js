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

        Physics.body('asteroid-m', 'asteroid', function( parent ){
            var ast1 = new Image();
            ast1.src = require.toUrl('images/asteroid.png');

            return {
                init: function( options ){
                    parent.init.call(this, options);

                    this.view = ast1;
                },
                blowUp: function(){
                   parent.blowUp.call(this, "pickup-m");
                }
            };
        });
    }
);