import * as THREE from "three";
import Body from "../body.module.js";
import MeshCollider from "../colliders/meshCollider.module.js";
import Bullet from "./bullet.module.js";
import Models from "../models.module.js";
import Player from "../entities/player.module.js";
import SoundFX from "../sounds/soundFX.module.js";


export default class Asteroid extends Body {
    constructor(position, size, window) {
        super(new THREE.Vector3(size, size, size), 300, position);

        this.window = window;

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

        this.health = 10;
        this.dead = false;

        this.gfx.position.set(position.x, position.y, position.z);
        this.gfx.scale.set(size, size, size);
        this.collider = new MeshCollider(this, this.gfx, false, this.onCollision.bind(this));

        this.animationMaxTime = 3.5;
        this.animationCurrentTime = 0;
        this.destructionBodies = [];
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

                this.window.scene.add(...this.pieces);
                this.window.scene.remove(this.gfx);
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
        this.collider.destroy();
        super.destroy();
        this.pieces.forEach(piece => this.window.scene.remove(piece));
    }

    takeDamage(amt) {
        this.health -= amt;
        if (this.health <= 0) {
            this.dead = true;
        }
    }

    onCollision(other) {
        if (other.obj instanceof Bullet) {
            this.takeDamage(2);
        } else if (other.obj instanceof Player) {
            this.takeDamage(4);
            other.obj.takeDamage(1)
        }

        return true;
    }
}