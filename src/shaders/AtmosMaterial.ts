import * as THREE from 'three';

const vertexShader = /*glsl*/`
varying vec3 vertexNormal;

void main() {
  vertexNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = /*glsl*/`
uniform vec3 globeColor;
varying vec3 vertexNormal;

void main() {
  
  float intensity = 0.9 - dot(
    vertexNormal, 
    vec3(0.0, 0.0, 1.0)
  );

  vec3 atmosphere = globeColor;
  
  gl_FragColor = vec4(
    atmosphere, 
    1.0
  ) * pow(intensity, 2.0);
}
`;

export default {
  vertexShader, fragmentShader
}