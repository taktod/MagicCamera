import {webgl} from "../util/webgl";

export var crayon = (body:HTMLElement) => {
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
varying highp vec2 varyUV;
precision highp float;

uniform sampler2D camera;
uniform vec2 singleStepOffset;
uniform float strength;

const highp vec3 W = vec3(0.299,0.587,0.114);

const mat3 rgb2yiqMatrix = mat3(
    0.299, 0.587, 0.114,
    0.596,-0.275,-0.321,
    0.212,-0.523, 0.311);

const mat3 yiq2rgbMatrix = mat3(
    1.0, 0.956, 0.621,
    1.0,-0.272,-1.703,
    1.0,-1.106, 0.0);

void main() {
  vec4 oralColor = texture2D(camera, varyUV);

  vec3 maxValue = vec3(0.,0.,0.);

  for(int i = -2; i<=2; i++) {
    for(int j = -2; j<=2; j++) {
      vec4 tempColor = texture2D(camera, varyUV+singleStepOffset*vec2(i,j));
      maxValue.r = max(maxValue.r,tempColor.r);
      maxValue.g = max(maxValue.g,tempColor.g);
      maxValue.b = max(maxValue.b,tempColor.b);
    }
  }

  vec3 textureColor = oralColor.rgb / maxValue;

  float gray = dot(textureColor, W);
  float k = 0.223529;
  float alpha = min(gray,k)/k;

  textureColor = textureColor * alpha + (1.-alpha)*oralColor.rgb;

  vec3 yiqColor = textureColor * rgb2yiqMatrix;

  yiqColor.r = max(0.0,min(1.0,pow(gray,strength)));

  textureColor = yiqColor * yiq2rgbMatrix;

  gl_FragColor = vec4(textureColor, oralColor.w);
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
  var singleStepOffsetLocation = gl.getUniformLocation(program, 'singleStepOffset');
  gl.uniform2f(singleStepOffsetLocation, 1.0 / canvas.width, 1.0 / canvas.height);
  var strengthLocation = gl.getUniformLocation(program, 'strength');
  gl.uniform1f(strengthLocation, 3.0);
  slider.addEventListener("input", () => {
    gl.uniform1f(strengthLocation, 1.0 + Number(slider.value) / 25.0);
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