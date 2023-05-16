uniform sampler2D uTexture;
uniform sampler2D uTest;

varying vec2 vUv;

void main () {
  vec4 color = texture2D(uTexture, vUv);
  vec4 test = texture2D(uTest, vUv);
  gl_FragColor = color;
  gl_FragColor = test;
}
