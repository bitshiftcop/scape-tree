'use strict';

function Application() {
  $(document).ready( this.init.bind( this ) );
}

Application.prototype = {
  init: function() {

    // create scene
    this.scene = new Scene();


    // add mouse move listener
    $('body').mousemove( function() {
      this.scene.mousemove( event );
    }.bind( this ) );


    // add resize listener
    $(window).resize( function() {
      //this.scene.resize();
    }.bind( this ) );


    // listen to what the user has to say
    if (annyang) {
      var commands = {
        'drop tree': function() {
          this.scene.dropTrees(1);
        }.bind( this ),

        /*
        'drop :amount trees': function( amount ) {
          this.scene.dropTrees(amount);
        }.bind( this ),
        */

        'drop some trees': function() {
          this.scene.dropTrees(_.random(3, 10));
        }.bind( this ),

        'drop forest': function() {
          this.scene.dropTrees(30);
        }.bind( this ),

        'remove some trees': function() {
          this.scene.eraseTrees(_.random(3, 10));
        }.bind( this ),

        'suck a cock': function() {
          window.location = 'https://www.youtube.com/watch?v=tiuO8m0_aeQ';
        }
      };

      // add our commands to annyang
      annyang.addCommands(commands);

      // start listening
      annyang.start();
    }
  },
};