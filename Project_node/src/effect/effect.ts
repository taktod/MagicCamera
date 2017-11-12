import {webgl} from "../util/webgl";

export var effect = (canvas:HTMLCanvasElement) => {
  canvas.style["display"] = "";
  var vertexSrc = `
attribute vec3 Position;
attribute vec2 UV;
uniform mat4 pjMat;
uniform mat4 mvMat;
varying vec2 textureCoordinate;

void main() {
  textureCoordinate = UV;
  gl_Position = pjMat * mvMat * vec4(Position, 1.0);
}
`;
  var fragSrc = `
precision mediump float;
    varying vec2 textureCoordinate;

    uniform sampler2D inputImageTexture;

//    uniform mediump vec2 singleStepOffset;
//    uniform mediump vec4 params;
//    uniform mediump float brightness;
    mediump float brightLevel = 0.5;
    mediump float beauty = 0.5;
    mediump float tone = 0.5;

    mediump vec2 singleStepOffset = vec2(2.0 / 640.0, 2.0 / 480.0);
    mediump vec4 params = vec4(1.0 - 0.6 * beauty, 1.0 - 0.3 * beauty, 0.1 + 0.3 * tone, 0.1 + 0.3 * tone);
    mediump float brightness = 0.6 * (-0.5 + brightLevel);
    const mediump mat3 saturateMatrix = mat3(
        1.1102, -0.0598, -0.061,
        -0.0774, 1.0826, -0.1186,
        -0.0228, -0.0228, 1.1772);
    const mediump vec3 W = vec3(0.299, 0.587, 0.114);
    mediump vec2 blurCoordinates[24];

    mediump float hardLight(mediump float color){
    if (color <= 0.5)
        color = color * color * 2.0;
    else
        color = 1.0 - ((1.0 - color)*(1.0 - color) * 2.0);
    return color;
}

    void main() {
    mediump vec3 centralColor = texture2D(inputImageTexture, textureCoordinate).rgb;
    blurCoordinates[0] = textureCoordinate.xy + singleStepOffset * vec2(0.0, -10.0);
    blurCoordinates[1] = textureCoordinate.xy + singleStepOffset * vec2(0.0, 10.0);
    blurCoordinates[2] = textureCoordinate.xy + singleStepOffset * vec2(-10.0, 0.0);
    blurCoordinates[3] = textureCoordinate.xy + singleStepOffset * vec2(10.0, 0.0);
    blurCoordinates[4] = textureCoordinate.xy + singleStepOffset * vec2(5.0, -8.0);
    blurCoordinates[5] = textureCoordinate.xy + singleStepOffset * vec2(5.0, 8.0);
    blurCoordinates[6] = textureCoordinate.xy + singleStepOffset * vec2(-5.0, 8.0);
    blurCoordinates[7] = textureCoordinate.xy + singleStepOffset * vec2(-5.0, -8.0);
    blurCoordinates[8] = textureCoordinate.xy + singleStepOffset * vec2(8.0, -5.0);
    blurCoordinates[9] = textureCoordinate.xy + singleStepOffset * vec2(8.0, 5.0);
    blurCoordinates[10] = textureCoordinate.xy + singleStepOffset * vec2(-8.0, 5.0);
    blurCoordinates[11] = textureCoordinate.xy + singleStepOffset * vec2(-8.0, -5.0);
    blurCoordinates[12] = textureCoordinate.xy + singleStepOffset * vec2(0.0, -6.0);
    blurCoordinates[13] = textureCoordinate.xy + singleStepOffset * vec2(0.0, 6.0);
    blurCoordinates[14] = textureCoordinate.xy + singleStepOffset * vec2(6.0, 0.0);
    blurCoordinates[15] = textureCoordinate.xy + singleStepOffset * vec2(-6.0, 0.0);
    blurCoordinates[16] = textureCoordinate.xy + singleStepOffset * vec2(-4.0, -4.0);
    blurCoordinates[17] = textureCoordinate.xy + singleStepOffset * vec2(-4.0, 4.0);
    blurCoordinates[18] = textureCoordinate.xy + singleStepOffset * vec2(4.0, -4.0);
    blurCoordinates[19] = textureCoordinate.xy + singleStepOffset * vec2(4.0, 4.0);
    blurCoordinates[20] = textureCoordinate.xy + singleStepOffset * vec2(-2.0, -2.0);
    blurCoordinates[21] = textureCoordinate.xy + singleStepOffset * vec2(-2.0, 2.0);
    blurCoordinates[22] = textureCoordinate.xy + singleStepOffset * vec2(2.0, -2.0);
    blurCoordinates[23] = textureCoordinate.xy + singleStepOffset * vec2(2.0, 2.0);

    mediump float sampleColor = centralColor.g * 22.0;
    sampleColor += texture2D(inputImageTexture, blurCoordinates[0]).g;
    sampleColor += texture2D(inputImageTexture, blurCoordinates[1]).g;
    sampleColor += texture2D(inputImageTexture, blurCoordinates[2]).g;
    sampleColor += texture2D(inputImageTexture, blurCoordinates[3]).g;
    sampleColor += texture2D(inputImageTexture, blurCoordinates[4]).g;
    sampleColor += texture2D(inputImageTexture, blurCoordinates[5]).g;
    sampleColor += texture2D(inputImageTexture, blurCoordinates[6]).g;
    sampleColor += texture2D(inputImageTexture, blurCoordinates[7]).g;
    sampleColor += texture2D(inputImageTexture, blurCoordinates[8]).g;
    sampleColor += texture2D(inputImageTexture, blurCoordinates[9]).g;
    sampleColor += texture2D(inputImageTexture, blurCoordinates[10]).g;
    sampleColor += texture2D(inputImageTexture, blurCoordinates[11]).g;
    sampleColor += texture2D(inputImageTexture, blurCoordinates[12]).g * 2.0;
    sampleColor += texture2D(inputImageTexture, blurCoordinates[13]).g * 2.0;
    sampleColor += texture2D(inputImageTexture, blurCoordinates[14]).g * 2.0;
    sampleColor += texture2D(inputImageTexture, blurCoordinates[15]).g * 2.0;
    sampleColor += texture2D(inputImageTexture, blurCoordinates[16]).g * 2.0;
    sampleColor += texture2D(inputImageTexture, blurCoordinates[17]).g * 2.0;
    sampleColor += texture2D(inputImageTexture, blurCoordinates[18]).g * 2.0;
    sampleColor += texture2D(inputImageTexture, blurCoordinates[19]).g * 2.0;
    sampleColor += texture2D(inputImageTexture, blurCoordinates[20]).g * 3.0;
    sampleColor += texture2D(inputImageTexture, blurCoordinates[21]).g * 3.0;
    sampleColor += texture2D(inputImageTexture, blurCoordinates[22]).g * 3.0;
    sampleColor += texture2D(inputImageTexture, blurCoordinates[23]).g * 3.0;

    sampleColor = sampleColor / 62.0;
    mediump float highPass = centralColor.g - sampleColor + 0.5;

    for (int i = 0; i < 5; i++) {
        highPass = hardLight(highPass);
    }
    mediump float luminance = dot(centralColor, W);

    mediump float alpha = pow(luminance, params.r);

    mediump vec3 smoothColor = centralColor + (centralColor-vec3(highPass))*alpha*0.1;

    smoothColor.r = clamp(pow(smoothColor.r, params.g), 0.0, 1.0);
    smoothColor.g = clamp(pow(smoothColor.g, params.g), 0.0, 1.0);
    smoothColor.b = clamp(pow(smoothColor.b, params.g), 0.0, 1.0);

    mediump vec3 lvse = vec3(1.0)-(vec3(1.0)-smoothColor)*(vec3(1.0)-centralColor);
    mediump vec3 bianliang = max(smoothColor, centralColor);
    mediump vec3 rouguang = 2.0*centralColor*smoothColor + centralColor*centralColor - 2.0*centralColor*centralColor*smoothColor;

    gl_FragColor = vec4(mix(centralColor, lvse, alpha), 1.0);
    gl_FragColor.rgb = mix(gl_FragColor.rgb, bianliang, alpha);
    gl_FragColor.rgb = mix(gl_FragColor.rgb, rouguang, params.b);

    mediump vec3 satcolor = gl_FragColor.rgb * saturateMatrix;
    gl_FragColor.rgb = mix(gl_FragColor.rgb, satcolor, params.a);
    gl_FragColor.rgb = vec3(gl_FragColor.rgb + vec3(brightness));
//    gl_FragColor = texture2D(inputImageTexture, textureCoordinate);
    }

`;
  var dummyArray = new Uint8Array(canvas.width * canvas.height * 4);

  var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
  var vShader = webgl.createShader(gl, vertexSrc, true);
  var fShader = webgl.createShader(gl, fragSrc, false);
  var program = webgl.createProgram(gl, vShader, fShader);

  var pjLocation = gl.getUniformLocation(program, 'pjMat');
  gl.uniformMatrix4fv(pjLocation, false, webgl.glCreateMat4Ortho(-canvas.width / 2, canvas.width / 2, -canvas.height / 2, canvas.height / 2, -1, 1));
  var mvLocation = gl.getUniformLocation(program, 'mvMat');
  gl.uniformMatrix4fv(mvLocation, false, webgl.glCreateMat4Identity());
  var captureTexLocation = gl.getUniformLocation(program, 'inputImageTexture');
  gl.uniform1i(captureTexLocation, 0); // texture0に割り当てておく。

  gl.activeTexture(gl.TEXTURE0);
  var videoTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, videoTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
//  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById('source') as HTMLVideoElement);
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