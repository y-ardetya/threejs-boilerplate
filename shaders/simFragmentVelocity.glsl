uniform sampler2D uOriginPosition;
uniform sampler2D uCurrentPosition1;
uniform sampler2D uOriginPosition1;
uniform float uProgress;
uniform vec3 uMouse;
uniform float uTime;


float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main () {
    vec2 vUv = gl_FragCoord.xy / resolution.xy;
    float offset = rand(vUv);
    vec3 position = texture2D(uCurrentPosition, vUv).xyz;
    vec3 original = texture2D(uOriginPosition, vUv).xyz;
    vec3 velocity = texture2D(uCurrentVelocity, vUv).xyz;

    //* Fun stuff here *//
    velocity *= 0.9;

    //* Particle Back To Original Position *//
    vec3 direction = normalize(original - position);
    float dist = length(original - position);
    if (dist > 0.01) {
        velocity += direction * 0.001;
    }

    //* Mouse Repel *//
    float mouseDistance = distance(position, uMouse);
    float maxDistance = 0.1;
    if (mouseDistance < maxDistance) {
        vec3 direction = normalize(position - uMouse);
        velocity += direction * (1.0 - mouseDistance / maxDistance) * 0.01;
    }

    //* LifeSpan *//
    // float lifeSpan = 10.0;
    // float age = mod(uTime + lifeSpan * offset, lifeSpan);
    
    // if (age < 0.1) {
    //     position.xyz = original;
    // }

  
    
    gl_FragColor = vec4(velocity, 1.0);
}

