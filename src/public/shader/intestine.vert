#pragma STDGL invariant(all) 

precision mediump float; 
precision mediump int; 
precision mediump sampler2D; 

uniform float u_elapsed;
uniform sampler2D u_texture;

int numIntestines = 1;
float numIntestines_f = 1.0;
int numLen = 400;
float numLen_f = 400.0;
int numDeg = 30;
float numDeg_f = 30.0;

int numLen2 = 100;
float numLen2_f = 100.0;
int numDeg2 = 40;
float numDeg2_f = 40.0;
int numPerHair = 4;
float numPerHair_f = 4.0;

uniform vec3 u_positions [15];
uniform vec3 u_rotations [15];
uniform float u_alpha;

varying vec4 vColor;
varying vec2 vUv;

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

mat3 rotateX(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat3(
        vec3(1, 0, 0),
        vec3(0, c, -s),
        vec3(0, s, c)
    );
}

// Rotation matrix around the Y axis.
mat3 rotateY(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat3(
        vec3(c, 0, s),
        vec3(0, 1, 0),
        vec3(-s, 0, c)
    );
}

// Rotation matrix around the Z axis.
mat3 rotateZ(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat3(
        vec3(c, -s, 0),
        vec3(s, c, 0),
        vec3(0, 0, 1)
    );
}

// Identity matrix.
mat3 identity() {
    return mat3(
        vec3(1, 0, 0),
        vec3(0, 1, 0),
        vec3(0, 0, 1)
    );
}

mat3 rotAxis(vec3 axis, float a) {
  float s=sin(a);
  float c=cos(a);
  float oc=1.0-c;
  vec3 as=axis*s;
  mat3 p=mat3(axis.x*axis,axis.y*axis,axis.z*axis);
  mat3 q=mat3(c,-as.z,as.y,as.z,c,-as.x,-as.y,as.x,c);
  return p*oc+q;
}

void main() {
  int meshIdx = gl_VertexID / (numDeg * numLen);
  float meshIdx_f = float(meshIdx);

  float len_gap = 0.4;
  float noise_step = 0.02;

  vec3 pos;

  if (meshIdx < numIntestines) {
    int lenIdx = (gl_VertexID - meshIdx * numDeg * numLen) / numDeg;
    float lenIdx_f = float(lenIdx);

    int lenIdx_prev = (gl_VertexID - meshIdx * numDeg * numLen) / numDeg - 1;
    float lenIdx_prev_f = float(lenIdx_prev);
    
    int degIdx = gl_VertexID % numDeg;
    float degIdx_f = float(degIdx);

    float rad = 0.2 * u_alpha + 9.0  + noise(vec2(lenIdx_f * 0.37, 0.0 + u_elapsed * 0.5)) * 7.0;
    float ang = (degIdx_f / (numDeg_f - 1.0)) * 3.14159 * 2.0;

    float x_prev = -numLen_f * len_gap * 0.5 + lenIdx_prev_f * len_gap * 1.0;
    float y_prev = noise(vec2(0.0, lenIdx_prev_f * noise_step + u_elapsed * 0.1)) * 40.0;
    float z_prev = noise(vec2(lenIdx_prev_f * noise_step, 0.0 + u_elapsed * 0.1)) * 40.0;
    vec3 P_prev = vec3(x_prev, y_prev, z_prev);

    float x = -numLen_f * len_gap * 0.5 + lenIdx_f * len_gap * 1.0;
    float y = noise(vec2(0.0, lenIdx_f * noise_step + u_elapsed * 0.1)) * 40.0;
    float z = noise(vec2(lenIdx_f * noise_step, u_elapsed * 0.1)) * 40.0;
    vec3 P = vec3(x, y, z);

    vec3 dir = normalize(P - P_prev);
    pos = vec3(-dir.y, dir.x, 0.0) * rotAxis(dir, ang);
    pos *= rad;
    pos += P;

    
    pos *= rotateX(u_rotations[meshIdx].x);
    pos *= rotateY(u_rotations[meshIdx].y);
    pos *= rotateZ(u_rotations[meshIdx].z);
    pos += u_positions[meshIdx];


    int uvx = (gl_VertexID - meshIdx * numDeg * numLen) / numDeg;
    float uvx_f = float(uvx);
    vUv = vec2(uvx_f * 0.04, degIdx_f / numDeg_f * 2.0);
    float r = cos(((degIdx_f) / numDeg_f) * 3.14159 * 2.0) * -0.5 + 0.5;
    float brightness = noise(lenIdx_f * 0.2 + degIdx_f * 0.05 + u_elapsed * 0.5) * u_alpha * 0.5 + 0.03;
    vColor = vec4(vec3(r, r, r) * brightness, 1.0);
  } else {
    int vertexId = gl_VertexID - numIntestines * numDeg * numLen;
    float vertexId_f = float(vertexId);
    int meshIdx2 = vertexId / (numDeg2 * numLen2 * numPerHair * 2);

    int lenIdx = (vertexId - meshIdx2 * numLen2 * numDeg2 * numPerHair * 2) / (numDeg2 * numPerHair * 2);
    float lenIdx_f = float(lenIdx);

    int lenIdx_prev = lenIdx - 1;
    float lenIdx_prev_f = float(lenIdx_prev);

    float len_gap2 = numLen_f * len_gap / numLen2_f;
    float noise_step2 = numLen_f * noise_step / numLen2_f;

    int degIdx = (vertexId / (numPerHair * 2)) % numDeg2;
    float degIdx_f = float(degIdx);

    int hairIdx = vertexId % (numPerHair * 2);
    float hairIdx_f = float(hairIdx);

    float rad = 0.2 * u_alpha + 8.0  + noise(vec2(lenIdx_f * 0.37, 0.0 + u_elapsed * 0.5)) * 7.0;
    float ang = (lenIdx_f * 0.2 + degIdx_f / (numDeg2_f - 1.0)) * 3.14159 * 2.0;

    float x_prev = -numLen_f * len_gap * 0.5 + lenIdx_prev_f * len_gap2;
    float y_prev = noise(vec2(0.0, lenIdx_prev_f * noise_step2 + u_elapsed * 0.1)) * 40.0;
    float z_prev = noise(vec2(lenIdx_prev_f * noise_step2, 0.0 + u_elapsed * 0.1)) * 40.0;
    vec3 P_prev = vec3(x_prev, y_prev, z_prev);

    float x = -numLen_f * len_gap * 0.5 + lenIdx_f * len_gap2;
    float y = noise(vec2(0.0, lenIdx_f * noise_step2 + u_elapsed * 0.1)) * 40.0;
    float z = noise(vec2(lenIdx_f * noise_step2, u_elapsed * 0.1)) * 40.0;
    vec3 P = vec3(x, y, z);

    //float len = float(hairIdx / 2) * 1.05;
    float len = float(hairIdx / 2);//

    vec3 dir = normalize(P - P_prev);
    vec3 norm = normalize(vec3(-dir.y, dir.x, 0.0) * rotAxis(dir, ang));
    vec3 add = vec3(noise(vec3(x + float(hairIdx) * 0.01, y, z)), 
                  noise(vec3(x, y + float(vertexId) * 0.01, z)), 
                  noise(vec3(x, y, z))
                  ) * len;
    pos = norm * (rad + len);// + add;
    pos += float((hairIdx / 2) % numPerHair)  * dir * noise(hairIdx_f * 0.1 + degIdx_f * 0.5 + u_elapsed * 1.0) * 1.0;
    
    float hairWidth = 0.5 * noise(float(hairIdx / (numPerHair * 2)) * 3.0 + u_elapsed * 0.2);
    float width = hairWidth - float(hairIdx / 2) / (numPerHair_f - 1.0) * hairWidth;
    if (hairIdx % 2 == 0) pos += vec3(-dir.y, dir.x, 0.0) * width * 0.5;
    else pos += vec3(dir.y, -dir.x, 0.0) * width * 0.5;
    pos += P;

    vColor = vec4(0.0, 0.0, 0.0, 1.0);
    pos *= rotateX(u_rotations[meshIdx2].x);
    pos *= rotateY(u_rotations[meshIdx2].y);
    pos *= rotateZ(u_rotations[meshIdx2].z);
    pos += u_positions[meshIdx2];
  }

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0 );
}