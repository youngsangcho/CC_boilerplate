varying vec4 vColor;

void main() {
  // gl_FragColor = vec4(0.0,0.0,1.0,1.0);
  //gl_FragColor = vec4(40.0/255.0, 53.0/255.0, 67.0/255.0, 1.0);
  // gl_FragColor = vec4(0.0/255.0, 65.0/255.0, 224.0/255.0, 1.0);
  // gl_FragColor = vec4(5.0/255.0, 84.0/255.0, 128.0/255.0, 1.0);
  gl_FragColor = vColor;//vec4(1.0, 1.0, 1.0, 1.0);
}