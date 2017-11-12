import {webgl} from "../util/webgl";

export var sharpen = (body:HTMLElement) => {
  body.style["display"] = "inline-table";
  var canvas = body.getElementsByTagName("canvas")[0] as HTMLCanvasElement;
  var slider = body.getElementsByTagName("input")[0] as HTMLInputElement;
  var vertexSrc = `
attribute vec3 Position;
attribute vec2 UV;
uniform mat4 pjMat;
uniform mat4 mvMat;

uniform float widthStep;
uniform float heightStep;
uniform float sharpness;

varying vec2 varyUV;
varying vec2 varyLeftUV;
varying vec2 varyRightUV;
varying vec2 varyTopUV;
varying vec2 varyBottomUV;

varying float centerMultiplier;
varying float edgeMultiplier;

void main() {
  gl_Position = pjMat * mvMat * vec4(Position, 1.0);
  varyUV = UV;

  mediump vec2 vWidthStep  = vec2(widthStep, 0.0);
  mediump vec2 vHeightStep = vec2(0.0, heightStep);

  varyLeftUV   = UV - vWidthStep;
  varyRightUV  = UV + vWidthStep;
  varyTopUV    = UV + vHeightStep;
  varyBottomUV = UV - vHeightStep;

  centerMultiplier = 1.0 + 4.0 * sharpness;
  edgeMultiplier = sharpness;
}
`;
  var fragSrc = `
precision highp float;

varying highp vec2 varyUV;
varying highp vec2 varyLeftUV;
varying highp vec2 varyRightUV;
varying highp vec2 varyTopUV;
varying highp vec2 varyBottomUV;

varying highp float centerMultiplier;
varying highp float edgeMultiplier;

uniform sampler2D camera;

void main() {
  mediump vec3 textureColor = texture2D(camera, varyUV).rgb;
  mediump vec3 leftTextureColor = texture2D(camera, varyLeftUV).rgb;
  mediump vec3 rightTextureColor = texture2D(camera, varyRightUV).rgb;
  mediump vec3 topTextureColor = texture2D(camera, varyTopUV).rgb;
  mediump vec3 bottomTextureColor = texture2D(camera, varyBottomUV).rgb;

  gl_FragColor = vec4((textureColor * centerMultiplier - (leftTextureColor * edgeMultiplier + rightTextureColor * edgeMultiplier + topTextureColor * edgeMultiplier + bottomTextureColor * edgeMultiplier)), texture2D(camera, varyBottomUV).w);
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
  var widthStepLocation = gl.getUniformLocation(program, 'widthStep');
  gl.uniform1f(widthStepLocation, 1.0 / canvas.width);
  var heightStepLocation = gl.getUniformLocation(program, 'heightStep');
  gl.uniform1f(heightStepLocation, 1.0 / canvas.height);
  var sharpnessLocation = gl.getUniformLocation(program, 'sharpness');
  gl.uniform1f(sharpnessLocation, 0.0);
  slider.addEventListener("input", () => {
    gl.uniform1f(sharpnessLocation, Number(slider.value) / 12.5 - 4.0);
  });

  gl.activeTexture(gl.TEXTURE0);
  var videoTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, videoTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, dummyArray);

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