Jedi = function() {

  var camera, scene, renderer, me, layout, controls;
  var graph = new Graph();
  var that=this;
  var geometries = [];

  this.height = $('#container').height();
  this.width =  $('#container').width();
  this.aspect = that.width / that.height;
  this.domain = (1000 + 1000 + 1) - 1000;

  $.storage = new $.store();

  initScene();
  initControls();
  addThreeLight();
  createGraph();
  animate();

  /* Initialise a three.js, takes the canvas height and width as arguments. */
  function initScene() {

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(that.width, that.height);

    camera = new THREE.PerspectiveCamera(45, that.aspect, 1, 10000);
    camera.position.set(0, 0, 1000);

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xffffff, 5, 2000);
    scene.add(camera);

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

	  controls.keys = [ 65, 83, 68 ];
  }

  /* Generates a force directed graph. */
  function createGraph() {

    graph.layout = new Layout.ForceDirected(graph, {width: 1000, height: 1000, iterations: 5000, layout: "3d"});
    graph.layout.init();

    // Add the users node
    FB.api('/me', function(response) {
      me = new Node(response.id);

      me.data.color = '0x'+Math.floor(Math.random()*16777215).toString(16);

      FB.api('/me/picture', function(image) {
        $.storage.set(me.id, image);
      });

      if(graph.addNode(me)) {
        addThreeSphere(me);
        graph.layout.init();
      }
    });

    // Iterate over all friends adding them as nodes as we go
    FB.api('/me/friends', function(response) {
      $.each(response.data, function(key, val) {
        var n = new Node(val.id);

        n.data.color = '0x'+Math.floor(Math.random()*16777215).toString(16);

        FB.api('/'+val.id+'/picture', function(image) {
          $.storage.set(n.id, image);
        });

        if(graph.addNode(n)) {
          addThreeSphere(n);
          graph.layout.init();
          addEdge(me, n);
          connectMutual(n);
        }
      });
    });

  }

  /* Adds the edges to the graph. */
  function addEdge(from, to) {

    if(graph.addEdge(from, to)) {
      addThreeLine(from, to);
    }

  }

  /* Connect each common friend. */
  function connectMutual(from_node) {
    FB.api('/me/mutualfriends/'+from_node.id, function(response) {
      $.each(response.data, function(key, val) {
        to_node = graph.getNode(val.id);
        addEdge(from_node, to_node);
      });
    });
  }

  /* Function adds a sphere to the view */
  function addThreeSphere(node) {

    geometry = new THREE.CubeGeometry(10, 10, 10);
    texture = new THREE.ImageUtils.loadTexture($.storage.get(node.id));
    material = new THREE.MeshLambertMaterial({map: texture});
    node.data.mesh = new THREE.Mesh(geometry, material);

    setRandomPosition(node);

    node.position = node.data.mesh.position;

    scene.add(node.data.mesh);

  }

  function setRandomPosition(node) {

    node.data.mesh.position.x = Math.floor(Math.random() * that.domain);
    node.data.mesh.position.y = Math.floor(Math.random() * that.domain);
    node.data.mesh.position.z = Math.floor(Math.random() * that.domain);

  }

  /* Adds a line to the view. */
  function addThreeLine(from, to) {

    material = new THREE.LineBasicMaterial({color: from.data.color, opacity: 1, linewidth: 1});
    geometry = new THREE.Geometry();

    geometry.vertices.push(new THREE.Vertex(from.data.mesh.position));
    geometry.vertices.push(new THREE.Vertex(to.data.mesh.position));

    line = new THREE.Line(geometry, material, THREE.LinePieces);

    geometries.push(geometry);

    scene.add(line);

  }

  /* Adds a light to the view. */
  function addThreeLight() {

    directionalLight = new THREE.DirectionalLight(0xffffff);
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
