import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import simVertex from "./shaders/simVertex.glsl";
import simFragment from "./shaders/simFragment.glsl";

import texture from "/surtur.jpg";

const lerp = (a, b, n) => (1 - n) * a + n * b;

export default class Sketch {
  constructor(options) {
    this.container = options.dom;
    this.scene = new THREE.Scene();

    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;

    //* setup raycaster
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(this.width, this.height);
    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      this.width / this.height,
      0.01,
      10
    );
    this.camera.position.z = 1;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.time = 0;

    this.mouseEvents();
    this.setupFBO();
    this.addObjects();
    this.setupResize();
    this.render();
  }

  mouseEvents() {
    this.planeMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshBasicMaterial()
    );

    this.dummy = new THREE.Mesh(
      new THREE.SphereGeometry(0.01, 32, 32),
      new THREE.MeshNormalMaterial()
    );
    this.scene.add(this.dummy);

    window.addEventListener("mousemove", (e) => {
      this.pointer.x = (e.clientX / this.width) * 2 - 1;
      this.pointer.y = -(e.clientY / this.height) * 2 + 1;
      this.raycaster.setFromCamera(this.pointer, this.camera);

      const intersects = this.raycaster.intersectObjects([this.planeMesh]);

      if (intersects.length > 0) {
        this.dummy.position.copy(intersects[0].point);
        this.simMaterial.uniforms.uMouse.value = intersects[0].point;
      }
    });
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

  setupFBO() {
    this.size = 128;
    this.number = this.size * this.size;

    //* Data Texture
    const data = new Float32Array(4 * this.number);

    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const index = i * this.size + j;
        data[4 * index + 0] = lerp(-0.5, 0.5, j / (this.size - 1));
        data[4 * index + 1] = lerp(-0.5, 0.5, i / (this.size - 1));
        data[4 * index + 2] = 0;
        data[4 * index + 3] = 1;
      }
    }
    this.positions = new THREE.DataTexture(
      data,
      this.size,
      this.size,
      THREE.RGBAFormat,
      THREE.FloatType
    );

    this.positions.needsUpdate = true;

    //* FBO scene
    this.sceneFBO = new THREE.Scene();
    this.cameraFBO = new THREE.OrthographicCamera(-1, 1, 1, -1, -2, 2);
    this.cameraFBO.position.z = 1;
    this.cameraFBO.lookAt(new THREE.Vector3(0, 0, 0));

    let geometryFBO = new THREE.PlaneGeometry(2, 2, 2, 2);
    this.simMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      wireframe: true,
    });
    this.simMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        uCurrentPosition: { value: this.positions },
        uOriginPosition: { value: this.positions },
        uMouse: { value: new THREE.Vector3(0, 0, 0) },
      },
      vertexShader: simVertex,
      fragmentShader: simFragment,
    });
    this.simMesh = new THREE.Mesh(geometryFBO, this.simMaterial);
    this.sceneFBO.add(this.simMesh);

    //* Render Target
    this.renderTarget = new THREE.WebGLRenderTarget(this.size, this.size, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
    });

    this.renderTarget1 = new THREE.WebGLRenderTarget(this.size, this.size, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
    });
  }

  addObjects() {
    this.geometry = new THREE.BufferGeometry();

    //* buffer geometry need to be populated by attributes and Uvs
    const positions = new Float32Array(this.number * 3);
    const uvs = new Float32Array(this.number * 2);

    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const index = i * this.size + j;
        positions[3 * index + 0] = j / this.size - 0.5;
        positions[3 * index + 1] = i / this.size - 0.5;
        positions[3 * index + 2] = 0;

        uvs[2 * index + 0] = j / (this.size - 1);
        uvs[2 * index + 1] = i / this.size;
      }
    }
    this.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    this.geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));

    this.material = new THREE.MeshNormalMaterial();

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        // uTexture: { value: new THREE.TextureLoader().load(texture) },
        uTexture: { value: this.positions },
        uTest : { value: new THREE.TextureLoader().load(texture) },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });

    this.mesh = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.mesh);
  }
  render() {
    this.time += 0.05;

    this.material.uniforms.time.value = this.time;

    //! The render order is important

    //* Render Target
    this.renderer.setRenderTarget(this.renderTarget);

    //* FBO scene
    this.renderer.render(this.sceneFBO, this.cameraFBO);

    //* Output
    this.renderer.setRenderTarget(null);

    //* main scene
    this.renderer.render(this.scene, this.camera);

    //* Swap
    let temp = this.renderTarget;
    this.renderTarget = this.renderTarget1;
    this.renderTarget1 = temp;

    this.material.uniforms.uTexture.value = this.renderTarget.texture;
    this.simMaterial.uniforms.uCurrentPosition.value =
      this.renderTarget1.texture;

    window.requestAnimationFrame(this.render.bind(this));
  }
}

new Sketch({
  dom: document.querySelector("#container"),
});
