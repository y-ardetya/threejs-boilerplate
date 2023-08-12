import * as THREE from "three";
import * as YUKA from "yuka";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default class Sketch {
  constructor(options) {
    this.container = options.domElement;
    this.scene = new THREE.Scene();
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(this.width, this.height);
    this.container.appendChild(this.renderer.domElement);

    //* GLTF Loader
    this.loader = new GLTFLoader();

    //* Lights
    this.ambientLight = new THREE.AmbientLight(0xffffff, 1);
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    this.directionalLight.position.set(0, 0, 5);
    this.scene.add(this.ambientLight);
    this.scene.add(this.directionalLight);

    //* Camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.width / this.height,
      0.1,
      1000
    );
    this.camera.position.set(0, 10, 20);
    this.camera.lookAt(this.scene.position);

    //* Orbit Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    //* Times
    this.time = 0;
    this.clock = new THREE.Clock();

    //* Functions
    this.addObjects();
    this.setupResize();
    this.render();
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;

    this.camera.updateProjectionMatrix();
  }

  addObjects() {
    //* Yuka Initialization
    this.vehicle = new YUKA.Vehicle();

    //* Synchronize Yuka with model
    function sync(entity, renderComponent) {
      renderComponent.matrix.copy(entity.worldMatrix);
    }

    //* Yuka Path
    this.path = new YUKA.Path();
    this.path.add(new YUKA.Vector3(-6, 0, 4));
    this.path.add(new YUKA.Vector3(-12, 0, 0));
    this.path.add(new YUKA.Vector3(-6, 0, -12));
    this.path.add(new YUKA.Vector3(0, 0, 0));
    this.path.add(new YUKA.Vector3(8, 0, -8));
    this.path.add(new YUKA.Vector3(10, 0, 0));
    this.path.add(new YUKA.Vector3(4, 0, 4));
    this.path.add(new YUKA.Vector3(0, 0, 6));
    this.path.loop = true;
    this.vehicle.position.copy(this.path.current());

    //* Materialize YUka Path
    this.position = [];
    for (let i = 0; i < this.path._waypoints.length; i++) {
      this.waypoint = this.path._waypoints[i];
      this.position.push(this.waypoint.x, this.waypoint.y, this.waypoint.z);
    }
    this.lineGeometry = new THREE.BufferGeometry();
    this.lineGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(this.position, 3)
    );

    this.lineMaterial = new THREE.LineBasicMaterial({});
    this.line = new THREE.LineLoop(this.lineGeometry, this.lineMaterial);
    // this.scene.add(this.line);

    //* Yuka Follow Path Behavior
    this.followPathBehavior = new YUKA.FollowPathBehavior(this.path, 3);
    this.vehicle.steering.add(this.followPathBehavior);

    // this.onPathBehavior = new YUKA.OnPathBehavior(this.path);
    // this.vehicle.steering.add(this.onPathBehavior);

    this.vehicle.maxSpeed = 3;
    //* Yuka Seek Behavior
    this.entityManager = new YUKA.EntityManager();
    this.entityManager.add(this.vehicle);
    //* Yuka Clock
    this.clock = new YUKA.Time();

    //* Model Initialization
    this.loader.load("/assets/clown.glb", (gltf) => {
      this.model = gltf.scene;
      this.scene.add(this.model);
      this.model.matrixAutoUpdate = false;
      this.vehicle.scale = new YUKA.Vector3(0.02, 0.02, 0.02);
      this.vehicle.setRenderComponent(this.model, sync);

      this.animation = {};
      this.animation.mixer = new THREE.AnimationMixer(this.model);
      this.animation.action = this.animation.mixer.clipAction(
        gltf.animations[0]
      );
      this.animation.action.play();
      this.render();
    });
  }
  render() {
    this.time = this.clock.getDelta();
    //* Yuka Update
    this.delta = this.clock.update().getDelta();
    this.entityManager.update(this.delta);

    //* Play Animation
    this.animation.mixer.update(this.time);

    //* THREEJS Render
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.render.bind(this));
  }
}

new Sketch({
  domElement: document.getElementById("container"),
});
