import {webgl} from "../util/webgl";

export var bilateralfilter = (body:HTMLElement) => {
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
varying vec2 varyUV;

uniform float distanceNormalizationFactor;
uniform vec2 singleStepOffset; 
void main() {
	vec4 centralColor = texture2D(camera, varyUV);

	vec2 blurCoordinates[24];
	vec2 blurStep;
	float gaussianWeightTotal;
	vec4 sum;
	vec4 sampleColor;
	float distanceFromCentralColor;
	float gaussianWeight;

	blurCoordinates[0] = varyUV.xy + singleStepOffset * vec2(-4.,-4.);
	blurCoordinates[1] = varyUV.xy + singleStepOffset * vec2(4.,-4.);
	blurCoordinates[2] = varyUV.xy + singleStepOffset * vec2(-4.,4.);
	blurCoordinates[3] = varyUV.xy + singleStepOffset * vec2(4.,4.);

	blurCoordinates[4] = varyUV.xy + singleStepOffset * vec2(-3.,-3.);
	blurCoordinates[5] = varyUV.xy + singleStepOffset * vec2(3.,-3.);
	blurCoordinates[6] = varyUV.xy + singleStepOffset * vec2(-3.,3.);
	blurCoordinates[7] = varyUV.xy + singleStepOffset * vec2(3.,3.);

	blurCoordinates[8] = varyUV.xy + singleStepOffset * vec2(-2.,-2.);
	blurCoordinates[9] = varyUV.xy + singleStepOffset * vec2(2.,-2.);
	blurCoordinates[10] = varyUV.xy + singleStepOffset * vec2(2.,2.);
	blurCoordinates[11] = varyUV.xy + singleStepOffset * vec2(-2.,2.);

	blurCoordinates[12] = varyUV.xy + singleStepOffset * vec2(1.,1.);
	blurCoordinates[13] = varyUV.xy + singleStepOffset * vec2(1.,-1.);
	blurCoordinates[14] = varyUV.xy + singleStepOffset * vec2(-1.,1.);
	blurCoordinates[15] = varyUV.xy + singleStepOffset * vec2(-1.,-1.);

	blurCoordinates[16] = varyUV.xy + singleStepOffset * vec2(0.,-4.);
	blurCoordinates[17] = varyUV.xy + singleStepOffset * vec2(4.,0.);
	blurCoordinates[18] = varyUV.xy + singleStepOffset * vec2(-4.,0);
	blurCoordinates[19] = varyUV.xy + singleStepOffset * vec2(0.,4.);

	blurCoordinates[20] = varyUV.xy + singleStepOffset * vec2(0.,-2.);
	blurCoordinates[21] = varyUV.xy + singleStepOffset * vec2(2.,0.);
	blurCoordinates[22] = varyUV.xy + singleStepOffset * vec2(-2.,0);
	blurCoordinates[23] = varyUV.xy + singleStepOffset * vec2(0.,2.);

	gaussianWeightTotal = 0.4;
	sum = centralColor * 0.4;

	sampleColor = texture2D(camera, blurCoordinates[0]);
	distanceFromCentralColor = min(distance(centralColor, sampleColor) * distanceNormalizationFactor, 1.0);
	gaussianWeight = 0.05 * (1.0 - distanceFromCentralColor);
	gaussianWeightTotal += gaussianWeight;
	sum += sampleColor * gaussianWeight;
	sampleColor = texture2D(camera, blurCoordinates[1]);
	distanceFromCentralColor = min(distance(centralColor, sampleColor) * distanceNormalizationFactor, 1.0);
	gaussianWeight = 0.05 * (1.0 - distanceFromCentralColor);
	gaussianWeightTotal += gaussianWeight;
	sum += sampleColor * gaussianWeight;
	sampleColor = texture2D(camera, blurCoordinates[2]);
	distanceFromCentralColor = min(distance(centralColor, sampleColor) * distanceNormalizationFactor, 1.0);
	gaussianWeight = 0.05 * (1.0 - distanceFromCentralColor);
	gaussianWeightTotal += gaussianWeight;
	sum += sampleColor * gaussianWeight;
	sampleColor = texture2D(camera, blurCoordinates[3]);
	distanceFromCentralColor = min(distance(centralColor, sampleColor) * distanceNormalizationFactor, 1.0);
	gaussianWeight = 0.05 * (1.0 - distanceFromCentralColor);
	gaussianWeightTotal += gaussianWeight;
	sum += sampleColor * gaussianWeight;

	sampleColor = texture2D(camera, blurCoordinates[4]);
	distanceFromCentralColor = min(distance(centralColor, sampleColor) * distanceNormalizationFactor, 1.0);
	gaussianWeight = 0.09 * (1.0 - distanceFromCentralColor);
	gaussianWeightTotal += gaussianWeight;
	sum += sampleColor * gaussianWeight;
	sampleColor = texture2D(camera, blurCoordinates[5]);
	distanceFromCentralColor = min(distance(centralColor, sampleColor) * distanceNormalizationFactor, 1.0);
	gaussianWeight = 0.09 * (1.0 - distanceFromCentralColor);
	gaussianWeightTotal += gaussianWeight;
	sum += sampleColor * gaussianWeight;
	sampleColor = texture2D(camera, blurCoordinates[6]);
	distanceFromCentralColor = min(distance(centralColor, sampleColor) * distanceNormalizationFactor, 1.0);
	gaussianWeight = 0.09 * (1.0 - distanceFromCentralColor);
	gaussianWeightTotal += gaussianWeight;
	sum += sampleColor * gaussianWeight;
	sampleColor = texture2D(camera, blurCoordinates[7]);
	distanceFromCentralColor = min(distance(centralColor, sampleColor) * distanceNormalizationFactor, 1.0);
	gaussianWeight = 0.09 * (1.0 - distanceFromCentralColor);
	gaussianWeightTotal += gaussianWeight;
	sum += sampleColor * gaussianWeight;

	sampleColor = texture2D(camera, blurCoordinates[8]);
	distanceFromCentralColor = min(distance(centralColor, sampleColor) * distanceNormalizationFactor, 1.0);
	gaussianWeight = 0.12 * (1.0 - distanceFromCentralColor);
	gaussianWeightTotal += gaussianWeight;
	sum += sampleColor * gaussianWeight;
	sampleColor = texture2D(camera, blurCoordinates[9]);
	distanceFromCentralColor = min(distance(centralColor, sampleColor) * distanceNormalizationFactor, 1.0);
	gaussianWeight = 0.12 * (1.0 - distanceFromCentralColor);
	gaussianWeightTotal += gaussianWeight;
	sum += sampleColor * gaussianWeight;
	sampleColor = texture2D(camera, blurCoordinates[10]);
	distanceFromCentralColor = min(distance(centralColor, sampleColor) * distanceNormalizationFactor, 1.0);
	gaussianWeight = 0.12 * (1.0 - distanceFromCentralColor);
	gaussianWeightTotal += gaussianWeight;
	sum += sampleColor * gaussianWeight;
	sampleColor = texture2D(camera, blurCoordinates[11]);
	distanceFromCentralColor = min(distance(centralColor, sampleColor) * distanceNormalizationFactor, 1.0);
	gaussianWeight = 0.12 * (1.0 - distanceFromCentralColor);
	gaussianWeightTotal += gaussianWeight;
	sum += sampleColor * gaussianWeight;

	sampleColor = texture2D(camera, blurCoordinates[12]);
	distanceFromCentralColor = min(distance(centralColor, sampleColor) * distanceNormalizationFactor, 1.0);
	gaussianWeight = 0.15 * (1.0 - distanceFromCentralColor);
	gaussianWeightTotal += gaussianWeight;
	sum += sampleColor * gaussianWeight;
	sampleColor = texture2D(camera, blurCoordinates[13]);
	distanceFromCentralColor = min(distance(centralColor, sampleColor) * distanceNormalizationFactor, 1.0);
	gaussianWeight = 0.15 * (1.0 - distanceFromCentralColor);
	gaussianWeightTotal += gaussianWeight;
	sum += sampleColor * gaussianWeight;
	sampleColor = texture2D(camera, blurCoordinates[14]);
	distanceFromCentralColor = min(distance(centralColor, sampleColor) * distanceNormalizationFactor, 1.0);
	gaussianWeight = 0.15 * (1.0 - distanceFromCentralColor);
	gaussianWeightTotal += gaussianWeight;
	sum += sampleColor * gaussianWeight;
	sampleColor = texture2D(camera, blurCoordinates[15]);
	distanceFromCentralColor = min(distance(centralColor, sampleColor) * distanceNormalizationFactor, 1.0);
	gaussianWeight = 0.15 * (1.0 - distanceFromCentralColor);
	gaussianWeightTotal += gaussianWeight;
	sum += sampleColor * gaussianWeight;

	sampleColor = texture2D(camera, blurCoordinates[16]);
	distanceFromCentralColor = min(distance(centralColor, sampleColor) * distanceNormalizationFactor, 1.0);
	gaussianWeight = 0.07 * (1.0 - distanceFromCentralColor);
	gaussianWeightTotal += gaussianWeight;
	sum += sampleColor * gaussianWeight;
	sampleColor = texture2D(camera, blurCoordinates[17]);
	distanceFromCentralColor = min(distance(centralColor, sampleColor) * distanceNormalizationFactor, 1.0);
	gaussianWeight = 0.07 * (1.0 - distanceFromCentralColor);
	gaussianWeightTotal += gaussianWeight;
	sum += sampleColor * gaussianWeight;
	sampleColor = texture2D(camera, blurCoordinates[18]);
	distanceFromCentralColor = min(distance(centralColor, sampleColor) * distanceNormalizationFactor, 1.0);
	gaussianWeight = 0.07 * (1.0 - distanceFromCentralColor);
	gaussianWeightTotal += gaussianWeight;
	sum += sampleColor * gaussianWeight;
	sampleColor = texture2D(camera, blurCoordinates[19]);
	distanceFromCentralColor = min(distance(centralColor, sampleColor) * distanceNormalizationFactor, 1.0);
	gaussianWeight = 0.07 * (1.0 - distanceFromCentralColor);
	gaussianWeightTotal += gaussianWeight;
	sum += sampleColor * gaussianWeight; 

	sampleColor = texture2D(camera, blurCoordinates[20]);
	distanceFromCentralColor = min(distance(centralColor, sampleColor) * distanceNormalizationFactor, 1.0);
	gaussianWeight = 0.11 * (1.0 - distanceFromCentralColor);
	gaussianWeightTotal += gaussianWeight;
	sum += sampleColor * gaussianWeight;
	sampleColor = texture2D(camera, blurCoordinates[21]);
	distanceFromCentralColor = min(distance(centralColor, sampleColor) * distanceNormalizationFactor, 1.0);
	gaussianWeight = 0.11 * (1.0 - distanceFromCentralColor);
	gaussianWeightTotal += gaussianWeight;
	sum += sampleColor * gaussianWeight;
	sampleColor = texture2D(camera, blurCoordinates[22]);
	distanceFromCentralColor = min(distance(centralColor, sampleColor) * distanceNormalizationFactor, 1.0);
	gaussianWeight = 0.11 * (1.0 - distanceFromCentralColor);
	gaussianWeightTotal += gaussianWeight;
	sum += sampleColor * gaussianWeight;
	sampleColor = texture2D(camera, blurCoordinates[23]);
	distanceFromCentralColor = min(distance(centralColor, sampleColor) * distanceNormalizationFactor, 1.0);
	gaussianWeight = 0.11 * (1.0 - distanceFromCentralColor);
	gaussianWeightTotal += gaussianWeight;
	sum += sampleColor * gaussianWeight;

	gl_FragColor = sum / gaussianWeightTotal;
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
  var distanceNormalizationFactorLocation = gl.getUniformLocation(program, 'distanceNormalizationFactor');
  gl.uniform1f(distanceNormalizationFactorLocation, 2.0);
  slider.addEventListener("input", () => {
    gl.uniform1f(distanceNormalizationFactorLocation, Number(slider.value) / 25.0);
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