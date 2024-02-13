import * as THREE from 'three';

const vertexShader = /*glsl*/`
varying vec3 vertexNormal;
varying vec2 vertexUV;

void main() {
  vertexUV = uv;
  vertexNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = /*glsl*/`
uniform sampler2D ringTexture;
varying vec3 vertexNormal;
varying vec2 vertexUV;

void main() {
  gl_FragColor = vec4(
    texture2D(ringTexture, vertexUV).xyz, 
    1.0
  );
}
`;

export default {
  vertexShader, fragmentShader
}