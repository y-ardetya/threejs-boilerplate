uniform sampler2D uCurrentPosition;
uniform sampler2D uOriginPosition;
uniform sampler2D uCurrentPosition1;
uniform sampler2D uOriginPosition1;
uniform float uProgress;
uniform vec3 uMouse;
uniform float uTime;

varying vec2 vUv;

float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main () {
    float offset = rand(vUv);

    vec2 position = texture2D(uCurrentPosition, vUv).xy;
    vec2 origin = texture2D(uOriginPosition, vUv).xy;
    vec2 origin1 = texture2D(uOriginPosition1, vUv).xy;
    vec2 finalOriginal = mix(origin, origin1, uProgress);
    vec2 velocity = texture2D(uCurrentPosition, vUv).zw; 
    velocity *= 0.99;

    //* Particle Attraction Force
    //* how much the particle want to get back to its original position
    vec2 direction = normalize(finalOriginal - position);
    float dist = length(finalOriginal - position);
    if (dist > 0.01) {
        //* when using particle life span, turn off this one
        velocity += direction * 0.0001;
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

    //*particle life span

    float lifespan = 10.0;
    //! this value will always stay between 0 and 20
    float age = mod(uTime + lifespan * offset, lifespan);

    if (age < 0.1) {
        velocity = vec2(0.0, 0.001);
        position.xy = finalOriginal;
    }

    
    gl_FragColor = vec4(position, velocity);
}

//* shape morphing force
// vec2 force = finalOriginal - uMouse.xy;
// float len = length(force);
// float forceFactor = 1.0 / max(1.0, len * 50.0);
// vec2 positionToGo = finalOriginal + normalize(force) * forceFactor * 0.4;
// position.xy += (positionToGo - position.xy) * 0.05;