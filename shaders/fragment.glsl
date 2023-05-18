uniform sampler2D uTexture;


varying vec2 vUv;

void main () {
  vec4 color = texture2D(uTexture, vUv);

  gl_FragColor = vec4(vUv,1.0, 1.0);

}
