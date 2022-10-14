import * as THREE from "three";
import Global from "./global.js";
import { Howl, Howler } from "howler";
import DataManager from "./dataManager.js";
import { VShaderMaterial } from "../utils/vUtils_loader.js";

export default class Main {
  constructor(_scene) {
    this.scene = _scene;
    this.scene.background = new THREE.Color(0xfffffff);
    this.scene.background = new THREE.Color(0x000000);

    this.mouseClicked = false;
    this.pmouseX = 0;
    this.pmouseY = 0;

    this.parentTransform = new THREE.Object3D();
    this.scene.add(this.parentTransform);

    this.thetaX = 0;
    this.thetaY = 100;
    this.thetaXspeed = Math.random() * 0.0002;
    if (Math.random() > 0.5) this.thetaXspeed = this.thetaXspeed + 0.0001;
    else this.thetaXspeed = -this.thetaXspeed - 0.0001;
    this.thetaYspeed = Math.random() * 0.0002;
    if (Math.random() > 0.5) this.thetaYspeed = this.thetaYspeed + 0.0001;
    else this.thetaYspeed = -this.thetaYspeed - 0.0001;
    this.radius = 100;
    // lineMesh = new LineMesh();
    // scene.add(lineMesh);

    let dataManager = new DataManager();
    Global.dataManager = dataManager;

    let mat_basic = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    });

    const dataTex_w = 512;
    const dataTex_h = 512;
    // this.array_points = new Uint8Array(dataTex_w * dataTex_h * 4); // <--!!!
    this.array_points = new Float32Array(dataTex_w * dataTex_h * 4); // <--!!!
    this.dataTex_points = null;

    dataManager.loadAllData().then(() => {});

    const geometry = new THREE.PlaneGeometry(10, 10);
    const plane = new THREE.Mesh(geometry, mat_basic);
    this.scene.add(plane);

    // this.sound = new Howl({
    //   src: ["./assets/sounds/Bonus-3_js.mp3"],
    // });
  }

  render(camera, renderer) {
    // this.thetaX += this.thetaXspeed;
    // this.thetaY += this.thetaYspeed;
    // this.parentTransform.rotation.set(this.thetaX, this.thetaY, 0);

    renderer.setRenderTarget(null);
    renderer.clear();
    renderer.render(this.scene, camera);
  }

  onMouseMove(x, y) {
    // let mx = x - this.pmouseX;
    // let my = y - this.pmouseY;
    // if (this.mouseClicked == true) {
    //   this.thetaX += mx * 0.01;
    //   // console.log(this.thetaX);
    //   this.thetaY += my * 0.01;
    // }
    // this.pmouseX = x;
    // this.pmouseY = y;
  }

  onMouseClick(x, y) {
    this.pmouseX = x;
    this.pmouseY = y;
    this.mouseClicked = true;
  }

  onMouseRelease(x, y) {
    this.mouseClicked = false;
  }

  onWindowResize(w, h) {}
}
