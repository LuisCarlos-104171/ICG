import Body from "../body.module.js";
import Constants from "../constants.module.js";
import MeshCollider from "../colliders/meshCollider.module.js";
import * as THREE from 'three';

export default class EnemyBody extends Body {
    constructor(position, target) {
        super(new THREE.Vector3(10, 10, 10), 100, position);
        this.target = target;
        this.gfx = new THREE.Mesh(
            new THREE.SphereGeometry(10),
            new THREE.MeshPhongMaterial({ color: 0xffffff })
        );

        this.gfx.position.copy(this.position);
        this.collider = new MeshCollider(this, this.gfx, false);
        this.health = 100;
    }

    update(delta) {
        let direction = this.target.position.clone().sub(this.position);
        direction.normalize();

        this.applyForce(direction.multiplyScalar(2500));

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
        this.gfx.parent.remove(this.gfx);
        super.destroy();
        this.collider.destroy();
    }

    damage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.destroy();
        }
    }
}
