
// standard import for browser
import kontra from "./node_modules/kontra/kontra.min.mjs";

const STATE_HANG = 1; // hanging out at a base
const STATE_MOVE = 2; // moving to a new base
const STATE_DEAD = 3; // marked as dead
const W = 600;
const H = 400;
const G_STATE_IDLE = 0;
const G_STATE_BASE_SELECTED = 1;

let init = null;
let canvas = null, context = null;
let s = null;
let good_bases = [];
let bad_bases = [];
let g_state = G_STATE_IDLE;
let g_state_base = null; // currently selected base

// state - hanging out at a base
// moving - moving from one base to another
// dead -
class Fighter {
    constructor(x,y,color) {
        this.spr = kontra.Sprite({
            x:x,y:y,width:8,height:8,color:color
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
        this.selected = false;

        this.spr = kontra.Sprite({
            x:x,y:y,width:32,height:32,
            image : color=='red' ? kontra.imageAssets["rb_32x32"] : 
                kontra.imageAssets["bb_32x32"],
            onOver : () => {
                this.handle_onOver();
            },
            onDown : () => {
                this.handle_onDown();
            }
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
        
        // growth handling
        this.acc += dt;
        if (this.acc>this.rate) {
            this.count++;
            this.acc = 0;
            this.txt.text = this.count;
        }

        this.spr.update();
        this.txt.update();
    }
    render() {
        this.spr.render();
        this.txt.render();
    }
    handle_onDown() {
        this.selected = true;
        this.spr.image = this.color==='red' ?
        kontra.imageAssets["rb_selected_32x32"] :
        kontra.imageAssets["bb_selected_32x32"];
        g_state = G_STATE_BASE_SELECTED;
        g_state_base = this;
    }
    handle_onOver() {

    }
}

function _init() {
    good_bases.push(new Base(0,0,'blue',1));
    good_bases.push(new Base(100,100,'blue',1));
    
    bad_bases.push(new Base(W-32,H-32,'red',1));
    bad_bases.push(new Base(W-164,H-164,'red',1));
}

function _setup_tracking() {
    for (let i=0;i<good_bases.length;i++) {
        kontra.track(good_bases[i].sprite());    
    }
    for (let i=0;i<bad_bases.length;i++) {
        kontra.track(bad_bases[i].sprite());
    }
}

function _main() {
    // js syntax is ass
    ({init} = kontra);
    ({canvas,context} = init())

    // set up global objects
    _init();

    kontra.initPointer();
    _setup_tracking();


    let loop = kontra.GameLoop({
        update: function(dt) {
            for(let i=0;i<good_bases.length;i++) {
                good_bases[i].update(dt);
            }
            for(let i=0;i<bad_bases.length;i++) {
                bad_bases[i].update(dt);
            }
        },
        render: function() {
            for(let i=0;i<good_bases.length;i++) {
                good_bases[i].render();
            }
            for(let i=0;i<bad_bases.length;i++) {
                bad_bases[i].render();
            }
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
        "windmill.png")
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