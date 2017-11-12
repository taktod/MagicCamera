import {webgl} from "../util/webgl";

export var beautify_fragment = (body:HTMLElement) => {
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

uniform sampler2D camera;
uniform vec2 singleStepOffset; 
uniform highp vec4 params; 

varying highp vec2 varyUV;

const highp vec3 W = vec3(0.299,0.587,0.114);
const mat3 saturateMatrix = mat3(
                                1.1102,-0.0598,-0.061,
                                -0.0774,1.0826,-0.1186,
                                -0.0228,-0.0228,1.1772);

float hardlight(float color) {
  if(color <= 0.5) {
    color = color * color * 2.0;
  }
  else {
    color = 1.0 - ((1.0 - color)*(1.0 - color) * 2.0);
  }
  return color;
}

void main() {
  vec2 blurCoordinates[24];

  blurCoordinates[0] = varyUV.xy + singleStepOffset * vec2(0.0, -10.0);
  blurCoordinates[1] = varyUV.xy + singleStepOffset * vec2(0.0, 10.0);
  blurCoordinates[2] = varyUV.xy + singleStepOffset * vec2(-10.0, 0.0);
  blurCoordinates[3] = varyUV.xy + singleStepOffset * vec2(10.0, 0.0);

  blurCoordinates[4] = varyUV.xy + singleStepOffset * vec2(5.0, -8.0);
  blurCoordinates[5] = varyUV.xy + singleStepOffset * vec2(5.0, 8.0);
  blurCoordinates[6] = varyUV.xy + singleStepOffset * vec2(-5.0, 8.0);
  blurCoordinates[7] = varyUV.xy + singleStepOffset * vec2(-5.0, -8.0);

  blurCoordinates[8] = varyUV.xy + singleStepOffset * vec2(8.0, -5.0);
  blurCoordinates[9] = varyUV.xy + singleStepOffset * vec2(8.0, 5.0);
  blurCoordinates[10] = varyUV.xy + singleStepOffset * vec2(-8.0, 5.0);
  blurCoordinates[11] = varyUV.xy + singleStepOffset * vec2(-8.0, -5.0);

  blurCoordinates[12] = varyUV.xy + singleStepOffset * vec2(0.0, -6.0);
  blurCoordinates[13] = varyUV.xy + singleStepOffset * vec2(0.0, 6.0);
  blurCoordinates[14] = varyUV.xy + singleStepOffset * vec2(6.0, 0.0);
  blurCoordinates[15] = varyUV.xy + singleStepOffset * vec2(-6.0, 0.0);

  blurCoordinates[16] = varyUV.xy + singleStepOffset * vec2(-4.0, -4.0);
  blurCoordinates[17] = varyUV.xy + singleStepOffset * vec2(-4.0, 4.0);
  blurCoordinates[18] = varyUV.xy + singleStepOffset * vec2(4.0, -4.0);
  blurCoordinates[19] = varyUV.xy + singleStepOffset * vec2(4.0, 4.0);

  blurCoordinates[20] = varyUV.xy + singleStepOffset * vec2(-2.0, -2.0);
  blurCoordinates[21] = varyUV.xy + singleStepOffset * vec2(-2.0, 2.0);
  blurCoordinates[22] = varyUV.xy + singleStepOffset * vec2(2.0, -2.0);
  blurCoordinates[23] = varyUV.xy + singleStepOffset * vec2(2.0, 2.0);


  float sampleColor = texture2D(camera, varyUV).g * 22.0;
  sampleColor += texture2D(camera, blurCoordinates[0]).g;
  sampleColor += texture2D(camera, blurCoordinates[1]).g;
  sampleColor += texture2D(camera, blurCoordinates[2]).g;
  sampleColor += texture2D(camera, blurCoordinates[3]).g;
  sampleColor += texture2D(camera, blurCoordinates[4]).g;
  sampleColor += texture2D(camera, blurCoordinates[5]).g;
  sampleColor += texture2D(camera, blurCoordinates[6]).g;
  sampleColor += texture2D(camera, blurCoordinates[7]).g;
  sampleColor += texture2D(camera, blurCoordinates[8]).g;
  sampleColor += texture2D(camera, blurCoordinates[9]).g;
  sampleColor += texture2D(camera, blurCoordinates[10]).g;
  sampleColor += texture2D(camera, blurCoordinates[11]).g;

  sampleColor += texture2D(camera, blurCoordinates[12]).g * 2.0;
  sampleColor += texture2D(camera, blurCoordinates[13]).g * 2.0;
  sampleColor += texture2D(camera, blurCoordinates[14]).g * 2.0;
  sampleColor += texture2D(camera, blurCoordinates[15]).g * 2.0;
  sampleColor += texture2D(camera, blurCoordinates[16]).g * 2.0;
  sampleColor += texture2D(camera, blurCoordinates[17]).g * 2.0;
  sampleColor += texture2D(camera, blurCoordinates[18]).g * 2.0;
  sampleColor += texture2D(camera, blurCoordinates[19]).g * 2.0;

  sampleColor += texture2D(camera, blurCoordinates[20]).g * 3.0;
  sampleColor += texture2D(camera, blurCoordinates[21]).g * 3.0;
  sampleColor += texture2D(camera, blurCoordinates[22]).g * 3.0;
  sampleColor += texture2D(camera, blurCoordinates[23]).g * 3.0;

  sampleColor = sampleColor / 62.0;

  vec3 centralColor = texture2D(camera, varyUV).rgb;

  float highpass = centralColor.g - sampleColor + 0.5;

  for(int i = 0; i < 5;i++) {
    highpass = hardlight(highpass);
  }
  float lumance = dot(centralColor, W);

  float alpha = pow(lumance, params.r);

  vec3 smoothColor = centralColor + (centralColor-vec3(highpass))*alpha*0.1;

  smoothColor.r = clamp(pow(smoothColor.r, params.g),0.0,1.0);
  smoothColor.g = clamp(pow(smoothColor.g, params.g),0.0,1.0);
  smoothColor.b = clamp(pow(smoothColor.b, params.g),0.0,1.0);

  vec3 lvse = vec3(1.0)-(vec3(1.0)-smoothColor)*(vec3(1.0)-centralColor);
  vec3 bianliang = max(smoothColor, centralColor);
  vec3 rouguang = 2.0*centralColor*smoothColor + centralColor*centralColor - 2.0*centralColor*centralColor*smoothColor;

  gl_FragColor = vec4(mix(centralColor, lvse, alpha), 1.0);
  gl_FragColor.rgb = mix(gl_FragColor.rgb, bianliang, alpha);
  gl_FragColor.rgb = mix(gl_FragColor.rgb, rouguang, params.b);

  vec3 satcolor = gl_FragColor.rgb * saturateMatrix;
  gl_FragColor.rgb = mix(gl_FragColor.rgb, satcolor, params.a);
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
  gl.uniform2f(singleStepOffsetLocation, 2.0 / canvas.width, 2.0 / canvas.height);
  var paramsLocation = gl.getUniformLocation(program, 'params');
  var level = 4;
  slider.value = "100";
  slider.step = "25";
  switch(level) {
  case 0:
    gl.uniform4f(paramsLocation, 1.0, 1.0, 0.15, 0.15);
    break;
  case 1:
    gl.uniform4f(paramsLocation, 0.8, 0.9, 0.2, 0.2);
    break;
  case 2:
    gl.uniform4f(paramsLocation, 0.6, 0.8, 0.25, 0.25);
    break;
  case 3:
    gl.uniform4f(paramsLocation, 0.4, 0.7, 0.38, 0.3);
    break;
  case 4:
  default:
    gl.uniform4f(paramsLocation, 0.33, 0.63, 0.4, 0.35);
    break;
  }
  slider.addEventListener("input", () => {
    level = Number(slider.value) / 25;
    switch(level) {
    case 0:
      gl.uniform4f(paramsLocation, 1.0, 1.0, 0.15, 0.15);
      break;
    case 1:
      gl.uniform4f(paramsLocation, 0.8, 0.9, 0.2, 0.2);
      break;
    case 2:
      gl.uniform4f(paramsLocation, 0.6, 0.8, 0.25, 0.25);
      break;
    case 3:
      gl.uniform4f(paramsLocation, 0.4, 0.7, 0.38, 0.3);
      break;
    case 4:
    default:
      gl.uniform4f(paramsLocation, 0.33, 0.63, 0.4, 0.35);
      break;
    }
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