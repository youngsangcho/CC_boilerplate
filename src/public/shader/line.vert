#pragma STDGL invariant(all) 

precision mediump float; 
precision mediump int; 
precision mediump sampler2D; 

uniform float u_elapsed;

// numbers added to convert float <-> in and sign +/-
uniform float u_d_offset;
uniform float u_d_mult;

// data about base line points
uniform sampler2D u_d_points;
uniform int u_d_points_width;


// data about start, end, width
uniform sampler2D u_d_lines;
// uniform int u_dataTex_width;
// uniform float u_data_offset;
// uniform float u_data_mult;

uniform float u_lineWidth [4];

uniform float u_numRepeat;
uniform float u_numTracks;

int numPoints = 20;
float numPoints_f = 20.0;

varying vec4 vColor;

float hash(float n) { return fract(sin(n) * 1e4); }
float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }

float noise(float x) {
	float i = floor(x);
	float f = fract(x);
	float u = f * f * (3.0 - 2.0 * f);
	return mix(hash(i), hash(i + 1.0), u);
}

float noise(vec2 x) {
	vec2 i = floor(x);
	vec2 f = fract(x);

	// Four corners in 2D of a tile
	float a = hash(i);
	float b = hash(i + vec2(1.0, 0.0));
	float c = hash(i + vec2(0.0, 1.0));
	float d = hash(i + vec2(1.0, 1.0));

	// Simple 2D lerp using smoothstep envelope between the values.
	// return vec3(mix(mix(a, b, smoothstep(0.0, 1.0, f.x)),
	//			mix(c, d, smoothstep(0.0, 1.0, f.x)),
	//			smoothstep(0.0, 1.0, f.y)));

	// Same code, with the clamps in smoothstep and common subexpressions
	// optimized away.
	vec2 u = f * f * (3.0 - 2.0 * f);
	return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// This one has non-ideal tiling properties that I'm still tuning
float noise(vec3 x) {
	const vec3 step = vec3(110, 241, 171);

	vec3 i = floor(x);
	vec3 f = fract(x);
 
	// For performance, compute the base input to a 1D hash from the integer part of the argument and the 
	// incremental change to the 1D based on the 3D -> 1D wrapping
    float n = dot(i, step);

	vec3 u = f * f * (3.0 - 2.0 * f);
	return mix(mix(mix( hash(n + dot(step, vec3(0, 0, 0))), hash(n + dot(step, vec3(1, 0, 0))), u.x),
                   mix( hash(n + dot(step, vec3(0, 1, 0))), hash(n + dot(step, vec3(1, 1, 0))), u.x), u.y),
               mix(mix( hash(n + dot(step, vec3(0, 0, 1))), hash(n + dot(step, vec3(1, 0, 1))), u.x),
                   mix( hash(n + dot(step, vec3(0, 1, 1))), hash(n + dot(step, vec3(1, 1, 1))), u.x), u.y), u.z);
}


float modI(float a,float b) {
    float m=a-floor((a+0.5)/b)*b;
    return floor(m+0.5);
}

highp float getValueFromTexture(sampler2D dataTexture, int textureWidth, int index) {
  int lod = 0;
  int x = index % textureWidth;
  int y = index / textureWidth;
  highp vec4 color = texelFetch(dataTexture, ivec2(x,y), lod);
  return (color.r * 256.0 * 256.0 * 256.0 +
             color.g * 256.0 * 256.0 +
             color.b * 256.0 +
             color.a) / u_d_mult - u_d_offset;
}

highp vec3 getPointFromSampler(highp int idx) {
  float idx_f = float(idx);

  highp float x = getValueFromTexture(u_d_points, u_d_points_width, idx * 3);
  highp float y = getValueFromTexture(u_d_points, u_d_points_width, idx * 3 + 1);
  highp float z = getValueFromTexture(u_d_points, u_d_points_width, idx * 3 + 2);

  vec3 val = vec3(x, y, z);// / u_d_points_mult - u_d_points_offset;

  return val;
}

void main() {

  int meshId = gl_VertexID / (numPoints * 2);
  float meshId_f = float(meshId);
  int vertIdx = gl_VertexID - meshId * (numPoints * 2);
  int pointIdx = vertIdx / 2;
  float pointIdx_f = float(pointIdx);
  int vertIdxMod = vertIdx % 2;
  //vec3 pos = vec3(float(vertIdx/2) * 2.0, float(vertIdx%2) * 1.0, 0.0);
  vec3 pos = vec3(0.0);//u_points[meshId * 100 + vertIdx / 2];
  
  float width = u_lineWidth[meshId % 4];//getValueFromTexture(u_d_lines, 512, 2);
  float start = 0.0;//0.5 - width * 0.5;
  float end = 1.0;

  float progress = (start + (pointIdx_f / numPoints_f) * (end - start)) * numPoints_f;
  float idx_f = floor(progress);
  int idx = int(idx_f);
  if (idx > numPoints - 1) {
    idx = numPoints - 1;
  }
  //vec3 refP0 = u_points[meshId * numPoints + idx];
  vec3 refP0 = getPointFromSampler(meshId * numPoints + idx);
  float dist = 0.0;
  vec3 dir;
  if (idx == numPoints - 1) {
    vec3 P = getPointFromSampler(meshId * numPoints + idx - 1);
    //dir = refP0 - u_points[meshId * numPoints + idx - 1];
    dir = refP0 - P;
    dir = normalize(dir);
  } else {
    //vec3 refP1 = u_points[meshId * numPoints + idx + 1];
    vec3 refP1 = getPointFromSampler(meshId * numPoints + idx + 1);
    dist = distance(refP0, refP1);
    dir = normalize(refP1 - refP0);
  }

  vec3 refP = refP0 + dir * (dist * (progress - idx_f));
  
  // width = 1.0;
  float lineWidth = 0.35 * sin(pointIdx_f / numPoints_f * 3.14159);
  // float lineWidth = 0.35;
  vec3 PL = refP + vec3(-dir.y, dir.x, 0) * width * lineWidth * 0.5;
  vec3 PR = refP + vec3(dir.y, -dir.x, 0) * width * lineWidth * 0.5;
  
  if (vertIdxMod == 0) {
    pos = PL;
  } else {
    pos = PR;
  }
  
  float c = sin((pointIdx_f / numPoints_f * 1.0 * 3.14159  + meshId_f + u_elapsed * 1.0)) * 0.5 + 0.5;
  // float c = 1.0;
  if (meshId_f > u_numRepeat * u_numTracks * 0.5) c = 0.0;
  float nval = noise(idx_f);
  // vColor = vec4(0.0, 0.0, 1.0 * (nval * 0.5 + 0.5), c);
  // vColor = vec4(0.0, 0.0, 1.0, c);
  vColor = vec4(1.0, 1.0, 1.0, c);
  // vColor = vec4(1.0, 0.0, 1.0, c);
  // if (meshId % 5 == 0) vColor = vec4(0.0, 0.0, 1.0, c);
  // else if (meshId % 5 == 1) vColor = vec4(114.0/255.0, 75.0/255.0, 13.0/255.0, c);
  // else if (meshId % 5 == 2) vColor = vec4(90.0/255.0, 0.0, 168.0/255.0, c);
  // else if (meshId % 5 == 4) vColor = vec4(150.0/255.0, 100.0/255.0, 10.0/255.0, c);
  
  // vColor = mix(vec4(114.0/255.0, 75.0/255.0, 13.0/255.0, 1.0), vec4(0.0, 0.0, 1.0, 1.0), modI(pointIdx_f, 10.0)/10.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
}