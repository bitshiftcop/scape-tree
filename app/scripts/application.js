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


    //
    // temporary
    //
    //this.temptemptemp();
  },

  temptemptemp: function() {
    // Callback nodig wanneer scene async is ingeladen, timeout = crap
    setTimeout(function(){
      this.scene.addRightObjects(10);
      this.scene.addLeftObjects(10);

      setTimeout(function() {
        setInterval(function() {
          this.scene.addAdditionalLeftObjects(Math.round(Math.random() * 5));
        }.bind(this), 2000);
      }.bind(this), 4000);
    }.bind(this), 2000);
  }
};