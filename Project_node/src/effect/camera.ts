// 通常のカメラ動作を実施するプログラム

export var camera = (camera:HTMLElement) => {
  camera.style["display"] = "inline-table";
  var video = camera.children[1] as HTMLVideoElement;
  navigator.mediaDevices.getUserMedia(
    {audio:false, video:{
      width:640
    } as any}
  )
  .then((stream) => {
    video.srcObject = stream;
    video.play();
  })
  .catch(() => {
  });
};
