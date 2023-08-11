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

    this.loader = new GLTFLoader();

    this.light = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(this.light);

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    this.directionalLight.position.set(0, 0, 1);
    this.scene.add(this.directionalLight);

    this.camera = new THREE.PerspectiveCamera(
      45,
      this.width / this.height,
      0.1,
      1000
    );
    this.camera.position.set(0, 20, 0);
    this.camera.lookAt(this.scene.position);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.time = 0;

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
    // //* Geometry
    // this.geometry = new THREE.ConeGeometry(0.2, 1, 8);
    // this.geometry.rotateX(Math.PI / 2);
    // //* Material
    // this.material = new THREE.MeshNormalMaterial();
    // //* Mesh
    // this.mesh = new THREE.Mesh(this.geometry, this.material);
    // //! Turning off mesh matrix auto update for Yuka
    // this.mesh.matrixAutoUpdate = false;
    // this.scene.add(this.mesh);

    //* Yuka Initialization
    this.vehicle = new YUKA.Vehicle();
    // this.vehicle.setRenderComponent(this.mesh, sync);

    function sync(entity, renderComponent) {
      renderComponent.matrix.copy(entity.worldMatrix);
    }

    //* Yuka Path
    this.path = new YUKA.Path();
    this.path.add(new YUKA.Vector3(-4, 0, 4));
    this.path.add(new YUKA.Vector3(-6, 0, 0));
    this.path.add(new YUKA.Vector3(-4, 0, -4));
    this.path.add(new YUKA.Vector3(0, 0, 0));
    this.path.add(new YUKA.Vector3(4, 0, -4));
    this.path.add(new YUKA.Vector3(6, 0, 0));
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
    // this.mesh.position.copy(this.path.current());
    this.followPathBehavior = new YUKA.FollowPathBehavior(this.path, 0.5);
    this.vehicle.steering.add(this.followPathBehavior);

    this.onPathBehavior = new YUKA.OnPathBehavior(this.path);
    this.vehicle.steering.add(this.onPathBehavior);

    this.vehicle.maxSpeed = 3;
    //* Yuka Seek Behavior
    this.entityManager = new YUKA.EntityManager();
    this.entityManager.add(this.vehicle);
    //* Yuka Clock
    this.clock = new YUKA.Time();

    this.loader.load("/assets/Fish.glb", (gltf) => {
      this.model = gltf.scene;
      // gltf.scene.scale.set(0.2, 0.2, 0.2);
      this.scene.add(this.model);
      this.model.matrixAutoUpdate = false;
      this.vehicle.scale = new YUKA.Vector3(0.2, 0.2, 0.2);
      this.vehicle.setRenderComponent(this.model, sync);
    });
  }
  render() {
    //* Yuka Update
    this.delta = this.clock.update().getDelta();
    this.entityManager.update(this.delta);

    //* THREEJS Render
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.render.bind(this));
  }
}

new Sketch({
  domElement: document.getElementById("container"),
});
