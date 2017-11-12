// webglの動作ヘルパー
export var webgl = {
  createShader: (gl:WebGLRenderingContext, source:string, is_vertex:boolean):WebGLShader => {
    var shader:WebGLShader;
    if(is_vertex) {
      shader = gl.createShader(gl.VERTEX_SHADER);
    }
    else {
      shader = gl.createShader(gl.FRAGMENT_SHADER);
    }
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      return shader;
    }
    else {
      console.error("failed to make shader.");
      return null;
    }
  },
  createProgram: (gl:WebGLRenderingContext, vs:WebGLShader, fs:WebGLShader):WebGLProgram => {
    var program = gl.createProgram();
      
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
      
    if(gl.getProgramParameter(program, gl.LINK_STATUS)){
      gl.useProgram(program);
      return program;
    }
    else{
      console.error("failed to make program");
      return null;
    }
  },
  glCreateMat4Ortho: 
      (left, right, bottom, top, near, far) => {
    var rl = right - left;
    var tb = top - bottom;
    var fn = far - near;
    var tx = -(right + left) / (right - left);
    var ty = -(top + bottom) / (top - bottom);
    var tz = -(far + near) / (far - near);
    return new Float32Array([
      2.0 / rl, 0.0, 0.0, tx,
      0.0, 2.0 / tb, 0.0, ty,
      0.0, 0.0, 2.0 / fn, tz,
      0.0, 0.0, 0.0, 1.0
    ]);
  },
  glCreateMat4Identity: () => {
    return new Float32Array([
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0
    ]);
  }
};