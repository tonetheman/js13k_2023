export class SM {
    constructor() {
        this.scenes = {};
        this.current_scene = null;
    }
    register(scene,instance) {
        console.log("registering ",scene);
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
    switch_scene(new_scene) {
        if (this.current_scene) {
            this.scenes[this.current_scene].unload();
        }
        this.set_scene(new_scene);
        this.init_current_scene();
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
