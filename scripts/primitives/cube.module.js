import * as THREE from 'three';
import Body from "../body.module.js";
import MeshCollider from "../colliders/meshCollider.module.js";


export default class Cube extends Body {
    constructor(mass, position, size, color, shininess, collision, fixed) {
        super(new THREE.Vector3(size, size, size), mass, position);

        this.gfx = new THREE.Mesh(
            new THREE.BoxGeometry(size, size, size),
            new THREE.MeshPhongMaterial({ color, shininess })
        );
        this.fixed = fixed;

        this.gfx.position.set(position.x, position.y, position.z);
        if (collision) { this.collider = new MeshCollider(this, this.gfx, fixed) }
    }

    update(delta) {
        if (!this.fixed) {
            super.update(delta);
            this.gfx.position.set(this.position.x, this.position.y, this.position.z);
        }
    }
}
