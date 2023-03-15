import EnemyBody from "./enemyBody.module.js";
import SoundFX from "../sounds/soundFX.module.js";
import Bullet from "../primitives/bullet.module.js";
import * as THREE from 'three';

export default class Enemy extends EnemyBody {
    constructor(position, target, window) {
        super(position, target);

        this.gunPoint = new THREE.Vector3(0, 0, 15);
        this.gunForce = new THREE.Vector3(0, 0, 500);

        this.win = window;

        this.shooting = false;

        this.reloadTime = 0.3;
        this.magazineSize = 100;
        this.magazine = this.magazineSize;
        this.magazineReloadSum = 0;

        this.shootingDelay = 0.1;
        this.shootingDelaySum = 0;
    }

    update(delta) {
        super.update(delta);

        this.shooting = this.target.position.distanceTo(this.position) < 200;
        if (this.shooting) {
            if (this.magazine <= 0 && this.magazineReloadSum < this.reloadTime) {
                this.magazineReloadSum += delta;
            } else if (this.magazine <= 0 && this.magazineReloadSum >= this.reloadTime) {
                this.magazine = this.magazineSize;
                this.magazineReloadSum = 0;
            } else if (this.shootingDelaySum >= this.shootingDelay) {
                this.shoot();
                this.shootingDelaySum = 0;
            } else {
                this.shootingDelaySum += delta;
            }
        }
    }

    shoot() {
        new SoundFX("shot").play();

        let bullet = new Bullet(
            this.gfx.localToWorld(this.gunPoint.clone()),
            1,
            0xff0000,
            this.gfx.localToWorld(this.gunForce.clone()).sub(this.gfx.localToWorld(this.gunPoint.clone())),
            this.win.scene
        );
        this.win.addObject(bullet);
    }
}
