export class AGContainer {
    constructor() {
        this.groups = [];
        this.index = 0;
    }
    add(tmp) {
        this.groups[this.index] = tmp;

        // update the index on the group
        // needed so we can delete easily
        tmp.set_index(this.index);

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
