
import kontra from "./node_modules/kontra/kontra.min.mjs";
import {W,H} from "./config.js";

export class LoadingScene {
    constructor(sm) {
        this.sm = sm; // scene mananger
        this.counter = 0;
        this.txt = kontra.Text({
            text: "loading...",
            x : W/2, y: H/2,
            color: 'white'
        });
    }
    init() {
        console.log("init loading scene");
    }
    unload() {
        console.log("unload loading scene");
    }
    update(dt) {
        this.txt.update(dt);
        this.counter++;
        if (this.counter>120) {
            console.log("changing to game")
            this.sm.switch_scene("game");
        }
    }
    render() {
        this.txt.render();
    }
}
