uniform sampler2D uCurrentPosition;
uniform sampler2D uOriginPosition;
uniform sampler2D uCurrentPosition1;
uniform sampler2D uOriginPosition1;
uniform float uProgress;
uniform vec3 uMouse;

varying vec2 vUv;

void main () {
    vec2 position = texture2D(uCurrentPosition, vUv).xy;
    vec2 origin = texture2D(uOriginPosition, vUv).xy;
    vec2 origin1 = texture2D(uOriginPosition1, vUv).xy;

    vec2 finalOriginal = mix(origin, origin1, uProgress);

    vec2 force = finalOriginal - uMouse.xy;

    float len = length(force);

    float forceFactor = 1.0 / max(1.0, len * 50.0);

    vec2 positionToGo = finalOriginal + normalize(force) * forceFactor * 0.4;

    position.xy += (positionToGo - position.xy) * 0.05;
    
    gl_FragColor = vec4(position, 0.0, 1.0);
}