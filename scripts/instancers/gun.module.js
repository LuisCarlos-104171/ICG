import Bullet from "../primitives/bullet.module.js";
import Input from "../input/input.module.js";
import SoundFX from "../sounds/soundFX.module.js";

export default class Gun extends Input {
    constructor(player, window, throwPoint, throwForce) {
        super();
        this.win = window;
        this.player = player;
        this.interval = null;
        this.throwPoint = throwPoint;
        this.throwForce = throwForce;
        this.shooting = false;
        this.sum = 0;
        this.reloadTime = 0.1;
    }

    update(event, data) {
        if (event === "mousedown" && data.button === 0) {
            this.shooting = true;
        }

        if (event === "mouseup" && data.button === 0) {
            this.shooting = false;
            this.sum = 0;
        }
    }

    tick(delta) {
        if (this.shooting) {
            this.sum += delta;
            if (this.sum >= this.reloadTime) {
                this.sum = 0;
                this.shoot();
            }
        }
    }

    shoot() {
        new SoundFX("shot").play();

        let bullet = new Bullet(
            this.player.gfx.localToWorld(this.throwPoint.clone()),
            1,
            0xff0000,
            this.player.gfx.localToWorld(this.throwForce.clone()).sub(this.player.gfx.localToWorld(this.throwPoint.clone()))
        );
        this.win.addObject(bullet);
    }
}