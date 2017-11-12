import {webgl} from "../util/webgl";

export var brannan = (body:HTMLElement) => {
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
precision mediump float;

varying mediump vec2 varyUV;

uniform sampler2D camera;
uniform sampler2D process;
uniform sampler2D blowout;
uniform sampler2D contrast;
uniform sampler2D luma;
uniform sampler2D screen;

mat3 saturateMatrix = mat3(
                          1.105150,
                          -0.044850,
                          -0.046000,
                          -0.088050,
                          1.061950,
                          -0.089200,
                          -0.017100,
                          -0.017100,
                          1.132900);

vec3 lumaVec = vec3(.3, .59, .11);

uniform float strength;

void main() {
  vec4 originColor = texture2D(camera, varyUV);
  vec3 texel = texture2D(camera, varyUV).rgb;

  vec2 lookup;
  lookup.y = 0.5;
  lookup.x = texel.r;
  texel.r = texture2D(process, lookup).r;
  lookup.x = texel.g;
  texel.g = texture2D(process, lookup).g;
  lookup.x = texel.b;
  texel.b = texture2D(process, lookup).b;

  texel = saturateMatrix * texel;

  vec2 tc = (2.0 * varyUV) - 1.0;
  float d = dot(tc, tc);
  vec3 sampled;
  lookup.y = 0.5;
  lookup.x = texel.r;
  sampled.r = texture2D(blowout, lookup).r;
  lookup.x = texel.g;
  sampled.g = texture2D(blowout, lookup).g;
  lookup.x = texel.b;
  sampled.b = texture2D(blowout, lookup).b;
  float value = smoothstep(0.0, 1.0, d);
  texel = mix(sampled, texel, value);

  lookup.x = texel.r;
  texel.r = texture2D(contrast, lookup).r;
  lookup.x = texel.g;
  texel.g = texture2D(contrast, lookup).g;
  lookup.x = texel.b;
  texel.b = texture2D(contrast, lookup).b;

  lookup.x = dot(texel, lumaVec);
  texel = mix(texture2D(luma, lookup).rgb, texel, .5);

  lookup.x = texel.r;
  texel.r = texture2D(screen, lookup).r;
  lookup.x = texel.g;
  texel.g = texture2D(screen, lookup).g;
  lookup.x = texel.b;
  texel.b = texture2D(screen, lookup).b;

  texel = mix(originColor.rgb, texel.rgb, strength);

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
  var processLocation = gl.getUniformLocation(program, 'process');
  gl.uniform1i(processLocation, 1); // texture1に割り当てておく。
  var blowoutLocation = gl.getUniformLocation(program, 'blowout');
  gl.uniform1i(blowoutLocation, 2); // texture1に割り当てておく。
  var contrastLocation = gl.getUniformLocation(program, 'contrast');
  gl.uniform1i(contrastLocation, 3); // texture1に割り当てておく。
  var lumaLocation = gl.getUniformLocation(program, 'luma');
  gl.uniform1i(lumaLocation, 4); // texture1に割り当てておく。
  var screenLocation = gl.getUniformLocation(program, 'screen');
  gl.uniform1i(screenLocation, 5); // texture1に割り当てておく。
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
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById('brannan_process_png') as HTMLImageElement);

  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById('brannan_blowout_png') as HTMLImageElement);

  gl.activeTexture(gl.TEXTURE3);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById('brannan_contrast_png') as HTMLImageElement);

  gl.activeTexture(gl.TEXTURE4);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById('brannan_luma_png') as HTMLImageElement);

  gl.activeTexture(gl.TEXTURE5);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById('brannan_screen_png') as HTMLImageElement);

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