

const STATE_HANG = 1; // hanging out at a base
const STATE_MOVE = 2; // moving to a new base
const STATE_DEAD = 3; // marked as dead

let init = null;
let canvas = null, context = null;
let s = null;

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
    constructor(x,y,color,rate) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.rate = rate;
    }
    update() {

    }
    render() {

    }
}

function main() {
    // js syntax is ass
    ({init} = kontra);
    ({canvas,context} = init())

    s = new Fighter(100,100,'blue');
    let loop = kontra.GameLoop({
        update: function() {
            s.update();
        },
        render: function() {
            s.render();
        }
    });
    loop.start();
}

window.onload = main;