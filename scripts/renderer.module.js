import Input from "./input/input.module.js";
import * as THREE from "three";

export default class Renderer extends Input {
    constructor() {
        super();
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        document.body.appendChild(this.renderer.domElement);
    }

    update(event, data) {
        if (event === "resize") {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(window.devicePixelRatio);
        }
    }

    render(scene, camera) {
        this.renderer.render(scene, camera);
    }
}
