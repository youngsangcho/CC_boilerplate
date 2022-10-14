import * as THREE from "three";

async function loadCsvAsync(path) {
  let data = await fetch(path);
  // return Papa.parse(data.text());
  return await data.text();
  // return JSON.parse(data);
}

class VShaderMaterial {
  //constructor(filepath, define_vert, define_frag, uniforms, onLoad) {
    constructor(filepath, uniforms, useVertexColors, useVertexAlphas, useWireframe, onLoad) {
    this.vertShader = null;
    this.fragShader = null;
    this.uniforms = uniforms;
    this.useVertexColors = useVertexColors;
    this.useVertexAlphas = useVertexAlphas; 
    this.useWireframe = useWireframe;
    // this.define_vert = define_vert;
    // this.define_frag = define_frag;
    // "#define NUMPOINTS "+ myVec2Array.length +"\n"
    this.onLoad = onLoad;
    this.material = null;

    this.loadShader("vert", filepath + ".vert");
    this.loadShader("frag", filepath + ".frag");
  }

  onLoadShader() {
    if (this.vertShader && this.fragShader) {
      this.material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        // vertexShader: this.define_vert + "\n" + this.vertShader,
        // fragmentShader: this.define_frag + "\n" + this.fragShader,
        vertexShader: this.vertShader,
        fragmentShader: this.fragShader,
        depthWrite: true,
        side: THREE.DoubleSide,
        vertexColors: this.useVertexColors,
        // vertexAlphas: this.useVertexAlphas,
        wireframe: this.useWireframe,
        transparent: true,
        // depthWrite: false,
      });

      this.onLoad(this.material);
    }
  }

  loadShader(type, filepath) {
    const loader = new THREE.FileLoader();

    var _this = this;
    //load a text file and output the result to the console
    loader.load(
      filepath,
      // onLoad callback
      function (data) {
        if (type === "vert") {
          _this.vertShader = data;
        } else if (type === "frag") {
          _this.fragShader = data;
        }
        _this.onLoadShader();
      },
      // onProgress callback
      function (xhr) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      // onError callback
      function (err) {
        console.error("An error happened");
      }
    );
  }
}

export { loadCsvAsync, VShaderMaterial };
