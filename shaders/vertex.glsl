uniform float time;

varying vec2 vUv;

void main () {
    vUv = uv;
    vec3 pos = position;
    pos.z += sin(time + position.x * 10.) * 0.1;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize =  (10.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
}