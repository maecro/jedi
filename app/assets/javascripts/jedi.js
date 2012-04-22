Jedi = function() {

  var camera, scene, renderer, me, layout, controls, nodes = [];
  var graph = new Graph();
  //var that=this;


  //this.height = height;
  //this.width = width;

  initScene();
  initControls();
  addNodes();
  //addEdges();
  createGraph();
  animate();

  /* Initialise a three.js, takes the canvas height and width as arguments. */
  function initScene() {

    renderer = new THREE.WebGLRenderer();
    camera = new THREE.PerspectiveCamera(45, 600 / 400, 0.1, 10000);
    scene = new THREE.Scene();
    scene.add(camera);

    camera.position.z = 300;
    renderer.setSize(600, 400);

    // attatch the canvas to the container
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

    graph.layout = new Layout.ForceDirected(graph, {width: 600, height: 400, iterations: 500, layout: "3d", positionUpdated: function(node) {
      node.data.sphere.position.x = Math.floor(Math.random() * (1200 + 1200 + 1) - 1200);
      node.data.sphere.position.y = Math.floor(Math.random() * (1200 + 1200 + 1) - 1200);
      node.data.sphere.position.z = Math.floor(Math.random() * (1200 + 1200 + 1) - 1200);

    }});
    graph.layout.init();

  }

  /* Adds the nodes to the the graph. */
  function addNodes() {

    // Add the users node
    FB.api('/me', function(response) {
      me = new Node(response.id);
      // randomly position the node
      me.position.x = Math.floor(Math.random() * (1200 + 1200 + 1) - 1200);
      me.position.y = Math.floor(Math.random() * (1200 + 1200 + 1) - 1200);
      me.position.z = Math.floor(Math.random() * (1200 + 1200 + 1) - 1200);
      me.data.title = response.name;
      if(graph.addNode(me)) {
        addThreeSphere(me);
        addThreeLight();
      }
    });

    // Iterate over all friends adding them as nodes as we go
    FB.api('/me/friends', function(response) {
      $.each(response.data, function(key, val) {
        var n = new Node(val.id);
        // randomly position the node
        n.position.x = Math.floor(Math.random() * (1200 + 1200 + 1) - 1200);
        n.position.y = Math.floor(Math.random() * (1200 + 1200 + 1) - 1200);
        n.position.z = Math.floor(Math.random() * (1200 + 1200 + 1) - 1200);
        n.data.title = val.name;
        if(graph.addNode(n)) {
          addThreeSphere(n);
          addThreeLight();
          nodes.push(n);
          addEdge(n);
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

  /* Function adds a sphere to the view */
  function addThreeSphere(node) {

	  var sphereMaterial = new THREE.MeshLambertMaterial({color: 0xCC0000});
	  var radius = 5, segments = 16, rings = 16;

    node.data.sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, rings), sphereMaterial);

    node.data.sphere.id = node.id;
    node.data.sphere.position.x = node.position.x;
    node.data.sphere.position.y = node.position.y;
    node.data.sphere.position.z = node.position.z;
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

    scene.add(line);

  }

  /* Adds a light to the view. */
  function addThreeLight() {

	  var pointLight = new THREE.PointLight( 0xFFFFFF );

	  pointLight.position.x = 10;
	  pointLight.position.y = 50;
	  pointLight.position.z = 130;

	  scene.add(pointLight);

  }

  /* Animates the view. */
  function animate() {

    requestAnimationFrame( animate );
    render();

  }

  /* Starts the rendering loop. */
  function render() {

    controls.update();
    renderer.render( scene, camera );

  }

}
