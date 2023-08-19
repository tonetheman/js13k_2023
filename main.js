
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
let g = { 
    state : G_STATE_IDLE,
    base : null
}

class AGContainer {
    constructor() {
        this.groups = [];
        this.index = 0;
    }
    add(tmp) {
        this.groups[this.index] = tmp;
        // update the index on the group
        tmp.index = this.index;
        this.index++;
    }
    update(dt) {
        let tmp=null;
        // if you do not declare the variable in a ..in loop
        // it is global javascript sucks
        for(tmp in this.groups) {
            this.groups[tmp].update(dt)
        }
    }
    render() {
        let tmp = null;
        for (tmp in this.groups) {
            this.groups[tmp].render();
        }
    }
}
let groups = new AGContainer();


class AttackGroup {
    constructor(base,target,count) {
        this.b = base;
        this.t = target;
        this.origin = {
            x:base.spr.x,
            y:base.spr.y
        };
        this.target = {
            x:target.spr.x,
            y:target.spr.y
        }
        this.count = count;
        this.arrived_x = false;
        this.arrived_y = false;
        this.dead = false;
        this.index = -1; // gets set external
        this.spr = new kontra.Sprite({
            x:this.origin.x,
            y:this.origin.y,
            image:kontra.imageAssets["ag"]
        });
        this.txt = kontra.Text({
            text: this.count,
            x:this.spr.x+16,y:this.spr.y+16,anchor:{x:0.5,y:0.5},
            textAlign: 'center',
            color:'white'
        })
    }
   
    update(dt) {
        if (this.dead) {

            // splice us out of the array
            if (this.index!=-1) {
                console.log("removing group");
                delete groups.groups[this.index];
                this.index=-1;
            }

            return;
        }

        if (!this.arrived_x) {
            if (this.spr.x<this.target.x) {
                this.spr.x++
                this.txt.x++;
            } else if (this.spr.x>this.target.x) {
                this.spr.x--;
                this.txt.x--;
            } else if (this.spr.x===this.target.x) {
                this.arrived_x = true;
            }    
        }
        if (!this.arrived_y) {
            if (this.spr.y<this.target.y) {
                this.spr.y++;
                this.txt.y++
            } else if (this.spr.y>this.target.y) {
                this.spr.y--;
                this.txt.y--;
            } else if (this.spr.y===this.target.y) {
                this.arrived_y = true;
            }    
        }
        if (this.arrived_x && this.arrived_y) {
            // ATTTTTACK NOW
            this.t.count -= this.count;

            if (this.t.count<0) {
                this.t.set_new_color('blue');
            }

            // mark the group dead
            // not sure how these get reclaimed yet
            this.dead = true;
        }

        // move the sprite
        this.spr.update();
        this.txt.update();
    }
    render() {
        if (!this.dead) { 
            this.spr.render();
            this.txt.render();
        }
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
    set_new_color(color) {
        if (color!==this.color) {
            this.color = color;
            if (this.color==='blue') this.spr.image = kontra.imageAssets["bb_32x32"];
            if (this.color==='red') this.spr.image = kontra.imageAssets["rb_32x32"];
            this.selected = false;
            this.count = 0;
        }
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
                groups.add(tmp);

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
    good_bases.push(new Base(0,0,'blue',0.5));
    good_bases.push(new Base(100,100,'blue',0.75));
    
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
            groups.update(dt);
        },
        render: function() {
            for(let i=0;i<good_bases.length;i++) {
                good_bases[i].render();
            }
            for(let i=0;i<bad_bases.length;i++) {
                bad_bases[i].render();
            }
            groups.render();
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