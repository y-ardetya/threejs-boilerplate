import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";

import texture from "/test.jpg";

export default class Sketch {
  constructor(options) {
    this.container = options.domElement;
    this.scene = new THREE.Scene();

    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;

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
    this.size = 32;
    this.number = this.size * this.size;
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

    //* Data Texture
    const data = new Float32Array(4 * this.number);

    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const index = i * this.size + j;
        data[4 * index + 0] = Math.random() * 2 - 1;
        data[4 * index + 1] = Math.random() * 2 - 1;
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

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        // uTexture: { value: new THREE.TextureLoader().load(texture) },
        uTexture: { value: this.positions },
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

    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.render.bind(this));
  }
}

new Sketch({
  domElement: document.getElementById("container"),
});
