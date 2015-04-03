'use strict';

function Scene() {
  this.CAMERA_Y_OFFSET = 250;
  this.FOG_COLOR = 0x3a87b2;
  this.TREE_X_SPACE = 100;
  this.TREE_Z_SPACE = 100;
  this.TREES_PER_ROW = 15;

  this.scene = null;
  this.camera = null;
  this.renderer = null;

  this._mouse = new THREE.Vector2();
  this._mouseX = 0;
  this._mouseY = 0;


  this._usedTreePositions = [];

  this.terrain = null;
  this.tree = null;
  this.trees = [];
  this._initialLeftTrees = [];

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

  this.dropZones = [
    rightDropZone,
    leftDropZone
  ];



  this._randomLeftPositions = [118, 103, 104, 102, 87];

  this.initScene();
  this.animate();
}


Scene.prototype = {
  initScene: function() {
    var d = 1000,
      hemiLight,
      dirLight,
      terrainUrls = ['obj/landscape/landscape_0001.obj', 'obj/landscape/landscape_0001.mtl'],
      treeUrls = ['obj/tree/tree_0001.obj', 'obj/tree/tree_0001.mtl'],
      terrainLoader,
      treeLoader,
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


    // load tree
    treeLoader = new THREEx.UniversalLoader();
    treeLoader.load(treeUrls, function ( obj ) {

      // set object to cast shadow
      this.tree = obj;
      this.tree.traverse(function( child ){
        child.castShadow = true;
      });

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
      tree = this._createTree();
      tree.position.set(treeCenter.x, 500, treeCenter.y);

      // animate in
      TweenMax.to(tree.position, 0.25 + (Math.random() * 0.25), {
        delay:Math.random() * 0.25,
        y:-80,
        ease:Sine.easeIn
      });

      this.scene.add( tree );
    }


  },

  mousemove: function( event ) {
    this._mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this._mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  },

  addRightObjects: function( amount ) {
    for(var i = 0 ; i < amount ; i++) {
      this.addAdditionalRightObject(i);
    }
  },

  addLeftObjects: function( amount ) {
    for(var i = 0 ; i < amount ; i++) {
      var treePosition = -1;

      do {
        treePosition = parseInt(Math.random() * 100, 10);
      }
      while(this._usedTreePositions.indexOf(treePosition) !== -1 && this._usedTreePositions.length);

      var addedTree = this.addAdditionalLeftObject(treePosition);
      this._initialLeftTrees.push(addedTree);
    }
  },

  addAdditionalLeftObjects: function( count ) {
    for(var i = 0 ; i < count ; i++) {
      var triedLeftAmount = 0;

      // Find next free slot
      var treePosition = this._randomLeftPositions[0];
      while(this._usedTreePositions.indexOf(treePosition) !== -1) {
        if(triedLeftAmount < this._randomLeftPositions.length) {
          treePosition = this._randomLeftPositions[triedLeftAmount];
          triedLeftAmount += 1;
        } else if(triedLeftAmount === this._randomLeftPositions.length + 1) {
          triedLeftAmount += 1;
          treePosition = 118;
        } else {
          treePosition -= 1;
        }
      }

      // Add object
      this.addAdditionalLeftObject(treePosition);
    }
  },

  addAdditionalRightObject: function( position ) {

    var zpos = -1500,
      xpos = 1100,
      row,
      col,
      tree;

    // calculate row and column
    row = Math.floor(position / this.TREES_PER_ROW);
    col = (position % this.TREES_PER_ROW);

    // create tree
    tree = this._createTree();
    tree.position.x = xpos - (row * this.TREE_X_SPACE) + ((Math.random() * 40) - 20);
    tree.position.y = 500.0;
    tree.position.z = zpos + (col * this.TREE_Z_SPACE) + ((Math.random() * 40) - 20);

    // animate in
    TweenMax.to(tree.position, 0.25 + (Math.random() * 0.25), {
      delay:Math.random() * 0.25,
      y:-80,
      ease:Sine.easeIn
    });

    // add to scene
    this.scene.add(tree);
    this.trees.push(tree);

    return tree;
  },

  addAdditionalLeftObject: function( position ) {
    // Push new position in array
    this._usedTreePositions.push(position);

    // Offsets
    var zpos = -1500;
    var xpos = -800;

    // Calculate row and column
    var row = Math.floor(position / this.TREES_PER_ROW);
    var col = (position % this.TREES_PER_ROW);

    // Make tree at that col/row
    var tree = this._createTree();
    tree.position.x = xpos + (row * this.TREE_X_SPACE) + ((Math.random() * 40) - 20);
    tree.position.y = 500.0;
    tree.position.z = zpos + (col * this.TREE_Z_SPACE) + ((Math.random() * 40) - 20);

    // Animate in
    TweenMax.to(tree.position, 0.25 + (Math.random() * 0.25), {delay:Math.random() * 0.25, y:-80, ease:Sine.easeIn});

    // Add to graphs
    this.scene.add(tree);

    return tree;
  },

  moveTree: function() {
    var randomTree = this._initialLeftTrees[Math.round(Math.random() * (this._initialLeftTrees.length - 1))];
    TweenMax.to(randomTree.position, 0.75, {y:500, ease:Back.easeIn, onComplete:function(){
      this.addAdditionalRightObject(this.trees.length);
    }.bind( this ) });
  },

  _createTree: function() {
    var clonedTree = this.tree.clone();
    clonedTree.scale.x = clonedTree.scale.y = clonedTree.scale.z = 0.5 + ( Math.random() / 2 );
    clonedTree.rotation.y = Math.random();

    return clonedTree;
  },

  animate: function() {
    requestAnimationFrame(this.animate.bind(this));

    this.render();
  },

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