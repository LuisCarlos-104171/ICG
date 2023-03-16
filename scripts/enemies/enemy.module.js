import EnemyBody from "./enemyBody.module.js";
import SoundFX from "../sounds/soundFX.module.js";
import Bullet from "../primitives/bullet.module.js";
import * as THREE from 'three';


const states = {
    PURSUING: 0,
    ATTACKING: 1,
    RETREATING: 2,
}

function linearMapping(value, inMin, inMax, outMin, outMax) {
    const proportion = (value - inMin) / (inMax - inMin);
    return outMin + proportion * (outMax - outMin)
}

const behaviours = [
    function pursuing() {
        if (this.target.position.distanceTo(this.position) < 150) {
            return [states.ATTACKING, null]
        }

        const desire = this.position.clone().sub(this.target.position).normalize();
        const dx = desire.length()
        if (dx < 200) {
            desire.multiplyScalar(linearMapping(dx, 150, 200, -8000, 8000));
        } else {
            desire.multiplyScalar(4000);
        }

        return [
            states.PURSUING,
            desire
        ];
    },
    function attacking() {
        const dst = this.target.position.distanceTo(this.position);
        if (dst > 200) {
            return [states.PURSUING, null]
        }

        if (dst < 70) {
            return [states.RETREATING, null]
        }

        const maxDst = 200;
        const minDst = 70;

        // keep a distance to the target
        const dstToTarget = this.target.position.distanceTo(this.position);
        const desire = this.position.clone().sub(this.target.position)
            .normalize()
            .multiplyScalar(linearMapping(dstToTarget, minDst, maxDst, 7000, -7000));


        return [
            states.ATTACKING,
            desire
        ];
    },
    function retreating() {
        if (this.target.position.distanceTo(this.position) > 300) {
            return [states.PURSUING, null]
        }

        const desire = this.position.clone().sub(this.target.position);
        const dx = desire.length();
        desire
            .normalize()
            .multiplyScalar(linearMapping(dx, 0, 400, 8000, -8000));
        return [
            states.RETREATING,
            desire
        ];
    }
]

export default class Enemy extends EnemyBody {
    constructor(position, target, window) {
        super(position, target, window);

        this.gunPoint = new THREE.Vector3(0, 0, 20);
        this.gunForce = new THREE.Vector3(0, 0, 500);

        this.shooting = false;

        this.shootingDelay = 0.1;
        this.shootingDelaySum = 0;
        this.shootingSpread = 10;

        this.aiState = states.PURSUING;
        this.behavior = behaviours[this.aiState];
    }

    randomVector3() {
        return new THREE.Vector3(
            Math.random() * 2 - 1,
            Math.random() * 2 - 1,
            Math.random() * 2 - 1
        );
    }

    update(delta) {
        const [newState, force] = this.behavior.call(this);
        if (newState !== this.aiState) {
            console.log("State changed from " + this.aiState + " to " + newState)
            this.aiState = newState;
            this.behavior = behaviours[this.aiState];
        } else {
            this.applyForce(force.clone().sub(this.velocity).clampLength(0, 4000));
        }

        const pp = this.position.clone().add(this.gunPoint);
        const vp = this.gfx.localToWorld(this.gunForce.clone()).sub(this.gfx.localToWorld(this.gunPoint.clone()))

        const pt = this.target.position.clone();
        const vt = this.target.velocity.clone();

        const vr = vt.clone().sub(vp);
        const t = pp.distanceTo(pt) / vr.length();

        const pi = pt.clone().add(vr.clone().multiplyScalar(t));
        this.gfx.lookAt(pi);

        super.update(delta);

        this.shooting = this.position.distanceTo(this.target.position) < 200;
        if (this.shooting) {
            if (this.shootingDelaySum <= 0) {
                this.shoot();
                this.shootingDelaySum = this.shootingDelay;
            } else {
                this.shootingDelaySum -= delta;
            }
        }
    }

    shoot() {
        new SoundFX("shot").play();

        let gunForce = this.gunForce.clone().add(this.randomVector3().multiplyScalar(this.shootingSpread));

        let bullet = new Bullet(
            this.gfx.localToWorld(this.gunPoint.clone()),
            1,
            0x0000ff,
            this.gfx.localToWorld(gunForce).sub(this.gfx.localToWorld(this.gunPoint.clone())),
            this.window.scene
        );
        this.window.addObject(bullet);
    }
}
