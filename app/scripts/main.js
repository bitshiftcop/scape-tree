'use strict';

function SceneViewController()
{
  this._scene = null;
  this._camera = null;
  this._projector = null;
  this._raycaster = null;
  this._renderer = null;

  this._mouse = new THREE.Vector2();

  this._mouseX = 0;
  this._mouseY = 0;

  this._windowHalfX = 0;
  this._windowHalfY = 0;
  this.CAMERA_Y_OFFSET = 150;

  this.FOG_COLOR = 0x3a87b2;
  this._usedTreePositions = [];

  this._terrainObject = null;
  this._treeMaster = null;
  this._trees = [];
  this._initialLeftTrees = [];

  this.TREE_X_SPACE = 100;
  this.TREE_Z_SPACE = 100;
  this.TREES_PER_ROW = 15;

  this._randomLeftPositions = [118, 103, 104, 102, 87];

  this._init();
  //this._createGUI();
  this._animate();
}

SceneViewController.prototype.mousemove = function(event)
{
  this._mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  this._mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
};



SceneViewController.prototype.addRightObjects = function(amount)
{
  this._rightAmount = amount;
  this._updateCounters();

  for(var i = 0 ; i < amount ; i++) {
    this.addAdditionalRightObject(i);
  }
};



SceneViewController.prototype.addLeftObjects = function(amount)
{
  this._leftAmount = amount;
  this._updateCounters();

  for(var i = 0 ; i < amount ; i++)
  {
    var treePosition = -1;

    do
    {
      treePosition = parseInt(Math.random() * 100, 10);
    }
    while(include(this._usedTreePositions, treePosition) && this._usedTreePositions.length);

    var addedTree = this.addAdditionalLeftObject(treePosition);
    this._initialLeftTrees.push(addedTree);
  }
};



SceneViewController.prototype.addAdditionalLeftObjects = function(count)
{
  this._leftAmount += count;
  this._updateCounters();

  for(var i = 0 ; i < count ; i++)
  {
    var triedLeftAmount = 0;

    // Find next free slot
    var treePosition = this._randomLeftPositions[0];
    while(include(this._usedTreePositions, treePosition))
    {
      if(triedLeftAmount < this._randomLeftPositions.length)
      {
        treePosition = this._randomLeftPositions[triedLeftAmount];
        triedLeftAmount += 1;
      }
      else if(triedLeftAmount === this._randomLeftPositions.length + 1)
      {
        triedLeftAmount += 1;
        treePosition = 118;
      }
      else
      {
        treePosition -= 1;
      }
    }

    // Add object
    this.addAdditionalLeftObject(treePosition);
  }
};



SceneViewController.prototype.addAdditionalRightObject = function(position)
{
  // Offsets
  var zpos = -1500;
  var xpos = 1100;

  // Calculate row and column
  var row = Math.floor(position / this.TREES_PER_ROW);
  var col = (position % this.TREES_PER_ROW);

  // Create tree
  var tree = this._createTree();
  tree.position.x = xpos - (row * this.TREE_X_SPACE) + ((Math.random() * 40) - 20);
  tree.position.y = 500.0;
  tree.position.z = zpos + (col * this.TREE_Z_SPACE) + ((Math.random() * 40) - 20);

  // Animate in
  TweenMax.to(tree.position, 0.25 + (Math.random() * 0.25), {delay:Math.random() * 0.25, y:-80, ease:Sine.easeIn});

  // Add to graphs
  this._scene.add(tree);
  this._trees.push(tree);

  return tree;
};



SceneViewController.prototype._updateCounters = function()
{
  $('#right-number .tree-number').html(this._rightAmount);
  $('#left-number .tree-number').html(this._leftAmount);

  $('#greenback-right .greenback-title').html(this._rightAmount * 10);
  $('#greenback-left .greenback-title').html(this._leftAmount * 10);
};



SceneViewController.prototype.addAdditionalLeftObject = function(position)
{
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
  this._scene.add(tree);

  return tree;
};



SceneViewController.prototype.moveTree = function()
{
  var self = this;

  // Take a random tree
  var randomTree = this._initialLeftTrees[Math.round(Math.random() * (this._initialLeftTrees.length - 1))];
  TweenMax.to(randomTree.position, 0.75, {y:500, ease:Back.easeIn, onComplete:function(){
    self.addAdditionalRightObject(self._trees.length);
  }});

  this._leftAmount -= 1;
  this._rightAmount += 1;
  this._updateCounters();
};



SceneViewController.prototype._createTree = function()
{
  var clonedTree = this._treeMaster.clone();
  clonedTree.scale.x = clonedTree.scale.y = clonedTree.scale.z = 0.5 + (Math.random() / 2);
  clonedTree.rotation.y = Math.random();

  return clonedTree;
};



/**
 * Private methods.
 */

SceneViewController.prototype._init = function()
{
  var self = this;

  // Create camera
  this._camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
  this._camera.position.set(0, this.CAMERA_Y_OFFSET, 255);
  this._camera.rotation.set(-0.2, 0, 0);


  // Create scene
  this._scene = new THREE.Scene();
  this._scene.fog = new THREE.Fog(this.FOG_COLOR, 1, 10000);


  // Create lights
  var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
  hemiLight.color.setHSL( 0.6, 1, 0.6 );
  hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
  hemiLight.position.set( 0, 500, 0 );
  this._scene.add( hemiLight );

  var d = 1000;
  var dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
  dirLight.color.setHSL(0.1, 0.75, 0.7);
  dirLight.position.set(190, 190, 150);
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
  //dirLight.shadowCameraVisible = true;
  this._scene.add(dirLight);


  // Load objects
  var terrainLoader = new THREEx.UniversalLoader();
  var terrainUrls = ['obj/landscape/landscape_0001.obj', 'obj/landscape/landscape_0001.mtl'];
  terrainLoader.load(terrainUrls, function (terrainObject) {

    self._terrainObject = terrainObject;
    self._terrainObject.position.y = - 80;
    self._terrainObject.receiveShadow = true;
    self._terrainObject.traverse(function(child){
      child.receiveShadow = true;
    });
    self._scene.add(self._terrainObject);
  });

  var treeLoader = new THREEx.UniversalLoader();
  var treeUrls = ['obj/tree/tree_0001.obj', 'obj/tree/tree_0001.mtl'];
  treeLoader.load(treeUrls, function (treeObject) {

    self._treeMaster = treeObject;
    self._treeMaster.castShadow = true;
    self._treeMaster.traverse(function(child){
      child.castShadow = true;
    });
    console.log(self._treeMaster);
  });


  // Projector, raycaster & renderer
  this._projector = new THREE.Projector();
  this._raycaster = new THREE.Raycaster();

  this._renderer = new THREE.WebGLRenderer();
  this._renderer.setClearColor(this.FOG_COLOR, 1);
  this._renderer.setSize(window.innerWidth, window.innerHeight);
  this._renderer.shadowMapEnabled = true;

  document.getElementById('scene').appendChild(this._renderer.domElement);
};


SceneViewController.prototype._createGUI = function()
{
  var self = this;
    var gui = new dat.GUI();

    gui.add(this._camera.position, 'x', -500,500).step(5);
    gui.add(this._camera.position, 'y', -500,500).step(5);
    gui.add(this._camera.position, 'z', -2000,2000).step(5);
    gui.add(this._camera.rotation, 'x', -1,1);

    //gui.add(this._camera.position, 'z', -500,500).step(5);
    gui.add(this._camera, 'fov', 20,80).step(1).onChange(function(){ self._camera.updateProjectionMatrix();  });
};



SceneViewController.prototype._animate = function()
{
  var self = this;

  requestAnimationFrame(function(){
    self._animate();
  });

  this._render();
};



SceneViewController.prototype._render = function()
{
  this._camera.position.x += ((this._mouse.x * 200) - this._camera.position.x) * 0.025;
  this._camera.position.y = this.CAMERA_Y_OFFSET;// (((-this._mouse.y * 20) - this._camera.position.y) * .05);

  if(this._terrainObject)
  {
    var terrainAxisVector = this._terrainObject.position.clone();
    terrainAxisVector.setZ(-775);
    this._camera.lookAt(terrainAxisVector);
  }

  this._renderer.render(this._scene, this._camera);
};


function Application()
{
  this.sceneViewController = null;
  this._addListeners();
}

Application.prototype._addListeners = function()
{
  var self = this;

  // Listeners for document & window
  $(document).ready(function(){ self._domReadyHandler(); });
  $(window).resize(function(){ self._resizeHandler(); });
};


Application.prototype._domReadyHandler = function()
{
  var self = this;

  //this._initHelpers();
  this._initControllers();


  // Now that the dom is ready we can start listening to mouse movements
  $('body').mousemove(function(event){ self._mousemoveHandler(event); });
};


Application.prototype._initControllers = function()
{
  this.sceneViewController = new SceneViewController();

  // Callback nodig wanneer scene async is ingeladen, timeout = crap
  setTimeout(function(){
    this.sceneViewController.addRightObjects(140);
    this.sceneViewController.addLeftObjects(60);

    setTimeout(function() {
      setInterval(function() {
        this.sceneViewController.addAdditionalLeftObjects(Math.round(Math.random() * 5));
      }.bind(this), 2000);
    }.bind(this), 4000);
  }.bind(this), 2000);

};


Application.prototype._resizeHandler = function()
{
  if(this.sceneViewController) {
    this.sceneViewController.resize();
  }
};



Application.prototype._mousemoveHandler = function(event)
{
  if(this.sceneViewController) {
    this.sceneViewController.mousemove(event);
  }
};


// Create the application
var App = new Application();


function include(arr, obj)
{
    return (arr.indexOf(obj) != -1);
}