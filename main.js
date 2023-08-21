
// standard import for browser
import kontra from "./node_modules/kontra/kontra.min.mjs";

import { GameScene } from "./gamescene.js";
import { SM } from "./sm.js";
import { LoadingScene } from "./loading_scene.js";


let init = null;
let canvas = null, context = null;

function _main() {
    // js syntax is ass
    ({init} = kontra);
    ({canvas,context} = init())
    kontra.initPointer();

    let sm = new SM();
    sm.register("loading", new LoadingScene(sm));
    sm.register("game", new GameScene(sm))
    sm.switch_scene("loading");

    let loop = kontra.GameLoop({
        update: function(dt) {
            sm.update(dt);
        },
        render: function() {
            sm.render();
        }
    });
    loop.start();
}

function main() {
    kontra.load(
        "rb_32x32.png",
        "rb_selected_32x32.png",
        "bb_32x32.png",
        "bb_selected_32x32.png",
        "windmill.png",
        "ag.png")
    .then(function(assets) {
        // g_assets = assets;
        //console.log("g_assets",g_assets)
        _main();
    })
    .catch(function(err){
        console.log(err);
    })
}

window.onload = main;