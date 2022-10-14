// // our vertex data
// attribute vec3 aPosition;
// attribute vec2 aTexCoord;

// // lets get texcoords just for fun! 
// varying vec2 vTexCoord;

// void main() {
//   // copy the texcoords
//   vTexCoord = aTexCoord;

//   // copy the position data into a vec4, using 1.0 as the w component
//   vec4 positionVec4 = vec4(aPosition, 1.0);
//   positionVec4.xy = positionVec4.xy * 2.0 - 1.0;

//   // send the vertex information on to the fragment shader
//   gl_Position = positionVec4;
// }

varying vec2 vTexCoord;

void main() {

  // // copy the position data into a vec4, using 1.0 as the w component
  // vec4 positionVec4 = vec4(aPosition, 1.0);

  // // Move our vertex positions into screen space
  // // The order of multiplication is always projection * view * model * position
  // // In this case model and view have been combined so we just do projection * modelView * position
  // gl_Position = uProjectionMatrix * uModelViewMatrix * positionVec4;

  // // Send the texture coordinates to the fragment shader
  // vTexCoord = aTexCoord;
  // copy the texcoords
  vTexCoord = uv;

  // // copy the position data into a vec4, using 1.0 as the w component
  // vec4 positionVec4 = vec4(aPosition, 1.0);
  // vec4 positionVec4 = vec4(position, 1.0);
  // positionVec4.xy = positionVec4.xy * 2.0 - 1.0;

  // // send the vertex information on to the fragment shader
  // gl_Position = positionVec4;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}