import * as THREE from "three";
import Global from "./global.js";

class DashedLine extends THREE.Object3D {
  constructor(_points, _width, _dashSize, _gapSize) {
    super();

    this.points = _points;
    
    this.width = _width;
    this.dashSize = _dashSize;
    this.gapSize = _gapSize;

    this.totalLength = 0;
    for (let i = 1; i < _points.length; i++) {
      let P0 = _points[i - 1];
      let P1 = _points[i];
      this.totalLength += P1.distanceTo(P0);
    }

    this.numDashes = parseInt(this.totalLength / this.dashSize);
    this.numPointsPerDash = 3; //parseInt(this.MAX_POINTS / this.numDashes);
    this.MAX_POINTS = this.numPointsPerDash * this.numDashes;

    this.geometry = new THREE.BufferGeometry();

    const vertices = new Float32Array(this.MAX_POINTS * 3 * 6);
    this.geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );

    const colors = new Float32Array(this.MAX_POINTS * 4 * 6);
    this.geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(colors, 4)
    );

    this.material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      // transparent: true,
      vertexColors: true,
      // vertexAlphas: true,
      side: THREE.DoubleSide,
      // wireframe: true,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.add(this.mesh);

    this.positions = this.mesh.geometry.attributes.position.array;
    this.colors = this.mesh.geometry.attributes.color.array;

    this.updatePositions();
    this.updateColors();
  }

  update() {
    // this.updatePositions();
    this.updateColors();
  }

  setPosition(idx, x, y, z) {
    this.positions[idx * 3 + 0] = x;
    this.positions[idx * 3 + 1] = y;
    this.positions[idx * 3 + 2] = z;
  }

  setColor(idx, c) {
    this.colors[idx * 4 + 0] = c;
    this.colors[idx * 4 + 1] = c;
    this.colors[idx * 4 + 2] = c;
    this.colors[idx * 4 + 3] = c;
  }

  updatePositions() {
    let len = 0;
    let p0x = 0;
    let p0y = 0;
    let p0z = 0;
    let p1x = 0;
    let p1y = 0;
    let p1z = 0;

    let idx = 0;

    for (let n = 0; n < this.numDashes; n++) {
      for (let i = 0; i < this.numPointsPerDash; i++) {
        let pct = (len / this.totalLength) * this.points.length;
        let pidx = Math.floor(pct);
        if (pidx > this.points.length - 1) pidx = this.points.length - 1;
        let refP0 = this.points[pidx];
        let dist = 0;
        let dir;

        if (pidx == this.points.length - 1) {
          dir = refP0
            .clone()
            .sub(this.points[pidx - 1])
            .normalize();
        } else {
          let refP1 = this.points[pidx + 1];
          dist = refP1.distanceTo(refP0);
          dir = refP1.clone().sub(refP0).normalize();
        }

        let refP = refP0
          .clone()
          .add(dir.clone().multiplyScalar(dist * (pct - pidx)));

        let weight = this.width / 2;

        let PL = refP
          .clone()
          .add(new THREE.Vector3(-dir.y, dir.x, 0).multiplyScalar(weight));
        let PR = refP
          .clone()
          .add(new THREE.Vector3(dir.y, -dir.x, 0).multiplyScalar(weight));

        if (i > 0) {
          this.setPosition((idx - 1) * 6 + 2, PL.x, PL.y, PL.z);
          this.setPosition((idx - 1) * 6 + 4, PR.x, PR.y, PR.z);
          this.setPosition((idx - 1) * 6 + 5, PL.x, PL.y, PL.z);
        }
        if (i < this.numPointsPerDash - 1) {
          this.setPosition(idx * 6, PL.x, PL.y, PL.z);
          this.setPosition(idx * 6 + 1, PR.x, PR.y, PR.z);
          this.setPosition(idx * 6 + 3, PR.x, PR.y, PR.z);
        }

        p0x = PL.x;
        p0y = PL.y;
        p0z = 0;
        p1x = PR.x;
        p1y = PR.y;
        p1z = 0;

        len += this.dashSize / this.numPointsPerDash;
        idx++;
      }
      len += this.gapSize;
    }
    this.geometry.attributes.position.needsUpdate = true;
  }

  updateColors() {
    let idx = 0;
    let elapsed = Global.clock.getElapsedTime();
    for (let n = 0; n < this.numDashes; n++) {
      let brightness = Math.sin(elapsed * 0.3 + n * 0.2);

      for (let i = 0; i < this.numPointsPerDash; i++) {
        if (i > 0) {
          this.setColor((idx - 1) * 6 + 2, brightness);
          this.setColor((idx - 1) * 6 + 4, brightness);
          this.setColor((idx - 1) * 6 + 5, brightness);
        }
        if (i < this.numPointsPerDash - 1) {
          this.setColor(idx * 6, brightness);
          this.setColor(idx * 6 + 1, brightness);
          this.setColor(idx * 6 + 3, brightness);
        }
        idx++;
      }
    }
    this.geometry.attributes.color.needsUpdate = true;
  }
}

export { DashedLine };
