import {webgl} from "../util/webgl";

export var toaster2 = (body:HTMLElement) => {
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
uniform sampler2D toaster_metal;
uniform sampler2D toaster_soft_light;
uniform sampler2D toaster_curves;
uniform sampler2D toaster_overlay_map_warm;
uniform sampler2D toaster_color_shift;

void main() {
  mediump vec3 texel;
  mediump vec2 lookup;
  vec2 blue;
  vec2 green;
  vec2 red;
  mediump vec4 tmpvar_1;
  tmpvar_1 = texture2D (camera, varyUV);
  texel = tmpvar_1.xyz;
  mediump vec4 tmpvar_2;
  tmpvar_2 = texture2D (toaster_metal, varyUV);
  mediump vec2 tmpvar_3;
  tmpvar_3.x = tmpvar_2.x;
  tmpvar_3.y = tmpvar_1.x;
  texel.x = texture2D (toaster_soft_light, tmpvar_3).x;
  mediump vec2 tmpvar_4;
  tmpvar_4.x = tmpvar_2.y;
  tmpvar_4.y = tmpvar_1.y;
  texel.y = texture2D (toaster_soft_light, tmpvar_4).y;
  mediump vec2 tmpvar_5;
  tmpvar_5.x = tmpvar_2.z;
  tmpvar_5.y = tmpvar_1.z;
  texel.z = texture2D (toaster_soft_light, tmpvar_5).z;
  red.x = texel.x;
  red.y = 0.16666;
  green.x = texel.y;
  green.y = 0.5;
  blue.x = texel.z;
  blue.y = 0.833333;
  texel.x = texture2D (toaster_curves, red).x;
  texel.y = texture2D (toaster_curves, green).y;
  texel.z = texture2D (toaster_curves, blue).z;
  mediump vec2 tmpvar_6;
  tmpvar_6 = ((2.0 * varyUV) - 1.0);
  mediump vec2 tmpvar_7;
  tmpvar_7.x = dot (tmpvar_6, tmpvar_6);
  tmpvar_7.y = texel.x;
  lookup = tmpvar_7;
  texel.x = texture2D (toaster_overlay_map_warm, tmpvar_7).x;
  lookup.y = texel.y;
  texel.y = texture2D (toaster_overlay_map_warm, lookup).y;
  lookup.y = texel.z;
  texel.z = texture2D (toaster_overlay_map_warm, lookup).z;
  red.x = texel.x;
  green.x = texel.y;
  blue.x = texel.z;
  texel.x = texture2D (toaster_color_shift, red).x;
  texel.y = texture2D (toaster_color_shift, green).y;
  texel.z = texture2D (toaster_color_shift, blue).z;
  mediump vec4 tmpvar_8;
  tmpvar_8.w = 1.0;
  tmpvar_8.xyz = texel;
  gl_FragColor = tmpvar_8;
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
  var toaster_metalLocation = gl.getUniformLocation(program, 'toaster_metal');
  gl.uniform1i(toaster_metalLocation, 1);
  var toaster_soft_lightLocation = gl.getUniformLocation(program, 'toaster_soft_light');
  gl.uniform1i(toaster_soft_lightLocation, 2);
  var toaster_curvesLocation = gl.getUniformLocation(program, 'toaster_curves');
  gl.uniform1i(toaster_curvesLocation, 3);
  var toaster_overlay_map_warmLocation = gl.getUniformLocation(program, 'toaster_overlay_map_warm');
  gl.uniform1i(toaster_overlay_map_warmLocation, 4);
  var toaster_color_shiftLocation = gl.getUniformLocation(program, 'toaster_color_shift');
  gl.uniform1i(toaster_color_shiftLocation, 5);

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
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById('toastermetal_png') as HTMLImageElement);

	gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById('toastersoftlight_png') as HTMLImageElement);

	gl.activeTexture(gl.TEXTURE3);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById('toastercurves_png') as HTMLImageElement);

	gl.activeTexture(gl.TEXTURE4);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById('toasteroverlaymapwarm_png') as HTMLImageElement);

	gl.activeTexture(gl.TEXTURE5);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById('toastercolorshift_png') as HTMLImageElement);

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