import * as THREE from "three";
import Body from "../body.module.js";
import MeshCollider from "../colliders/meshCollider.module.js";
import Window from "../window.module.js";
import Constants from "../constants.module.js";


export default class Bullet extends Body {
    constructor(position, size, color, initialForce, damage = 5) {
        super(new THREE.Vector3(size, size, size), Constants.BULLET_MASS, position);

        this.velocity = initialForce.clone();

        this.gfx = new THREE.Mesh(
            new THREE.BoxGeometry(size, size, size),
            new THREE.MeshBasicMaterial({ color })
        );

        this.gfx.position.set(position.x, position.y, position.z);
        this.collider = new MeshCollider(this, this.gfx, false, this.destroy.bind(this));
        this.startTime = Date.now();

        this.damage = damage;
    }

    update(delta) {
        super.update(delta);
        this.gfx.position.set(this.position.x, this.position.y, this.position.z);

        if (Date.now() - this.startTime > 1500) {
            this.destroy();
        }
    }

    destroy(other) {
        if (other && other.obj.hasOwnProperty("health"))
            other.obj.damage(this.damage);

        Window.scene.remove(this.gfx);
        super.destroy();
        this.collider.destroy();
        return false;
    }
}
