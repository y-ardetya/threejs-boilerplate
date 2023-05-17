uniform sampler2D uTexture;


varying vec2 vUv;

void main () {
  vec4 color = texture2D(uTexture, vUv);

  gl_FragColor = vec4(vUv,0.5, 0.3);

}
