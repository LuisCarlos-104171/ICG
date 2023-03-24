import * as THREE from 'three';
import Input from "./input/input.module.js";
import Body from "./body.module.js";
import MeshCollider from "./colliders/meshCollider.module.js";
import PauseControl from "./pauseControl.module.js";
import Renderer from "./renderer.module.js";

export default class Window {
    static scene = null;

    constructor(camera) {
        if (Window.scene) {
            throw new Error("Window already exists");
        }

        Window.scene = new THREE.Scene();
        this.renderer = new Renderer();

        this.camera = camera;
        Window.scene.fog = new THREE.Fog(0x000000, 350, 450);
        Window.scene.add(camera.skybox);
        this.addObject(camera);

        this.pause = new PauseControl();
    }

    get paused() {
        return this.pause.paused;
    }

    get gameOver() {
        return this.camera.dead;
    }

    addObject(object) {
        Window.scene.add(object.gfx);
    }

    tick(delta) {
        // update inputs
        Input.update(delta);

        // process collisions
        MeshCollider.processCollisions();

        // update bodies
        Body.update(delta);

        // helper for debugging (bounding boxes)
        // MeshCollider.debug(this.scene);
    }

    render() {
         this.renderer.render(this.camera.camera);
    }
}