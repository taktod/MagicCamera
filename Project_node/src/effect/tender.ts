import {webgl} from "../util/webgl";

export var tender = (body:HTMLElement) => {
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
varying highp vec2 varyUV;
precision highp float;

uniform sampler2D camera;
uniform sampler2D curve;
uniform sampler2D grey1Frame;

void main() {
  mediump vec4 textureColor;
  mediump vec4 textureColorRes;
  vec4 grey1Color;
  mediump float satVal = 65.0 / 100.0;
  mediump float mask1R = 29.0 / 255.0;
  mediump float mask1G = 43.0 / 255.0;
  mediump float mask1B = 95.0 / 255.0;

  highp float xCoordinate = varyUV.x;
  highp float yCoordinate = varyUV.y;

  highp float redCurveValue;
  highp float greenCurveValue;
  highp float blueCurveValue;

  textureColor = texture2D( camera, vec2(xCoordinate, yCoordinate));
  textureColorRes = textureColor;

  grey1Color = texture2D(grey1Frame, vec2(xCoordinate, yCoordinate));

  // step1. saturation
  highp float G = (textureColor.r + textureColor.g + textureColor.b);
  G = G / 3.0;

  redCurveValue = ((1.0 - satVal) * G + satVal * textureColor.r);
  greenCurveValue = ((1.0 - satVal) * G + satVal * textureColor.g);
  blueCurveValue = ((1.0 - satVal) * G + satVal * textureColor.b);

  // step2 curve
  redCurveValue = texture2D(curve, vec2(textureColor.r, 0.0)).r;
  greenCurveValue = texture2D(curve, vec2(textureColor.g, 0.0)).g;
  blueCurveValue = texture2D(curve, vec2(textureColor.b, 0.0)).b;

  // step3 30% opacity  ExclusionBlending
  textureColor = vec4(redCurveValue, greenCurveValue, blueCurveValue, 1.0);
  mediump vec4 textureColor2 = vec4(mask1R, mask1G, mask1B, 1.0);
  textureColor2 = textureColor + textureColor2 - (2.0 * textureColor2 * textureColor);

  textureColor = (textureColor2 - textureColor) * 0.3 + textureColor;

  mediump vec4 overlay = vec4(0, 0, 0, 1.0);
  mediump vec4 base = vec4(textureColor.r, textureColor.g, textureColor.b, 1.0);

  // step4 overlay blending
  mediump float ra;
  if (base.r < 0.5) {
    ra = overlay.r * base.r * 2.0;
  }
  else {
    ra = 1.0 - ((1.0 - base.r) * (1.0 - overlay.r) * 2.0);
  }

  mediump float ga;
  if (base.g < 0.5) {
    ga = overlay.g * base.g * 2.0;
  }
  else {
    ga = 1.0 - ((1.0 - base.g) * (1.0 - overlay.g) * 2.0);
  }

  mediump float ba;
  if (base.b < 0.5) {
    ba = overlay.b * base.b * 2.0;
  }
  else {
    ba = 1.0 - ((1.0 - base.b) * (1.0 - overlay.b) * 2.0);
  }

  textureColor = vec4(ra, ga, ba, 1.0);
  base = (textureColor - base) * (grey1Color.r/2.0) + base;

  gl_FragColor = vec4(base.r, base.g, base.b, 1.0);
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
  var curveLocation = gl.getUniformLocation(program, 'curve');
  gl.uniform1i(curveLocation, 1);
  var grey1FrameLocation = gl.getUniformLocation(program, 'grey1Frame');
  gl.uniform1i(grey1FrameLocation, 2);

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
  // curveの内容を作成する
  var curveArray = new Uint8Array(1024);
  var arrayOfInt1 = [ 10, 12, 14, 15, 17, 19, 21, 22, 24, 26, 28, 29, 31, 33, 35, 38, 40, 41, 43, 45, 47, 48, 50, 52, 53, 55, 57, 58, 60, 61, 63, 65, 66, 68, 69, 71, 72, 74, 75, 77, 79, 80, 81, 83, 84, 86, 87, 89, 92, 93, 94, 96, 97, 99, 100, 101, 103, 104, 105, 107, 108, 109, 110, 112, 113, 114, 116, 117, 118, 119, 120, 122, 123, 124, 125, 126, 127, 129, 130, 131, 132, 133, 134, 135, 136, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 158, 159, 160, 161, 162, 163, 164, 165, 166, 166, 167, 168, 169, 170, 171, 171, 172, 173, 174, 175, 175, 176, 177, 178, 179, 179, 180, 181, 182, 182, 183, 184, 184, 185, 186, 187, 187, 188, 189, 189, 190, 191, 191, 192, 193, 193, 194, 195, 195, 196, 196, 197, 198, 198, 199, 200, 200, 201, 201, 202, 202, 203, 204, 204, 205, 205, 206, 206, 207, 207, 208, 209, 209, 210, 210, 211, 211, 212, 212, 213, 213, 214, 214, 215, 215, 216, 216, 216, 217, 217, 218, 218, 219, 219, 219, 220, 220, 221, 221, 222, 222, 223, 223, 224, 224, 224, 225, 225, 226, 226, 227, 227, 227, 228, 228, 229, 229, 230, 230, 230, 231, 231, 232, 232, 232, 233, 233, 234, 234, 234, 234, 235, 235, 236, 236, 236, 237, 237, 238, 238, 238, 239, 239, 240, 240, 240, 241, 241, 242, 242 ];
  var arrayOfInt2 = [ 10, 12, 14, 15, 17, 19, 19, 21, 22, 24, 26, 28, 29, 31, 33, 35, 36, 36, 38, 40, 41, 43, 45, 47, 48, 50, 52, 52, 53, 55, 57, 58, 60, 61, 63, 65, 66, 68, 69, 69, 71, 72, 74, 75, 77, 79, 80, 81, 83, 84, 86, 86, 87, 89, 90, 92, 93, 94, 96, 97, 99, 100, 101, 103, 103, 104, 105, 107, 108, 109, 110, 112, 113, 114, 116, 117, 118, 119, 120, 122, 122, 123, 124, 125, 126, 127, 129, 130, 131, 132, 133, 134, 135, 136, 138, 139, 140, 141, 142, 143, 144, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 158, 159, 160, 161, 162, 163, 164, 165, 166, 166, 167, 168, 169, 170, 171, 171, 172, 173, 174, 175, 175, 176, 177, 178, 179, 179, 180, 181, 182, 182, 183, 184, 184, 185, 186, 187, 187, 188, 189, 190, 191, 191, 192, 193, 193, 194, 195, 195, 196, 196, 197, 198, 198, 199, 200, 200, 201, 201, 202, 202, 204, 204, 205, 205, 206, 206, 207, 207, 208, 209, 209, 210, 210, 211, 211, 212, 213, 213, 214, 214, 215, 215, 216, 216, 217, 217, 218, 218, 219, 219, 220, 220, 221, 221, 222, 222, 223, 223, 224, 224, 224, 225, 226, 226, 227, 227, 227, 228, 228, 229, 229, 230, 230, 231, 231, 232, 232, 232, 233, 233, 234, 234, 234, 235, 236, 236, 236, 237, 237, 238, 238, 238, 239, 239, 240, 240, 241, 241, 242, 242 ];
  var arrayOfInt3 = [ 10, 12, 12, 14, 15, 15, 17, 17, 19, 21, 21, 22, 24, 24, 26, 28, 28, 29, 31, 31, 33, 33, 35, 36, 36, 38, 40, 40, 41, 43, 43, 45, 47, 47, 48, 50, 52, 52, 53, 55, 55, 57, 58, 58, 60, 61, 63, 63, 65, 66, 68, 68, 69, 71, 71, 72, 74, 75, 77, 77, 79, 80, 81, 81, 83, 84, 86, 87, 87, 89, 90, 92, 93, 94, 94, 96, 97, 99, 100, 101, 103, 103, 104, 105, 107, 108, 109, 110, 112, 113, 113, 114, 116, 117, 118, 119, 120, 122, 123, 124, 125, 126, 127, 129, 130, 130, 131, 132, 133, 134, 135, 136, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 154, 155, 156, 157, 158, 158, 159, 160, 161, 162, 163, 164, 165, 166, 166, 167, 169, 170, 171, 171, 172, 173, 174, 175, 175, 176, 178, 179, 179, 180, 181, 182, 182, 183, 184, 185, 186, 187, 187, 188, 189, 190, 191, 191, 192, 193, 193, 195, 195, 196, 196, 197, 198, 199, 200, 200, 201, 201, 202, 203, 204, 204, 205, 206, 206, 207, 207, 209, 209, 210, 210, 211, 212, 212, 213, 213, 214, 215, 215, 216, 217, 217, 218, 218, 219, 219, 220, 220, 221, 222, 222, 223, 223, 224, 224, 225, 225, 226, 227, 227, 227, 228, 229, 229, 230, 230, 231, 231, 232, 232, 233, 233, 234, 234, 235, 235, 236, 236, 237, 238, 238, 238, 239, 240, 240, 240, 241, 242, 242 ];
  var arrayOfInt4 = [ 0, 0, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 8, 8, 8, 9, 9, 10, 10, 10, 11, 11, 11, 12, 12, 13, 13, 13, 14, 14, 14, 15, 15, 16, 16, 16, 17, 17, 17, 18, 18, 18, 19, 19, 20, 20, 20, 21, 21, 21, 22, 22, 23, 23, 23, 24, 24, 24, 25, 25, 25, 25, 26, 26, 27, 27, 28, 28, 28, 28, 29, 29, 30, 29, 31, 31, 31, 31, 32, 32, 33, 33, 34, 34, 34, 34, 35, 35, 36, 36, 37, 37, 37, 38, 38, 39, 39, 39, 40, 40, 40, 41, 42, 42, 43, 43, 44, 44, 45, 45, 45, 46, 47, 47, 48, 48, 49, 50, 51, 51, 52, 52, 53, 53, 54, 55, 55, 56, 57, 57, 58, 59, 60, 60, 61, 62, 63, 63, 64, 65, 66, 67, 68, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 88, 89, 90, 91, 93, 94, 95, 96, 97, 98, 100, 101, 103, 104, 105, 107, 108, 110, 111, 113, 115, 116, 118, 119, 120, 122, 123, 125, 127, 128, 130, 132, 134, 135, 137, 139, 141, 143, 144, 146, 148, 150, 152, 154, 156, 158, 160, 163, 165, 167, 169, 171, 173, 175, 178, 180, 182, 185, 187, 189, 192, 194, 197, 199, 201, 204, 206, 209, 211, 214, 216, 219, 221, 224, 226, 229, 232, 234, 236, 239, 241, 245, 247, 250, 252, 255 ];
  for(var i = 0;i < 256;i ++) {
    curveArray[(i * 4)] = (arrayOfInt1[i]);
    curveArray[(1 + i * 4)] = (arrayOfInt2[i]);
    curveArray[(2 + i * 4)] = (arrayOfInt3[i]);
    curveArray[(3 + i * 4)] = (arrayOfInt4[i]);
  }
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, curveArray);

  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById('bluevintage_mask1_jpg') as HTMLImageElement);

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