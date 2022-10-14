varying vec4 vColor;
uniform sampler2D u_texture;
varying vec2 vUv;

void main() {
  vec4 tex = texture2D(u_texture, vUv);
  gl_FragColor = tex * vColor;//vec4(1.0, 1.0, 1.0, 1.0);
}