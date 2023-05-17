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
    vec2 velocity = texture2D(uCurrentPosition, vUv).zw; 
    velocity *= 0.96;

    //* Particle Attraction Force
    //* how much the particle want to get back to its original position
    vec2 direction = normalize(finalOriginal - position);
    float dist = length(finalOriginal - position);
    if (dist > 0.01) {
        velocity += direction * 0.00001;
    }

    //* Mouse Repell Force
    //* how powerfull is the mouse
    float mouseDistance = distance(position, uMouse.xy);
    float maxDistance = 0.1;
    if (mouseDistance < maxDistance) {
        vec2 direction = normalize(position - uMouse.xy);
        velocity += direction * (1.0 - mouseDistance / maxDistance) * 0.001;
    }
    position.xy += velocity;
    
    gl_FragColor = vec4(position, velocity);
}

//* shape morphing force
// vec2 force = finalOriginal - uMouse.xy;
// float len = length(force);
// float forceFactor = 1.0 / max(1.0, len * 50.0);
// vec2 positionToGo = finalOriginal + normalize(force) * forceFactor * 0.4;
// position.xy += (positionToGo - position.xy) * 0.05;