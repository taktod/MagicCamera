import {webgl} from "../util/webgl";

export var freud = (body:HTMLElement) => {
  body.style["display"] = "inline-table";
  var canvas = body.getElementsByTagName("canvas")[0] as HTMLCanvasElement;
  var slider = body.getElementsByTagName("input")[0] as HTMLInputElement;
  var vertexSrc = `
attribute vec3 Position;
attribute vec2 UV;
uniform mat4 pjMat;
uniform mat4 mvMat;
varying vec2 varyUV;

void main() {
  varyUV = UV;
  gl_Position = pjMat * mvMat * vec4(Position, 1.0);
}
`;
  var fragSrc = `
precision highp float;
varying mediump vec2 varyUV;

uniform sampler2D camera;
uniform sampler2D rand;

uniform float cameraHeight;
uniform float cameraWidth;

float randSize = 1024.0;

uniform float strength;

// gray
float NCGray(vec4 color) {
  float gray = 0.2125 * color.r + 0.7154 * color.g + 0.0721 * color.b;
  return gray;
}
 
// tone mapping
vec4 NCTonemapping(vec4 color) {

  vec4 mapped;
  mapped.r = texture2D(rand, vec2(color.r, 0.0)).r;
  mapped.g = texture2D(rand, vec2(color.g, 0.0)).g;
  mapped.b = texture2D(rand, vec2(color.b, 0.0)).b;
  mapped.a = color.a;

  return mapped;
}
 
// color control
vec4 NCColorControl(vec4 color, float saturation, float brightness, float contrast) {
  float gray = NCGray(color);

  color.rgb = vec3(saturation) * color.rgb + vec3(1.0-saturation) * vec3(gray);
  color.r = clamp(color.r, 0.0, 1.0);
  color.g = clamp(color.g, 0.0, 1.0);
  color.b = clamp(color.b, 0.0, 1.0);

  color.rgb = vec3(contrast) * (color.rgb - vec3(0.5)) + vec3(0.5);
  color.r = clamp(color.r, 0.0, 1.0);
  color.g = clamp(color.g, 0.0, 1.0);
  color.b = clamp(color.b, 0.0, 1.0);

  color.rgb = color.rgb + vec3(brightness);
  color.r = clamp(color.r, 0.0, 1.0);
  color.g = clamp(color.g, 0.0, 1.0);
  color.b = clamp(color.b, 0.0, 1.0);

  return color;
}

// hue adjust
vec4 NCHueAdjust(vec4 color, float hueAdjust) {
  vec3 kRGBToYPrime = vec3(0.299, 0.587, 0.114);
  vec3 kRGBToI = vec3(0.595716, -0.274453, -0.321263);
  vec3 kRGBToQ = vec3(0.211456, -0.522591, 0.31135);

  vec3 kYIQToR   = vec3(1.0, 0.9563, 0.6210);
  vec3 kYIQToG   = vec3(1.0, -0.2721, -0.6474);
  vec3 kYIQToB   = vec3(1.0, -1.1070, 1.7046);

  float yPrime = dot(color.rgb, kRGBToYPrime);
  float I = dot(color.rgb, kRGBToI);
  float Q = dot(color.rgb, kRGBToQ);

  float hue = atan(Q, I);
  float chroma  = sqrt (I * I + Q * Q);

  hue -= hueAdjust;

  Q = chroma * sin (hue);
  I = chroma * cos (hue);

  color.r = dot(vec3(yPrime, I, Q), kYIQToR);
  color.g = dot(vec3(yPrime, I, Q), kYIQToG);
  color.b = dot(vec3(yPrime, I, Q), kYIQToB);

  return color;
}

// colorMatrix
vec4 NCColorMatrix(vec4 color, float red, float green, float blue, float alpha, vec4 bias) {
  color = color * vec4(red, green, blue, alpha) + bias;
  return color;
}

// multiply blend
vec4 NCMultiplyBlend(vec4 overlay, vec4 base) {
  vec4 outputColor;

  float a = overlay.a + base.a * (1.0 - overlay.a);

  // multiply blend
  outputColor.rgb = ((1.0-base.a) * overlay.rgb * overlay.a + (1.0-overlay.a) * base.rgb * base.a + overlay.a * base.a * overlay.rgb * base.rgb) / a;
  outputColor.a = a;
  return outputColor;
}

// xy should be a integer position (e.g. pixel position on the screen)
// similar to a texture lookup but is only ALU
float PseudoRandom(vec2 co) {
  mediump float a = 12.9898;
  mediump float b = 78.233;
  mediump float c = 43758.5453;
  mediump float dt= dot(co.xy ,vec2(a,b));
  mediump float sn= mod(dt,3.14);
  return fract(sin(sn) * c);
}

void main() {
  vec4 originColor = texture2D(camera, varyUV);
  vec4 color = texture2D(camera, varyUV);

  color.a = 1.0;

  // color control
  color = NCColorControl(color, 0.5, 0.1, 0.9);

  // rand
  float x = varyUV.x*cameraWidth/randSize;
  float y = varyUV.y*cameraHeight/randSize;

  vec4 rd = texture2D(rand, vec2(fract(x), fract(y)));

  rd = NCColorControl(rd, 1.0, 0.4, 1.2);

  // normal blend
  color = NCMultiplyBlend(rd, color);

  // color matrix
  color = NCColorMatrix(color, 1.0, 1.0, 1.0, 1.0, vec4(-0.15, -0.15, -0.15, 0));

  color.rgb = mix(originColor.rgb, color.rgb, strength);
  gl_FragColor = color;
}`;
  var dummyArray = new Uint8Array(canvas.width * canvas.height * 4);

  var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
  var vShader = webgl.createShader(gl, vertexSrc, true);
  var fShader = webgl.createShader(gl, fragSrc, false);
  var program = webgl.createProgram(gl, vShader, fShader);

  var pjLocation = gl.getUniformLocation(program, 'pjMat');
  gl.uniformMatrix4fv(pjLocation, false, webgl.glCreateMat4Ortho(-canvas.width / 2, canvas.width / 2, -canvas.height / 2, canvas.height / 2, -1, 1));
  var mvLocation = gl.getUniformLocation(program, 'mvMat');
  gl.uniformMatrix4fv(mvLocation, false, webgl.glCreateMat4Identity());
  var cameraLocation = gl.getUniformLocation(program, 'camera');
  gl.uniform1i(cameraLocation, 0);
  var randLocation = gl.getUniformLocation(program, 'rand');
  gl.uniform1i(randLocation, 1);
  // これの正しいサイズがよくわからない。(magicCameraのコードをみたところ、出力のwidth x heightをapplyしている模様。)
  var cameraHeightLocation = gl.getUniformLocation(program, 'cameraHeight');
  gl.uniform1f(cameraHeightLocation, 240.0);
  var cameraWidthLocation = gl.getUniformLocation(program, 'cameraWidth');
  gl.uniform1f(cameraWidthLocation, 320.0);
  var strengthLocation = gl.getUniformLocation(program, 'strength');
  gl.uniform1f(strengthLocation, 0.5);
  slider.addEventListener("input", () => {
    gl.uniform1f(strengthLocation, Number(slider.value) / 100.0);
  });

  gl.activeTexture(gl.TEXTURE0);
  var videoTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, videoTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, dummyArray);

  gl.activeTexture(gl.TEXTURE1);
  var videoTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, videoTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById('freud_rand_png') as HTMLImageElement);

  window.addEventListener("refresh", () => {
    var source = document.getElementById("source") as HTMLVideoElement;
    if(source.currentTime == 0) {
      return;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, videoTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById('source') as HTMLVideoElement);
    // 頂点情報の登録
    var attLocation = gl.getAttribLocation(program, 'Position');
    gl.enableVertexAttribArray(attLocation);
    var vertex_position = new Float32Array([
      -canvas.width / 2, -canvas.height / 2, 0,
       canvas.width / 2, -canvas.height / 2, 0,
       canvas.width / 2,  canvas.height / 2, 0,
      -canvas.width / 2,  canvas.height / 2, 0
    ]);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());

    gl.bufferData(gl.ARRAY_BUFFER, vertex_position, gl.STATIC_DRAW);
  
    gl.vertexAttribPointer(attLocation, 3, gl.FLOAT, false, 0, 0);

    // テクスチャ一情報を調整
    var uvLocation = gl.getAttribLocation(program, 'UV');
    gl.enableVertexAttribArray(uvLocation);

    var uv_position = new Float32Array([
      0.0, 1.0,
      1.0, 1.0,
      1.0, 0.0,
      0.0, 0.0
    ]);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, uv_position, gl.STATIC_DRAW);
    gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  });
};