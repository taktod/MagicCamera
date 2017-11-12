import {webgl} from "../util/webgl";

export var earlybird = (body:HTMLElement) => {
  body.style["display"] = "inline-table";
  var canvas = body.getElementsByTagName("canvas")[0] as HTMLCanvasElement;
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
precision mediump float;

varying mediump vec2 varyUV;

uniform sampler2D camera;
uniform sampler2D earlyBirdCurves; //earlyBirdCurves
uniform sampler2D earlyBirdOverlay; //earlyBirdOverlay
uniform sampler2D vig; //vig
uniform sampler2D earlyBirdBlowout; //earlyBirdBlowout
uniform sampler2D earlyBirdMap; //earlyBirdMap

const mat3 saturate = mat3(
                          1.210300,
                          -0.089700,
                          -0.091000,
                          -0.176100,
                          1.123900,
                          -0.177400,
                          -0.034200,
                          -0.034200,
                          1.265800);
const vec3 rgbPrime = vec3(0.25098, 0.14640522, 0.0);
const vec3 desaturate = vec3(.3, .59, .11);

void main() {
  vec3 texel = texture2D(camera, varyUV).rgb;

  vec2 lookup;
  lookup.y = 0.5;

  lookup.x = texel.r;
  texel.r = texture2D(earlyBirdCurves, lookup).r;

  lookup.x = texel.g;
  texel.g = texture2D(earlyBirdCurves, lookup).g;

  lookup.x = texel.b;
  texel.b = texture2D(earlyBirdCurves, lookup).b;

  float desaturatedColor;
  vec3 result;
  desaturatedColor = dot(desaturate, texel);

  lookup.x = desaturatedColor;
  result.r = texture2D(earlyBirdOverlay, lookup).r;
  lookup.x = desaturatedColor;
  result.g = texture2D(earlyBirdOverlay, lookup).g;
  lookup.x = desaturatedColor;
  result.b = texture2D(earlyBirdOverlay, lookup).b;

  texel = saturate * mix(texel, result, .5);

  vec2 tc = (2.0 * varyUV) - 1.0;
  float d = dot(tc, tc);

  vec3 sampled;
  lookup.y = .5;

  lookup = vec2(d, texel.r);
  texel.r = texture2D(vig, lookup).r;
  lookup.y = texel.g;
  texel.g = texture2D(vig, lookup).g;
  lookup.y = texel.b;
  texel.b	= texture2D(vig, lookup).b;
  float value = smoothstep(0.0, 1.25, pow(d, 1.35)/1.65);

  lookup.x = texel.r;
  sampled.r = texture2D(earlyBirdBlowout, lookup).r;
  lookup.x = texel.g;
  sampled.g = texture2D(earlyBirdBlowout, lookup).g;
  lookup.x = texel.b;
  sampled.b = texture2D(earlyBirdBlowout, lookup).b;
  texel = mix(sampled, texel, value);

  lookup.x = texel.r;
  texel.r = texture2D(earlyBirdMap, lookup).r;
  lookup.x = texel.g;
  texel.g = texture2D(earlyBirdMap, lookup).g;
  lookup.x = texel.b;
  texel.b = texture2D(earlyBirdMap, lookup).b;

  gl_FragColor = vec4(texel, 1.0);
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
  gl.uniform1i(cameraLocation, 0); // texture0に割り当てておく。
  var earlyBirdCurvesLocation = gl.getUniformLocation(program, 'earlyBirdCurves');
  gl.uniform1i(earlyBirdCurvesLocation, 1); // texture1に割り当てておく。
  var earlyBirdOverlayLocation = gl.getUniformLocation(program, 'earlyBirdOverlay');
  gl.uniform1i(earlyBirdOverlayLocation, 2); // texture2に割り当てておく。
  var vigLocation = gl.getUniformLocation(program, 'vig');
  gl.uniform1i(vigLocation, 3); // texture3に割り当てておく。
  var earlyBirdBlowoutLocation = gl.getUniformLocation(program, 'earlyBirdBlowout');
  gl.uniform1i(earlyBirdBlowoutLocation, 4); // texture4に割り当てておく。
  var earlyBirdMapLocation = gl.getUniformLocation(program, 'earlyBirdMap');
  gl.uniform1i(earlyBirdMapLocation, 5); // texture5に割り当てておく。

  gl.activeTexture(gl.TEXTURE0);
  var videoTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, videoTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, dummyArray);

  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById('earlybirdcurves_png') as HTMLImageElement);

  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById('earlybirdoverlaymap_new_png') as HTMLImageElement);

  gl.activeTexture(gl.TEXTURE3);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById('vignettemap_new_png') as HTMLImageElement);

  gl.activeTexture(gl.TEXTURE4);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById('earlybirdblowout_png') as HTMLImageElement);

  gl.activeTexture(gl.TEXTURE5);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById('earlybirdmap_png') as HTMLImageElement);
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