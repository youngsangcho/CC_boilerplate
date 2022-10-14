// Global imports -
import * as THREE from "three";
import Config from "../data/config";
import Global from "./global.js";
import Main from "./main.js";

import Stats from "./jsm/libs/stats.module.js";
import { GUI } from "./jsm/libs/lil-gui.module.min.js";

import { OrbitControls } from "./jsm/controls/OrbitControls.js";
import { EffectComposer } from "./jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "./jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "./jsm/postprocessing/UnrealBloomPass.js";
import { AfterimagePass } from "./jsm/postprocessing/AfterimagePass.js";

import Texture from "./model/texture";

export default class MainThree {
  constructor(container) {
    // Set container property to container element
    this.container = container;

    this.stats = new Stats();
    this.container.appendChild(this.stats.dom);

    this.clock = new THREE.Clock();
    Global.clock = this.clock;

    Global.windowWidth = window.innerWidth;
    Global.windowHeight = window.innerHeight;

    // Get Device Pixel Ratio first for retina
    if (window.devicePixelRatio) {
      Config.dpr = window.devicePixelRatio;
    }

    this.renderer = new THREE.WebGLRenderer({
      // antialias: true,
      // precision: "highp",
      // powerPreference: "high-performance",
    });
    console.log("webgl2", this.renderer.capabilities.isWebGL2);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    this.container.appendChild(this.renderer.domElement);

    const scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      1,
      10000
    );
    this.camera.position.set(0, 0, 100);
    scene.add(this.camera);
    Global.camera = this.camera;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // this.controls.maxPolarAngle = Math.PI * 0.5;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 100;
    this.controls.enablePan = false;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.2;
    Global.orbitControl = this.controls;

    scene.add(new THREE.AmbientLight(0x606060));

    const pointLight = new THREE.PointLight(0xffffff, 1);
    this.camera.add(pointLight);

    const renderScene = new RenderPass(scene, this.camera);

    const params = {
      exposure: 1.0,
      bloomStrength: 0.8,
      bloomThreshold: 0,
      bloomRadius: 0.3,
    };

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight), //resolution
      1.0, //strength
      0.25, //radius
      0.85 //threshold
    );
    this.renderer.toneMappingExposure = Math.pow(params.exposure, 4.0);
    this.bloomPass.threshold = params.bloomThreshold;
    this.bloomPass.strength = params.bloomStrength;
    this.bloomPass.radius = params.bloomRadius;

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(renderScene);
    // this.composer.addPass(this.bloomPass);
    this.composer.addPass(this.bloomPass);
    //const bPass = new BloomPass(30, 100);
    // const bPass = new AfterimagePass(0.97);
    // this.composer.addPass(bPass);
    

    this.main;

    this.texture = new Texture();
    this.texture.load().then(() => {
      Global.textures = this.texture.textures;
      
      this.main = new Main(scene);

      Config.isLoaded = true;
      this.container.querySelector("#loading").style.display = "none";

      this.animate();
    });

    var _this = this;
    window.addEventListener("mousemove", (e) => {
      _this.mouseMoved(e);
    });
    window.addEventListener("mousedown", (e) => {
      _this.mouseClicked(e);
    });
    window.addEventListener("mouseup", (e) => {
      _this.mouseReleased(e);
    });
    window.addEventListener("resize", (e) => {
      _this.windowResized(e);
    });
  }

  animate() {
    // Render rStats if Dev
    if (Config.isDev && Config.isShowingStats) {
      // Stats.start();
    }

    // this.renderer.render(this.scene, this.camera);
    this.main.render(this.camera, this.renderer);

    // rStats has finished determining render call now
    if (Config.isDev && Config.isShowingStats) {
      // Stats.end();
    }
    this.stats.update();

    this.controls.update();
    this.composer.render();

    // RAF
    requestAnimationFrame(this.animate.bind(this)); // Bind the main class instead of window object
  }

  /////////////////////
  // EVENTS
  mouseMoved(event) {
    var mouseX = event.clientX - window.innerWidth / 2;
    var mouseY = -(event.clientY - window.innerHeight / 2);
    if (this.main) this.main.onMouseMove(mouseX, mouseY);

    Global.mouseX = mouseX;
    Global.mouseY = mouseY;

    // this.bloomPass.strength = event.clientX / window.innerWidth * 2.5; 
    // this.bloomPass.radius = event.clientX / window.innerWidth * 0.5 + 0.5;
  }

  mouseClicked(event) {
    var mouseX = event.clientX - window.innerWidth / 2;
    var mouseY = -(event.clientY - window.innerHeight / 2);
    this.main.onMouseClick(mouseX, mouseY);
  }

  mouseReleased(event) {
    var mouseX = event.clientX - window.innerWidth / 2;
    var mouseY = -(event.clientY - window.innerHeight / 2);
    this.main.onMouseRelease(mouseX, mouseY);
  }

  windowResized() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    Global.windowWidth = width;
    Global.windowHeight = height;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);

    this.main.onWindowResize(width, height);
  }
}
