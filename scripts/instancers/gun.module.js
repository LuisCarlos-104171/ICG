import * as THREE from "three";
import Bullet from "../primitives/bullet.module.js";
import Input from "../input/input.module.js";


export default class Gun extends Input {
    constructor(player, window, throwPoint) {
        super();
        this.win = window;
        this.player = player;
        this.interval = null;
        this.throwPoint = throwPoint;
        this.shooting = false;
        this.sum = 0;
    }

    update(event, data) {
        if (event === "mousedown" && data.button === 0) {
            this.shooting = true;
        }

        if (event === "mouseup" && data.button === 0) {
            this.shooting = false;
        }
    }

    tick(delta) {
        if (this.shooting) {
            this.sum += delta;
            if (this.sum > 0.1) {
                this.sum -= 0.1;
                this.shoot();
            }
        }
    }

    shoot() {
        let bullet = new Bullet(
            this.player.gfx.localToWorld(this.throwPoint.clone()),
            0.5,
            0xff0000,
            this.player.gfx.localToWorld(new THREE.Vector3(0, 0, -500)).sub(this.player.position),
            this.win.scene
        );
        this.win.addObject(bullet);
    }
}