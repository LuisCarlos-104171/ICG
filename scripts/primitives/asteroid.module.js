import * as THREE from "three";
import Body from "../body.module.js";
import MeshCollider from "../colliders/meshCollider.module.js";
import Models from "../models.module.js";
import Player from "../entities/player.module.js";
import SoundFX from "../sounds/soundFX.module.js";
import Window from "../window.module.js";


export default class Asteroid extends Body {
    constructor(position, size) {
        super(new THREE.Vector3(size, size, size), 300, position);

        const fullMesh = Models.asteroid01.clone();
        this.pieces = [];
        for (const child of fullMesh.children) {
            if (child instanceof THREE.Mesh && child.name.includes("cell")) {
                child.scale.set(size, size, size);
                this.pieces.push(child);
            } else if (child instanceof THREE.Mesh) {
                this.gfx = child;
            }
        }

        this.health = 100;
        this.dead = false;

        this.gfx.position.set(position.x, position.y, position.z);
        this.gfx.scale.set(size, size, size);
        this.collider = new MeshCollider(this, this.gfx, false, this.onCollision.bind(this));

        this.animationMaxTime = 3.5;
        this.animationCurrentTime = 0;
        this.destructionBodies = [];

        this.locked = false;
        this.isLockable = true;
    }

    update(delta) {
        if (!this.dead) {
            super.update(delta);
            this.gfx.position.set(this.position.x, this.position.y, this.position.z);
        } else {
            if (this.animationCurrentTime === 0) {
                new SoundFX("explosion", 0.8).play()
                this.collider.destroy();
                this.destructionBodies = this.pieces.map(piece => new Body(new THREE.Vector3(1, 1, 1), 1, piece.position.add(this.position)));
                this.destructionBodies.forEach(body => body.velocity = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).multiplyScalar(40));

                Window.scene.add(...this.pieces);
                Window.scene.remove(this.gfx);
                this.gfx = null;
            }

            if (this.animationCurrentTime >= this.animationMaxTime) {
                this.destroy();
                return;
            }

            this.destructionBodies.forEach(body => body.update(delta));
            this.animationCurrentTime += delta;
        }
    }

    destroy() {
        if (this.gfx) Window.scene.remove(this.gfx);
        this.collider.destroy();
        super.destroy();
        this.pieces.forEach(piece => Window.scene.remove(piece));
    }

    damage(amt) {
        this.health -= amt;
        if (this.health <= 0) {
            this.dead = true;
            this.locked = false;
        }
    }

    onCollision(other) {
        if (other.obj instanceof Player) {
            this.damage(0.2 * other.obj.velocity.length());
            other.obj.damage(0.2 * other.obj.velocity.length());
        }

        return true;
    }
}
