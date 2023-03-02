import * as THREE from "three";
import Body from "../body.module.js";
import MeshCollider from "../colliders/meshCollider.module.js";
import Bullet from "./bullet.module.js";
import Models from "../models.module.js";


export default class Asteroid extends Body {
    constructor(position, size) {
        super(new THREE.Vector3(size, size, size), 100, position);

        this.gfx = Models.asteroid01.clone();

        this.health = 10;
        this.dead = false;

        this.gfx.position.set(position.x, position.y, position.z);
        this.gfx.scale.set(size, size, size);
        this.collider = new MeshCollider(this, this.gfx, false, this.onCollision.bind(this));
    }

    update(delta) {
        if (!this.dead) {
            super.update(delta);
        }
        this.gfx.position.set(this.position.x, this.position.y, this.position.z);
    }

    destroy() {
        this.collider.destroy();
        super.destroy();
        this.gfx.parent.remove(this.gfx);
    }

    onCollision(other) {
        console.log("collision");
        if (other.obj instanceof Bullet) {
            this.health -= 2;
            console.log(this.health);
            if (this.health <= 0) {
                this.dead = true;
                this.destroy();
            }
        }

        return true;
    }
}
