// カメラ
import {camera} from "./effect/camera";

// 基本変換
import {brightness} from "./effect/brightness";
import {contrast}   from "./effect/contrast";
import {exposure}   from "./effect/exposure";
import {hue}        from "./effect/hue";
import {saturation} from "./effect/saturation";
import {sharpen}    from "./effect/sharpen";

// 特殊変換
import {amaro}                 from "./effect/amaro";
import {antique}               from "./effect/antique";
import {beautify_fragment}     from "./effect/beautify_fragment";
import {beautify_fragment_low} from "./effect/beautify_fragment_low";
import {bilateralfilter}       from "./effect/bilateralfilter";
import {bilateralfilter_low}   from "./effect/bilateralfilter_low";
import {blackcat}              from "./effect/blackcat";
import {brannan}               from "./effect/brannan";
import {brooklyn}              from "./effect/brooklyn";
import {calm}                  from "./effect/calm";
import {cool}                  from "./effect/cool";
import {crayon}                from "./effect/crayon";
import {earlybird}             from "./effect/earlybird";
import {emerald}               from "./effect/emerald";
import {evergreen}             from "./effect/evergreen";
import {fairytale}             from "./effect/fairytale";
import {freud}                 from "./effect/freud";
import {healthy}               from "./effect/healthy";
import {hefe}                  from "./effect/hefe";
import {hudson}                from "./effect/hudson";
import {inkwell}               from "./effect/inkwell";
import {kevin_new}             from "./effect/kevin_new";
import {latte}                 from "./effect/latte";
import {lomo}                  from "./effect/lomo";
import {n1977}                 from "./effect/n1977";
import {nashville}             from "./effect/nashville";
import {nostalgia}             from "./effect/nostalgia";
import {pixar}                 from "./effect/pixar";
import {rise}                  from "./effect/rise";
import {romance}               from "./effect/romance";
import {sakura}                from "./effect/sakura";
import {sierra}                from "./effect/sierra";
import {sketch}                from "./effect/sketch";
import {skinwhiten}            from "./effect/skinwhiten";
import {sunrise}               from "./effect/sunrise";
import {sunset}                from "./effect/sunset";
import {sutro}                 from "./effect/sutro";
import {sweets}                from "./effect/sweets";
import {tender}                from "./effect/tender";
import {toaster2}              from "./effect/toaster2";
import {walden}                from "./effect/walden";
import {warm}                  from "./effect/warm";
import {whitecat}              from "./effect/whitecat";
import {xproii}                from "./effect/xproii";

window.onload = () => {
  var event = new Event("refresh");
  var render = () => {
    // eventをcallすることで、それぞれの処理を促すことにする。
    window.dispatchEvent(event);
//    requestAnimationFrame(render);
  };
//  render();
  setInterval(render, 50);
  camera(document.getElementById("camera"));

//  brightness(document.getElementById("brightness"));
//  contrast(  document.getElementById("contrast"));
//  exposure(  document.getElementById("exposure"));
//  hue(       document.getElementById("hue"));
//  saturation(document.getElementById("saturation"));
//  sharpen(   document.getElementById("sharpen"));

//  amaro(                document.getElementById("amaro"));
//  antique(              document.getElementById("antique"));
  beautify_fragment(    document.getElementById("beautify_fragment"));
//  beautify_fragment_low(document.getElementById("beautify_fragment_low"));
//  bilateralfilter(      document.getElementById("bilateralfilter"));
//  bilateralfilter_low(  document.getElementById("bilateralfilter_low"));
//  blackcat(             document.getElementById("blackcat"));
//  brannan(              document.getElementById("brannan"));
//  brooklyn(             document.getElementById("brooklyn"));
//  calm(                 document.getElementById("calm"));
//  cool(                 document.getElementById("cool"));
//  crayon(               document.getElementById("crayon"));
//  earlybird(            document.getElementById("earlybird"));
//  emerald(              document.getElementById("emerald"));
//  evergreen(            document.getElementById("evergreen"));
//  fairytale(            document.getElementById("fairytale"));
//  freud(                document.getElementById("freud"));
//  healthy(              document.getElementById("healthy"));
//  hefe(                 document.getElementById("hefe"));
//  hudson(               document.getElementById("hudson"));
//  inkwell(              document.getElementById("inkwell"));
//  kevin_new(            document.getElementById("kevin_new"));
//  latte(                document.getElementById("latte"));
//  lomo(                 document.getElementById("lomo"));
  n1977(                document.getElementById("n1977"));
  nashville(            document.getElementById("nashville"));
  nostalgia(            document.getElementById("nostalgia"));
//  pixar(                document.getElementById("pixar"));
//  rise(                 document.getElementById("rise"));
//  romance(              document.getElementById("romance"));
//  sakura(               document.getElementById("sakura"));
//  sierra(               document.getElementById("sierra"));
  sketch(               document.getElementById("sketch"));
  skinwhiten(           document.getElementById("skinwhiten"));
  sunrise(              document.getElementById("sunrise"));
  sunset(               document.getElementById("sunset"));
//  sutro(                document.getElementById("sutro"));
//  sweets(               document.getElementById("sweets"));
//  tender(               document.getElementById("tender"));
//  toaster2(             document.getElementById("toaster2"));
//  walden(               document.getElementById("walden"));
//  warm(                 document.getElementById("warm"));
//  whitecat(             document.getElementById("whitecat"));
//  xproii(               document.getElementById("xproii"));
};
