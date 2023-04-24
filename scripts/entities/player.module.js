import * as THREE from 'three';
import Input from "../input/input.module.js";
import Constants from "../constants.module.js";
import physics from "../physics.module.js";
import MeshCollider from "../colliders/meshCollider.module.js";
import Models from "../models.module.js";
import Window from "../window.module.js";
import Store from "../store/store.module.js";
import Asteroid from "../primitives/asteroid.module.js";
import StoreUI from "../store/storeUI.module.js";


export default class Player extends Input {
    constructor() {
        super();

        this.position = new THREE.Vector3(0, 0, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.acceleration = new THREE.Vector3(0, 0, 0);

        this.Cr = 0.6;
        this.mass = 100;
        this.health = this.maxHealth;

        this.regenRate = 20;
        this.regenDelay = 5;
        this.regenTimer = 0;

        this.rotation = new THREE.Quaternion();
        this.collider = null;

        this.movement = new THREE.Vector3(0, 0, 0);

        this.ui = document.getElementById("UI");

        this.xPlayerPositionElement = document.getElementById("playerPositionX");
        this.yPlayerPositionElement = document.getElementById("playerPositionY");
        this.zPlayerPositionElement = document.getElementById("playerPositionZ");

        this.xPlayerVelocityElement = document.getElementById("playerVelocityX");
        this.yPlayerVelocityElement = document.getElementById("playerVelocityY");
        this.zPlayerVelocityElement = document.getElementById("playerVelocityZ");

        this.xPlayerAccelerationElement = document.getElementById("playerAccelerationX");
        this.yPlayerAccelerationElement = document.getElementById("playerAccelerationY");
        this.zPlayerAccelerationElement = document.getElementById("playerAccelerationZ");

        this.healthBar = document.getElementById("healthBar");
        this.healthDiv = document.getElementById("health");
        this.deathScreen = document.getElementById("deathScreen");

        this.window = window;

        this.locked = null;

        this.mining = false;
        this.miningElement = document.getElementById("mining");
    }

    get maxHealth() {
        return 150 + Store.upgrades.health * 100;
    }

    addForce(force) {
        this.acceleration.add(force.clone().divideScalar(this.mass));
    }

    onModelsLoaded() {
        this.collider = new MeshCollider(this, Models.spaceship, false);
    }

    tick(delta) {
        this.acceleration.set(0, 0, 0);
        this.movement = new THREE.Vector3(0, 0, 0);

        if (this.regenTimer > this.regenDelay) {
            this.health += this.regenRate * delta;
            this.health = Math.min(this.health, this.maxHealth);
            this.healthBar.style.width = (this.calculatePercentage()) + "%";
        } else {
            this.regenTimer += delta;
        }

        if (this.health === this.maxHealth) {
            this.healthDiv.style.opacity = "0";
        } else {
            this.healthDiv.style.opacity = "1";
        }

        if (Input.isPressed("w")) {
            this.movement.z -= 1;
        }

        if (Input.isPressed("s")) {
            this.movement.z += 1;
        }

        if (Input.isPressed("a")) {
            this.movement.x -= 1;
        }

        if (Input.isPressed("d")) {
            this.movement.x += 1;
        }

        if (Input.isPressed("q")) {
            this.movement.y -= 1;
        }

        if (Input.isPressed("e")) {
            this.movement.y += 1;
        }

        if (this.locked && Input.isPressed("c") && this.locked.obj instanceof Asteroid) {
            this.mining = true;
        }

        if (this.mining && this.locked && this.locked.obj.position.distanceTo(this.position) > 200) {
            this.mining = false;
        }

        const uiMovement = this.movement.normalize();
        const uiScale = -uiMovement.z * 1.5 + 100;
        const uiX = -uiMovement.x * 2;
        const uiY = -uiMovement.y * 2;

        this.ui.style.transform = "scale(" + uiScale + "%)";
        this.ui.style.left = uiX + "%";
        this.ui.style.top = uiY + "%";

        this.movement.normalize().multiplyScalar(4000).applyQuaternion(this.rotation);
        this.addForce(this.movement);

        // friction
        this.addForce(physics.calculateFriction(this.velocity, Constants.PLAYER_FRICTION));

        this.velocity.add(this.acceleration.multiplyScalar(delta));
        this.velocity = new THREE.Vector3(
            Math.min(Math.max(this.velocity.x, -Constants.PLAYER_MAX_SPEED), Constants.PLAYER_MAX_SPEED),
            Math.min(Math.max(this.velocity.y, -Constants.PLAYER_MAX_SPEED), Constants.PLAYER_MAX_SPEED),
            Math.min(Math.max(this.velocity.z, -Constants.PLAYER_MAX_SPEED), Constants.PLAYER_MAX_SPEED)
        );
        this.position.add(this.velocity.clone().multiplyScalar(delta));

        this.xPlayerPositionElement.innerText = (Math.round(this.position.x * 10) / 10).toString();
        this.yPlayerPositionElement.innerText = (Math.round(this.position.y * 10) / 10).toString();
        this.zPlayerPositionElement.innerText = (Math.round(this.position.z * 10) / 10).toString();

        this.xPlayerVelocityElement.innerText = (Math.round(this.velocity.x * 10) / 10).toString();
        this.yPlayerVelocityElement.innerText = (Math.round(this.velocity.y * 10) / 10).toString();
        this.zPlayerVelocityElement.innerText = (Math.round(this.velocity.z * 10) / 10).toString();

        this.xPlayerAccelerationElement.innerText = (Math.round(this.acceleration.x * 10) / 10).toString();
        this.yPlayerAccelerationElement.innerText = (Math.round(this.acceleration.y * 10) / 10).toString();
        this.zPlayerAccelerationElement.innerText = (Math.round(this.acceleration.z * 10) / 10).toString();

        if (this.mining && this.locked) {
            Store.cash += (this.locked.obj.miningRate * Store.upgrades.mining * 0.1) * delta;
            this.miningElement.innerText = "Mining";
        } else {
            this.miningElement.innerText = "Not Mining";
        }
    }

    get getDamage() {
        return 5 + Store.upgrades.damage * 2;
    }

    calculatePercentage() {
        return (this.health / this.maxHealth) * 100;
    }

    damage(damage) {
        this.regenTimer = 0;
        this.health -= damage;
        this.healthBar.style.width = (this.calculatePercentage()) + "%";

        if (this.health <= 0) {
            this.health = 0;
            this.die();
        }
    }

    die() {
        this.deathScreen.style.display = "flex";
        StoreUI.close();
        this.dead = true;
    }

    update(event, data) {
        if (event === "keydown" && data.key === "f") {
            this.lock();
        }
    }

    lock() {
        const ray = new THREE.Raycaster(new THREE.Vector3(0, 0, -10).applyQuaternion(this.rotation).add(this.position), new THREE.Vector3(0, 0, -1).applyQuaternion(this.rotation).normalize(), 0, 1000);
        const intersects = ray.intersectObjects(Window.scene.children, true);

        while (intersects.length > 0) {
            const closest = intersects.sort((a, b) => a.distance - b.distance)[0];
            intersects.pop(closest);

            const obj = closest.object;
            const object = MeshCollider.colliders.findCollider(obj);

            if (object && object.obj.isLockable) {
                this.locked = object;
                this.locked.obj.locked = true;
                break;
            }
        }
    }
}
