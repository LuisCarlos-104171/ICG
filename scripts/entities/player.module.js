import * as THREE from 'three';
import Input from "../input/input.module.js";
import Constants from "../constants.module.js";
import physics from "../physics.module.js";
import MeshCollider from "../colliders/meshCollider.module.js";
import Models from "../models.module.js";


export default class Player extends Input {
    constructor() {
        super();

        this.position = new THREE.Vector3(0, 0, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.acceleration = new THREE.Vector3(0, 0, 0);

        this.Cr = 0.6;
        this.mass = 100;

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
    }

    takeDamage(damage) {
        console.log("Player took " + damage + " damage!");
    }
}
