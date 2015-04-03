'use strict';

function Scene() {

  // consts
  this.CAMERA_Y_OFFSET = 250;
  this.FOG_COLOR = 0x3a87b2;

  // scene assets
  this.scene = null;
  this.camera = null;
  this.renderer = null;

  // mouse stuff
  this._mouse = new THREE.Vector2();

  // models
  this.terrain = null;
  this.treeBlueprints = [];
  this.trees = [];

  // at the right of the river
  var rightDropZone = new THREE.Box2();
  rightDropZone.setFromCenterAndSize(
    new THREE.Vector2(295, -1100),
    new THREE.Vector2(500, 800)
  );

  // at the left of the river
  var leftDropZone = new THREE.Box2();
  leftDropZone.setFromCenterAndSize(
    new THREE.Vector2(-275, -1100),
    new THREE.Vector2(500, 800)
  );

  // dropzones, zones where tree are allowed to drop
  this.dropZones = [
    rightDropZone,
    leftDropZone
  ];

  // create scene, start cycle
  this.createScene();
  this.animate();
}


Scene.prototype = {
  createScene: function() {
    var d = 1000,
      hemiLight,
      dirLight,
      terrainUrls = ['obj/landscape/landscape_0001.obj', 'obj/landscape/landscape_0001.mtl'],
      terrainLoader,
      gui;


    // create camera
    this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );
    this.camera.position.set( 0, this.CAMERA_Y_OFFSET, 600 );
    this.camera.rotation.set( -0.3, 0, 0 );


    // create scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog( this.FOG_COLOR, 1, 10000 );


    // create hemi light
    hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
    hemiLight.color.setHSL( 0.6, 1, 0.6 );
    hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
    hemiLight.position.set( 0, 500, 0 );
    this.scene.add( hemiLight );


    // create directional light
    dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
    dirLight.color.setHSL( 0.1, 0.75, 0.7 );
    dirLight.position.set( 190, 190, 150 );
    dirLight.castShadow = true;
    dirLight.shadowMapWidth = 2048;
    dirLight.shadowMapHeight = 2048;
    dirLight.shadowCameraLeft = -d;
    dirLight.shadowCameraRight = d;
    dirLight.shadowCameraTop = d;
    dirLight.shadowCameraBottom = -d;
    dirLight.shadowCameraFar = 5000;
    dirLight.shadowBias = -0.00001;
    dirLight.shadowDarkness = 0.35;
    this.scene.add( dirLight );


    // load terrain, configure, append to scene
    terrainLoader = new THREEx.UniversalLoader();
    terrainLoader.load(terrainUrls, function ( obj ) {

      this.terrain = obj;
      this.terrain.position.y = - 80;
      this.terrain.traverse(function( child ){
        child.receiveShadow = true;
      });

      this.scene.add( this.terrain );

    }.bind( this ));


    // load tree blueprints
    this.loadTreeBlueprint('pinetree', function( obj ){
      this.treeBlueprints.push( obj );
    }.bind( this ));

    this.loadTreeBlueprint('boptree', function( obj ) {
      this.treeBlueprints.push( obj );
    }.bind( this ));

    this.loadTreeBlueprint('longtree', function( obj ) {
      this.treeBlueprints.push( obj );
    }.bind( this ));


    // renderer
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor( this.FOG_COLOR, 1 );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.shadowMapEnabled = true;


    // append renderer dom to overall
    document
      .getElementById( 'scene' )
      .appendChild( this.renderer.domElement );


    // create gui
    gui = new dat.GUI();
    gui.add( this.camera.position, 'x', -500, 500 ).step( 5 );
    gui.add( this.camera.position, 'y', -500, 500 ).step( 5 );
    gui.add( this.camera.position, 'z', -2000, 2000 ).step( 5 );
    gui.add( this.camera.rotation, 'x', -1, 1 );

    gui.add( this.camera, 'fov', 20, 80 ).step( 1 ).onChange(function(){
      this.camera.updateProjectionMatrix();
    }.bind( this ));

    gui.add({
      dropTrees:function(){
        this.dropTrees(_.random(3, 10));
      }.bind( this )}, 'dropTrees');

    gui.add({
      eraseTrees:function(){
        this.eraseTrees(_.random(3, 10));
      }.bind( this )}, 'eraseTrees');
  },


  // load a tree blueprint, configure it and return it when ready
  loadTreeBlueprint: function( type, callback ) {

    var path = 'obj/trees/' + type + '/' + type,
      urls = [path + '.obj', path + '.mtl'],
      loader;

    // load tree
    loader = new THREEx.UniversalLoader();
    loader.load(urls, function ( obj ) {

      // set object to cast shadow
      obj.traverse(function( child ){
        child.castShadow = true;
      });

      // callback
      if( callback ){
        callback( obj );
      }

    });
  },


  // create a random tree starting from one of the blueprints
  createTree: function() {
    var treeBlueprint = _.sample( this.treeBlueprints ),
      tree = treeBlueprint.clone();

    // random scale & rotation
    tree.scale.x = tree.scale.y = tree.scale.z = 0.5 + ( Math.random() / 2 );
    tree.rotation.y = Math.random();

    return tree;
  },


  // drop some random trees
  dropTrees: function( amount ) {

    var i = 0,
      distanceFromGroupCenter = 100,
      randomDropZone,
      zoneWidth, zoneHeight,
      groupCenter,
      tree, treeCenter;

    // pick random zone
    randomDropZone = _.sample(this.dropZones);
    zoneWidth = randomDropZone.max.x - randomDropZone.min.x - (distanceFromGroupCenter * 2);
    zoneHeight = randomDropZone.max.y - randomDropZone.min.y - (distanceFromGroupCenter * 2);

    // pick a random position in the zone
    groupCenter = new THREE.Vector2(
      randomDropZone.min.x + distanceFromGroupCenter + ( Math.random() * zoneWidth ),
      randomDropZone.max.y + distanceFromGroupCenter + ( Math.random() * zoneHeight )
    );

    // create trees, position them
    for( ; i < amount ; i++) {

      // pick a random position from the group center
      treeCenter = new THREE.Vector2(
        _.random(groupCenter.x - distanceFromGroupCenter, groupCenter.x + distanceFromGroupCenter),
        _.random(groupCenter.y - distanceFromGroupCenter, groupCenter.y + distanceFromGroupCenter)
      );

      // create tree
      tree = this.createTree();
      tree.position.set(treeCenter.x, 500, treeCenter.y);

      // animate in
      TweenMax.to(tree.position, 0.25 + (Math.random() * 0.25), {
        delay: Math.random() * 0.25,
        y: -80,
        ease:Sine.easeIn
      });

      this.scene.add( tree );
      this.trees.push( tree );
    }
  },


  // animate out and erase some trees
  eraseTrees: function( amount ) {
    if( !this.trees.length ) {
      return;
    }

    var i = 0,
      availableAmount,
      tree;

    // clamp to minimum amount we have
    availableAmount = Math.min( this.trees.length, amount );

    // loop over the amount of trees to remove
    for( ; i < availableAmount ; i++ ) {

      // get random tree and remove it from our array
      tree = _.sample( this.trees );
      tree = _.first(this.trees.splice( this.trees.indexOf( tree ), 1 ));

      // animate it out
      TweenMax.to(tree.position, 0.35 + (Math.random() * 0.35), {
        delay: Math.random() * 0.25,
        y: 500,
        ease: Back.easeIn,
        onCompleteParams:[tree],
        onComplete: function( obj ){

          // delete it from the scene
          this.scene.remove( obj );
        }.bind( this )
      });

    }
  },


  mousemove: function( event ) {
    this._mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this._mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  },


  // animate cycle
  animate: function() {
    requestAnimationFrame(
      this.animate.bind( this )
    );

    this.render();
  },


  // render cycle
  render: function() {
    /*
    this.camera.position.x += ((this._mouse.x * 200) - this.camera.position.x) * 0.025;
    this.camera.position.y = this.CAMERA_Y_OFFSET;

    if(this.terrain) {
      var terrainAxisVector = this.terrain.position.clone();
      terrainAxisVector.setZ(-775);
      this.camera.lookAt(terrainAxisVector);
    }
    */

    this.renderer.render(this.scene, this.camera);
  }
};