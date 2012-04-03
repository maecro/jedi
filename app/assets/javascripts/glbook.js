var nodes;

function webGLStart() {

  nodes = getNodes();

  //Create application
  PhiloGL('canvas', {
    camera: {
      position: {
        x: 0, y: 0, z: -20
      }
    },
    onError: function() {
      alert("There was an error creating the app.");
    },
    onLoad: function(app) {
      //Unpack app properties
      var gl = app.gl,
          program = app.program,
          scene = app.scene,
          canvas = app.canvas,
          camera = app.camera;

      //Basic gl setup
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clearDepth(1.0);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.viewport(0, 0, +canvas.width, +canvas.height);
      //Add object to the scene
      var xval, yval, zval;
      xval = yval = zval = 0

      console.log(nodes)

      $.each(nodes, function(index, value) {
        value.position = {
          x: xval += 1,
          y: yval,
          z: zval
        };
        value.update();
        scene.add(value);
      });

      //Animate
      draw();

      //Draw the scene
      function draw() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        //render moon
        scene.render();
        //request new frame
        PhiloGL.Fx.requestAnimationFrame(draw);
      }
    }
  });
}
