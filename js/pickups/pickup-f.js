/**
 * Define a fuel pickup object, inheriting from pickup
 */

define(
    [
        'require',
        'physicsjs',
        'js/pickups/pickup',
    ],
    function(
        require,
        Physics
    ){

        Physics.body('pickup-f', 'pickup', function( parent ){
            var ast1 = new Image();
            ast1.src = require.toUrl('images/pickupF.png');

            return {
                init: function( options ){
                    parent.init.call(this, options);

                    this.view = ast1;
                },
                collect: function (){
                   parent.collect.call(this, "fuel");
                }
            };
        });
    }
);
