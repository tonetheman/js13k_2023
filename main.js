
// standard import for browser
import kontra from "./node_modules/kontra/kontra.min.mjs";

import { GameScene } from "./gamescene.js";

let init = null;
let canvas = null, context = null;






function update_game_over_menu () {

}

function render_game_over_menu () {

}

class SM {
    constructor(opts) {
        this.scenes = {};
        this.current_scene = null;
    }
    register(scene,instance) {
        this.scenes[scene] = instance;
    }
    set_scene(scene) {
        this.current_scene = scene;
    }
    init_current_scene() {
        if (this.current_scene) {
            this.scenes[this.current_scene].init();
        }
    }
    unload_current_scene() {
        if (this.current_scene) {
            this.scenes[this.current_scene].unload();
            this.current_scene = null;
        }
    }
    update(dt) {
        if (this.current_scene) {
            this.scenes[this.current_scene].update(dt)
        }
    }
    render() {
        if (this.current_scene) {
            this.scenes[this.current_scene].render();
        }
    }
}

class LoadingScene {
    constructor(sm) {
        this.sm = sm; // scene mananger
        this.counter = 0;
        this.txt = kontra.Text({
            text: "loading..."
        });
    }
    init() {

    }
    unload() {

    }
    update(dt) {
        this.txt.update(dt);
        this.counter++;
    }
    render() {
        this.txt.render();
    }
}


function _main() {
    // js syntax is ass
    ({init} = kontra);
    ({canvas,context} = init())
    kontra.initPointer();

    let sm = new SM({starting_scene:"loading"});
    sm.register("loading", new LoadingScene(sm));
    sm.register("game", new GameScene(sm))
    sm.set_scene("game");
    sm.init_current_scene();


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