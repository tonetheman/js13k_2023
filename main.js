
// standard import for browser
import kontra from "./node_modules/kontra/kontra.min.mjs";

const STATE_HANG = 1; // hanging out at a base
const STATE_MOVE = 2; // moving to a new base
const STATE_DEAD = 3; // marked as dead
const W = 600;
const H = 400;

// nothing happening
const G_STATE_IDLE = 0;

// player selected a base
const G_STATE_BASE_SELECTED = 1;

let init = null;
let canvas = null, context = null;
let s = null;
let good_bases = [];
let bad_bases = [];
let groups = []; // attack groups
let g = { 
    state : G_STATE_IDLE,
    base : null
}

class AttackGroup {
    constructor(base,target,count) {
        this.base = base;
        this.target = target;
        this.count = count;
        this.spr = new kontra.Sprite({
            x:this.base.spr.x,
            y:this.base.spr.y,
            image:kontra.imageAssets["ag"]
        });
    }
    // easing
    // how much Time, Begin point, Change = end-beging,
    // Duration - how much time has passed now?
    linear(t,b,c,d) {
        return c * t / d + b
    }
    update(dt) {
        // move towards target?
        
        if (this.target.spr.x>this.base.spr.x) {
            this.spr.x = this.spr.x + 1;
        } else if (this.target.spr.x===this.base.spr.x) {
        } else {
            this.spr.x = this.spr.x - 1;
        }
        if (this.target.spr.y>this.base.spr.y) {
            this.spr.y = this.spr.y + 1;
        } else if (this.target.spr.y===this.base.spr.y){

        } else  {
            this.spr.y = this.spr.y - 1;
        }
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
    unselect() { 
        if (this.color==='red') this.spr.image = kontra.imageAssets["rb_32x32"];
        if (this.color==='blue') this.spr.image = kontra.imageAssets["bb_32x32"];
    }
    select() {
        if (this.color==='red') this.spr.image = kontra.imageAssets["rb_selected_32x32"];
        if (this.color==='blue') this.spr.image = kontra.imageAssets["bb_selected_32x32"];
    }
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
        if (this.color=='blue') {
            if (g.state==G_STATE_BASE_SELECTED) {
                g.state = G_STATE_IDLE;
                g.base = null;
                this.selected = false;
                this.unselect();
            } else {
                g.state = G_STATE_BASE_SELECTED;
                g.base = this;    
                this.select();
                this.selected = true;
            }
        } else if (this.color=='red') {
            if (g.state===G_STATE_BASE_SELECTED) {
                // this is a base we want to attack!
                // 1. create an attack group
                let tmp = new AttackGroup(g.base,this,g.base.count);
                g.base.count = 0;
                groups.push(tmp);

                console.log("made a group!",tmp.count);
                g.base.unselect();
                g.state = G_STATE_IDLE;
                g.base = null;
            }
        }
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

function global_onDown() {

    // make sure we are not already
    // handling this event in the sprite
    for(let i=0;i<bad_bases.length;i++) {
        if (kontra.pointerOver(bad_bases[i].sprite())) {
            return;
        }
    }
    for(let i=0;i<good_bases.length;i++) {
        if (kontra.pointerOver(good_bases[i].sprite())) {
            return;
        }
    }

    // back to idle
    g.state = G_STATE_IDLE;
    // fix the image
    g.base.spr.image = g.base.color==='red' ?
    kontra.imageAssets["rb_32x32"] :
    kontra.imageAssets["bb_32x32"];
    // forget the selected base
    g.base = null;
}

function _setup_tracking() {

    // let each sprite handle its own tracking
    for (let i=0;i<good_bases.length;i++) {
        kontra.track(good_bases[i].sprite());    
    }
    for (let i=0;i<bad_bases.length;i++) {
        kontra.track(bad_bases[i].sprite());
    }

    // setup one handler for global events
    kontra.onPointer("down",()=>{
        global_onDown();
    })
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
            for(let i=0;i<groups.length;i++) {
                groups[i].update(dt);
            }
        },
        render: function() {
            for(let i=0;i<good_bases.length;i++) {
                good_bases[i].render();
            }
            for(let i=0;i<bad_bases.length;i++) {
                bad_bases[i].render();
            }
            for(let i=0;i<groups.length;i++) {
                groups[i].render();
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