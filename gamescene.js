
import kontra from "./node_modules/kontra/kontra.min.mjs";

// attack group container
import { AGContainer } from "./agcontainer.js";

const STATE_HANG = 1; // hanging out at a base
const STATE_MOVE = 2; // moving to a new base
const STATE_DEAD = 3; // marked as dead
const W = 600;
const H = 400;

// nothing happening
const G_STATE_IDLE = 0;

// player selected a base
const G_STATE_BASE_SELECTED = 1;

// game over states
const G_STATE_RED_WON = 2;
const G_STATE_BLUE_WON = 3;

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

class AttackGroup {
    constructor(gs,base,target,count) {
        this.gs = gs; // game scene the parent
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
    set_index(val) {
        this.index = val;
    }
    update(dt) {
        if (this.dead) {

            // delete us out of the array
            if (this.index!=-1) {
                delete this.gs.groups.groups[this.index];
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

class Base {
    constructor(gs,x,y,color,rate,count) {
        this.gs = gs; // game scene your parent!
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
            if (this.gs.g.state==G_STATE_BASE_SELECTED) {
                this.gs.g.state = G_STATE_IDLE;
                this.gs.g.base = null;
                this.selected = false;
                this.unselect();
            } else {
                this.gs.g.state = G_STATE_BASE_SELECTED;
                this.gs.g.base = this;    
                this.select();
                this.selected = true;
            }
        } else if (this.color=='red') {
            if (this.gs.g.state===G_STATE_BASE_SELECTED) {
                // this is a base we want to attack!
                // 1. create an attack group
                let tmp = new AttackGroup(this.gs,this.gs.g.base,this,this.gs.g.base.count);
                this.gs.g.base.count = 0;
                this.gs.groups.add(tmp);

                this.gs.g.base.unselect();
                this.gs.g.state = G_STATE_IDLE;
                this.gs.g.base = null;
            }
        }
    }
    handle_onOver() {

    }
}


export class GameScene {
    constructor(sm) {
        this.sm = sm;
        this.bases = [];
        this.g = { 
            state : G_STATE_IDLE,
            base : null
        }
        this.groups = new AGContainer();
        this.level = {
            total_bases: 6,
            red_base_count: 3,
            blue_base_count: 3,
        }
        
    }
    global_onDown() {

        // make sure we are not already
        // handling this event in the sprite
        for(let i=0;i<this.bases.length;i++) {
            if (kontra.pointerOver(this.bases[i].sprite())) {
                return;
            }
        }
    
        // back to idle
        this.g.state = G_STATE_IDLE;
    
    
        // fix the image
        if (this.g.base) {
            this.g.base.spr.image = this.g.base.color==='red' ?
            kontra.imageAssets["rb_32x32"] :
            kontra.imageAssets["bb_32x32"];
            // forget the selected base
            this.g.base = null;    
        }
    }
    
    _init() {
        // generate bases for blue
        for (let i=0;i<this.level.blue_base_count;i++) {
            let starting_count = getRandomInt(20);
            let x = getRandomInt(0+32,W-32)
            let y = getRandomInt(0+32,H-32);
            this.bases.push(new Base(this,x,y,'blue',0.5,starting_count));
        }
        // generate bases for red
        for (let i=0;i<this.level.red_base_count;i++) {
            let starting_count = getRandomInt(20);
            let x = getRandomInt(0,W)
            let y = getRandomInt(0,H);
            this.bases.push(new Base(this,x,y,'red',0.5,starting_count));
        }
    }
    _setup_tracking() {

        // let each sprite handle its own tracking
        for (let i=0;i<this.bases.length;i++) {
            kontra.track(this.bases[i].sprite());    
        }
    
        // setup one handler for global events
        kontra.onPointer("down",()=>{
            this.global_onDown();
        })
    }
    
    init() {
        this._init();
        this._setup_tracking();
    }
    unload() {
        // TODO: need to use this to unregister pointer things
    }
    update(dt) {
        this.check_for_game_over();
        if ((this.g.state===G_STATE_BLUE_WON) || (this.g.state===G_STATE_BLUE_WON)) {
            update_game_over_menu();
            return;
        }

        if ((this.g.state===G_STATE_BLUE_WON) || (this.g.state===G_STATE_BLUE_WON)) {
            update_game_over_menu();
            return;
        }

        for(let i=0;i<this.bases.length;i++) {
            this.bases[i].update(dt);
        }
        this.groups.update(dt);

    }
    render() {
        if ((this.g.state===G_STATE_BLUE_WON) || (this.g.state===G_STATE_BLUE_WON)) {
            
            // TODO: this should get sm to switch
            // to another scene
            render_game_over_menu();
            return;
        }

        for(let i=0;i<this.bases.length;i++) {
            this.bases[i].render();
        }
        this.groups.render();
    }
    check_for_game_over() {
        let rcount = 0;
        let bcount = 0;
        for(let i=0;i<this.bases.length;i++) {
            if (this.bases[i].color==='red') {
                rcount++;
            }
            if (this.bases[i].color==='blue') {
                bcount++;
            }
        }
        if (rcount===this.level.total_bases) {
            // RED WON
            this.g.state = G_STATE_RED_WON;
        }
        if (rcount===this.level.total_bases) {
            // BLUE WON
            this.g.state = G_STATE_BLUE_WON;
        }
    }
    
}
