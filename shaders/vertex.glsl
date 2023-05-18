uniform float time;
uniform sampler2D uTexture;

varying vec2 vUv;

void main () {
    vUv = uv;
    vec3 pos = position;

    vec4 color = texture2D(uTexture, vUv);
    pos.xyz = color.xyz;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize =  (2.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
}