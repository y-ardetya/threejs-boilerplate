uniform sampler2D uCurrentPosition;
uniform sampler2D uOriginPosition;
uniform vec3 uMouse;

varying vec2 vUv;

void main () {
    vec2 position = texture2D(uCurrentPosition, vUv).xy;
    vec2 origin = texture2D(uOriginPosition, vUv).xy;

    vec2 force = origin - uMouse.xy;

    float len = length(force);

    float forceFactor = 1.0 / max(1.0, len * 5.0);

    vec2 positionToGo = origin + normalize(force) * forceFactor * 0.1;

    position.xy += (positionToGo - position.xy) * 0.05;
    
    gl_FragColor = vec4(position, 0.0, 1.0);
}