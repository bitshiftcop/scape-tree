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
      this.scene.resize();
    }.bind( this ) );
  },
};