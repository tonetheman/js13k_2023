
// standard import for browser
import kontra from "./node_modules/kontra/kontra.min.mjs";

const STATE_HANG = 1; // hanging out at a base
const STATE_MOVE = 2; // moving to a new base
const STATE_DEAD = 3; // marked as dead
const W = 600;
const H = 400;

let init = null;
let canvas = null, context = null;
let s = null;
let blue_base = null;
let red_base = null;

// state - hanging out at a base
// moving - moving from one base to another
// dead -
class Fighter {
    constructor(x,y,color) {
        this.spr = kontra.Sprite({
            x:x,y:y,color:color,width:8,height:8
        })
        this.health = 10; // ?
        this.state = STATE_HANG;
    }
    update() {
        this.spr.update();
    }
    render() {
        this.spr.render();
    }
}

// for now super simple
// click on a base and send ALL available fighters
// fighters shoudl cluster around a base
class Base {
    constructor(x,y,color,rate,count) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.rate = rate;
        this.acc = 0;
        this.count = count ? count : 0;

        this.spr = kontra.Sprite({
            x:x,y:y,color:color,width:32,height:32
        });
        this.txt = kontra.Text({
            text: "0",
            x:x+16,y:y+16,anchor:{x:0.5,y:0.5},
            textAlign: 'center',
            color:'white'
        })
    }
    sprite() { return this.spr; }
    update(dt) {
        this.acc += dt;
        if (this.acc>this.rate) {
            this.count++;
            this.acc = 0;
            this.txt.text = this.count;
        }
        if (kontra.pointerOver(this.spr)) {
            // highlight base?
        }
        this.spr.update();
        this.txt.update();
    }
    render() {
        this.spr.render();
        this.txt.render();
    }
}

function _init() {
    // setup globals
    s = new Fighter(100,100,'blue');
    blue_base = new Base(0,0,'blue',1);
    red_base = new Base(W-32,H-32,'red',1);
}

function main() {
    // js syntax is ass
    ({init} = kontra);
    ({canvas,context} = init())

    // set up global objects
    _init();

    kontra.initPointer();
    kontra.track(blue_base.sprite());
    kontra.track(red_base.sprite());

    let loop = kontra.GameLoop({
        update: function(dt) {
            s.update();
            blue_base.update(dt);
            red_base.update(dt);
        },
        render: function() {
            s.render();
            blue_base.render();
            red_base.render();
        }
    });
    loop.start();
}

window.onload = main;