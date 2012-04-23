Jedi = function() {

  var camera, scene, renderer, me, layout, controls;
  var graph = new Graph();
  var that=this;
  var geometries = [];
  var info_text = {};

  this.height = 600;
  this.width =  $('#container').width();
  this.aspect = that.width / that.height;
  this.domain = 600;

  initScene();
  addThreeLight();
  initControls();
  addNodes();
  createGraph();
  animate();

  /* Initialise a three.js, takes the canvas height and width as arguments. */
  function initScene() {

    renderer = new THREE.WebGLRenderer();
    camera = new THREE.PerspectiveCamera(45, that.aspect, 1, 10000);
    scene = new THREE.Scene();

    camera.position.set(0, 0, 1000);
    scene.add(camera);
    scene.fog = new THREE.Fog( 0xffffff, 1, 1000 );
    renderer.setSize(that.width, that.height);

    $('#container').append(renderer.domElement);

  }

  function initControls() {
				controls = new THREE.TrackballControls( camera, renderer.domElement );

				controls.rotateSpeed = 1.0;
				controls.zoomSpeed = 1.2;
				controls.panSpeed = 0.2;

				controls.noZoom = false;
				controls.noPan = false;

				controls.staticMoving = false;
				controls.dynamicDampingFactor = 0.3;

				controls.keys = [ 65, 83, 68 ]; // [ rotateKey, zoomKey, panKey ]
  }

  /* Generates a force directed graph. */
  function createGraph() {

    graph.layout = new Layout.ForceDirected(graph, {width: that.width, height: that.height, iterations: 5000, layout: "3d"});
    graph.layout.init();

  }

  /* Adds the nodes to the the graph. */
  function addNodes() {

    // Add the users node
    FB.api('/me', function(response) {
      me = new Node(response.id);
      // randomly position the node
      me.position.x = Math.floor(Math.random() * that.domain);
      me.position.y = Math.floor(Math.random() * that.domain);
      me.position.z = Math.floor(Math.random() * that.domain);
      me.data.title = response.name;

      /*FB.api('/me/picture', function(response) {
        me.data.image = response;
      });*/

      if(graph.addNode(me)) {
        addThreeSphere(me);
      }
    });

    // Iterate over all friends adding them as nodes as we go
    FB.api('/me/friends', function(response) {
      $.each(response.data, function(key, val) {
        var n = new Node(val.id);
        // randomly position the node
        n.position.x = Math.floor(Math.random() * that.domain);
        n.position.y = Math.floor(Math.random() * that.domain);
        n.position.z = Math.floor(Math.random() * that.domain);
        n.data.title = val.name;

        /*FB.api('/'+val.id+'/picture', function(response) {
          n.data.image = response;
        });*/

        if(graph.addNode(n)) {
          addThreeSphere(n);
          addEdge(n);
          connectMutual(n);
        }
      });
    });

  }

  /* Adds the edges to the graph. */
  function addEdge(node) {

    //$.each(nodes, function(key, val) {
      if(graph.addEdge(me, node)) {
        addThreeLine(me, node);
      }
   // });

  }

  /* Connect each common friend. */
  function connectMutual(from_node) {
    FB.api('/me/mutualfriends/'+from_node.id, function(response) {
      $.each(response.data, function(key, val) {
        to_node = graph.getNode(val.id);
        if(graph.addEdge(from_node, to_node)) {
              addThreeLine(from_node, to_node);
        }
      });
    });
  }

  /* Function adds a sphere to the view */
  function addThreeSphere(node) {

    /*var texture = THREE.ImageUtils.loadTexture(node.data.image);
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.repeat.set(125, 125);
    texture.offset.set(15, 15);
    texture.needsUpdate = true;*/

	  var sphereMaterial = new THREE.MeshLambertMaterial({color: 0xff0000});
	  var radius = 5, segments = 16, rings = 16;

    node.data.sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, rings), sphereMaterial);

    node.data.sphere.id = node.id;
    node.data.sphere.position.x = node.position.x;
    node.data.sphere.position.y = node.position.y;
    node.data.sphere.position.z = node.position.z;
    // changes to the vertices
    node.data.sphere.geometry.__dirtyVertices = true;

    // changes to the normals
    node.data.sphere.geometry.__dirtyNormals = true;

	  scene.add(node.data.sphere);

  }

  /* Adds a line to the view. */
  function addThreeLine(from, to) {

    material = new THREE.LineBasicMaterial( { color: 0xff0000, opacity: 1, linewidth: 0.5 } );

    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vertex(from.data.sphere.position));
    geometry.vertices.push(new THREE.Vertex(to.data.sphere.position));

    line = new THREE.Line( geometry, material, THREE.LinePieces );
    line.scale.x = line.scale.y = line.scale.z = 1;
    line.originalScale = 1;

    geometries.push(geometry);

    scene.add(line);

  }

  /* Adds a light to the view. */
  function addThreeLight() {

    // add subtle ambient lighting
    //var ambientLight = new THREE.AmbientLight(0x555555);
    //scene.add(ambientLight);

    // add directional light source
    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

  }

  /* Animates the view. */
  function animate() {

    requestAnimationFrame( animate );
    render();

  }

  /* Starts the rendering loop. */
  function render() {

    // Generate layout if not finished
    if(!graph.layout.finished) {
      $("#notice").html("Calculating Layout...");
      graph.layout.generate();
    } else {
      $("#notice").html("");
    }

    // Update position of lines (edges)
    for(var i=0; i< geometries.length; i++) {
      geometries[i].__dirtyVertices = true;
    }

    controls.update();
    renderer.render( scene, camera );

  }

}
