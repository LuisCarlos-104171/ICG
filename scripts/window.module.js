import * as THREE from 'three';
import Input from "./input/input.module.js";
import Body from "./body.module.js";
import MeshCollider from "./colliders/meshCollider.module.js";
import PauseControl from "./pauseControl.module.js";

export default class Window {
    constructor(camera) {
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000);
        document.body.appendChild(this.renderer.domElement);

        this.camera = camera.camera;
        this.scene.add(camera.skybox);
        this.addObject(camera);

        this.pause = new PauseControl();
    }

    get paused() {
        return this.pause.paused;
    }
    addObject(object) {
        this.scene.add(object.gfx);
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
         this.renderer.render(this.scene, this.camera);
    }
}