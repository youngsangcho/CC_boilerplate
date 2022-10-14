uniform float u_elapsed;
uniform float u_brightness;
uniform float u_numTracks;
uniform float u_numRepeat;

int numPoints = 20;
float numPoints_f = 20.0;

varying vec4 vColor;

void main() {

  int meshId = gl_VertexID / (numPoints * 6);
  float meshId_f = float(meshId);
  int vertIdx = gl_VertexID - meshId * (numPoints * 6);
  int pointIdx = vertIdx / 3;
  float pointIdx_f = float(pointIdx);
  
  float brightness = sin(u_elapsed * 5.0 + pointIdx_f * 1.0) * 0.6 + 0.4;
  if (meshId_f > 15000.0) brightness = 0.0;
  // vColor = vec4(1.0, 0.0, 0.0, brightness * u_brightness);
  vColor = vec4(1.0, 1.0, 1.0, brightness * u_brightness);
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}