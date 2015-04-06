'use strict';

function Application( options ) {
  this.defaults = {
    enableVoice: true
  };

  this.settings = _.extend(this.defaults, options);
  console.log(this.settings);

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


    // listen to what the user has to say
    if (this.settings.enableVoice && annyang) {
      var commands = {
        'drop tree': function() {
          console.log('drop tree');
          this.scene.dropTrees(1);
        }.bind( this ),

        'drop :amount trees': function( amount ) {
          console.log('drop ' + amount + ' trees');
          this.scene.dropTrees(amount);
        }.bind( this ),

        'drop some trees': function() {
          console.log('drop some trees');
          this.scene.dropTrees(_.random(3, 10));
        }.bind( this ),

        'drop forest': function() {
          console.log('drop forest');
          this.scene.dropTrees(30);
        }.bind( this ),

        'remove some trees': function() {
          console.log('remove some trees');
          this.scene.eraseTrees(_.random(3, 10));
        }.bind( this ),

        'suck a cock': function() {
          window.location = 'https://www.youtube.com/watch?v=tiuO8m0_aeQ';
        }
      };

      // add our commands to annyang
      annyang.addCommands(commands);

      annyang.addCallback('start', function() {  console.log('start'); });
      annyang.addCallback('error', function() {  console.log('error'); });
      annyang.addCallback('end', function() {  console.log('end'); });
      annyang.addCallback('result', function() {  console.log('result'); });
      annyang.addCallback('resultMatch', function() {  console.log('resultMatch'); });
      annyang.addCallback('resultNoMatch', function() {  console.log('resultNoMatch'); });
      annyang.addCallback('errorNetwork', function() {  console.log('errorNetwork'); });
      annyang.addCallback('errorPermissionBlocked', function() {  console.log('errorPermissionBlocked'); });
      annyang.addCallback('errorPermissionDenied', function() {  console.log('errorPermissionDenied'); });

      // start listening
      annyang.start({continuous:true});
    }
  },
};