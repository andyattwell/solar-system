import * as THREE from 'three';

const vertexShader = /*glsl*/`
varying vec2 vertexUV;
varying vec3 vertexNormal;
varying vec3 vecPos;

void main() {
  vertexUV = uv;
  vecPos = (modelViewMatrix * vec4(position, 1.0)).xyz;

  vertexNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * vec4(vecPos, 1.0);
}
`;

const fragmentShader_v1 = /*glsl*/`
uniform sampler2D globeTexture;
uniform vec3 globeColor;
varying vec2 vertexUV;
varying vec3 vertexNormal;

void main() {
  float intensity = 1.3 - dot(
    vertexNormal, 
    vec3(0.0, 0.0, 1.0)
  );
  vec3 atmosphere = globeColor * pow(intensity, 1.5);
  
  gl_FragColor = vec4(
    atmosphere + texture2D(globeTexture, vertexUV).xyz, 
    1.0
  );
}
`;

const fragmentShader_v3 = /*glsl*/`
uniform sampler2D globeTexture;
uniform vec3 pointLightPosition;
uniform vec3 pointLightColor;

uniform vec3 globeColor;
varying vec2 vertexUV;
varying vec3 vertexNormal;

void main() {
  vec3 normal = normalize(vertexNormal);
  vec3 normalizedLight = normalize(pointLightPosition);
  vec3 lightDirection = gl_FragCoord.xyz - normalizedLight;
  float intensity = max(dot(normal, lightDirection), 0.0);
  vec3 lighting = pointLightColor * intensity;
  gl_FragColor = vec4(texture2D(globeTexture, vertexUV).xyz + lighting, 1.0);
}
`;

const fragmentShader = `
precision highp float;

varying vec2 vertexUV;
varying vec3 vecPos;
varying vec3 vertexNormal;

uniform float lightIntensity;
uniform sampler2D textureSampler;

struct PointLight {
  vec3 color;
  vec3 position; // light position, in camera coordinates
  float distance; // used for attenuation purposes. Since
                  // we're writing our own shader, it can
                  // really be anything we want (as long as
                  // we assign it to our light in its
                  // "distance" field
};

uniform PointLight pointLights[NUM_POINT_LIGHTS];

void main(void) {
  vec4 addedLights = vec4(0.1, 0.1, 0.1, 1.0);
  for(int l = 0; l < NUM_POINT_LIGHTS; l++) {
    vec3 adjustedLight = pointLights[l].position;
    vec3 lightDirection = normalize(vecPos - adjustedLight);
    addedLights.rgb += clamp(
      dot(-lightDirection, vertexNormal), 0.2, 1.0
    ) * pointLights[l].color * lightIntensity;
  }

  gl_FragColor = texture2D(textureSampler, vertexUV) * addedLights;
}`

export default {
  vertexShader, fragmentShader
};