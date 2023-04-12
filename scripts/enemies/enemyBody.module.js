import Body from "../body.module.js";
import Constants from "../constants.module.js";
import MeshCollider from "../colliders/meshCollider.module.js";
import * as THREE from 'three';
import Models from "../models.module.js";
import Window from "../window.module.js";

export default class EnemyBody extends Body {
    constructor(position, target) {
        super(new THREE.Vector3(10, 10, 10), 100, position);
        this.target = target;
        this.gfx = Models.enemy01.clone();

        this.gfx.position.copy(this.position);
        this.collider = new MeshCollider(this, this.gfx, false);

        this.maxHealth = 100;
        this.health = this.maxHealth;

        this.locked = false;
        this.isLockable = true;
    }

    update(delta) {
        // apply physics
        super.update(delta);
        // limit speed
        this.velocity.x = Math.min(Math.max(this.velocity.x, -Constants.PLAYER_MAX_SPEED + 10), Constants.PLAYER_MAX_SPEED - 10);
        this.velocity.y = Math.min(Math.max(this.velocity.y, -Constants.PLAYER_MAX_SPEED + 10), Constants.PLAYER_MAX_SPEED - 10);
        this.velocity.z = Math.min(Math.max(this.velocity.z, -Constants.PLAYER_MAX_SPEED + 10), Constants.PLAYER_MAX_SPEED - 10);

        // sets the graphics position to the physics position
        this.gfx.position.copy(this.position);
        this.gfx.lookAt(this.target.position);
    }

    destroy() {
        Window.scene.remove(this.gfx);
        super.destroy();
        this.collider.destroy();
        this.locked = false;
    }

    damage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.destroy();
        }
    }
}
