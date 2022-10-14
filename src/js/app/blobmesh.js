import * as THREE from "three";
import Global from "./global.js";
import SimplexNoise from "simplex-noise";

class BlobMesh extends THREE.Object3D {
  constructor() {
    super();

    // this.lastPoints = _points;

    this.geometry = new THREE.BufferGeometry();

    const numBlobs = 5;
    const numPointsPerBlob = 30;
    const numExtraPoints = 0;
    const numPoints = numPointsPerBlob + numExtraPoints;
    const vertices = new Float32Array(numBlobs * (numPointsPerBlob + numExtraPoints) * 3);
    const colors = new Float32Array(numBlobs * (numPointsPerBlob + numExtraPoints) * 4);

    const simplex = new SimplexNoise();
    let noiseX = Math.random() * 100;
    let noiseY = Math.random() * 100;
    let noiseX2 = Math.random() * 100;
    let noiseY2 = Math.random() * 100;

    let points = [];
    let rads = [];
    let baseRad = Math.random() * 1 + 2.4;
    for (let i = 0; i < numPointsPerBlob; i++) {
      rads.push(baseRad);
    }

    for (let n = 0; n < numBlobs; n++) {
      for (let i = 0; i < numPoints; i++) {
        let ang = (i / (numPointsPerBlob - 1)) * Math.PI * 2;
        let radius =
          rads[i] +
          simplex.noise2D(
            noiseX + 0.05 * rads[i] * Math.cos(ang),
            noiseY + 0.05 * rads[i] * Math.sin(ang)
          );
        rads[i] = radius + 1.3;
        let x = radius * Math.cos(ang);
        let y = radius * Math.sin(ang);
        let z = simplex.noise2D((noiseX2 + x) * 0.04, (noiseY2 + y) * 0.04) * 3;
        // points.push(new THREE.Vector3(x, y, z));
        vertices[(n * numPoints + i) * 3 + 0] = x;
        vertices[(n * numPoints + i) * 3 + 1] = y;
        vertices[(n * numPoints + i) * 3 + 2] = z;

        colors[(n * numPoints + i) * 4 + 0] = 1;
        colors[(n * numPoints + i) * 4 + 1] = 1;
        colors[(n * numPoints + i) * 4 + 2] = 1;
        colors[(n * numPoints + i) * 4 + 3] = Math.random();
      }
    }

    //this.geometry.setFromPoints(points);
    this.geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    this.geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(colors, 4)
    );

    this.material = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      vertexColors: true,
      vertexAlphas: true,
      side: THREE.DoubleSide,
    });

    //this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh = new THREE.Line(this.geometry, this.material);
    this.add(this.mesh);

    //this.positions = this.mesh.geometry.attributes.position.array;

    this.start = 0.0;
    this.end = 1.0;

    this.updatePositions();
  }

  update() {}

  setColor(color) {}

  updatePositions() {}
}

export { BlobMesh };
