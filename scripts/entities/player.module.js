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

        this.Cr = 1;
        this.mass = 100;

        this.rotation = new THREE.Quaternion();
        this.collider = null;
        // new BoxCollider(this, new THREE.Vector3(2, 2, 2), false);
    }

    addForce(force) {
        this.acceleration.add(force.clone().divideScalar(this.mass));
    }

    onModelsLoaded() {
        this.collider = new MeshCollider(this, Models.spaceship, false);
    }

    tick(delta) {
        this.acceleration.set(0, 0, 0);
        let movement = new THREE.Vector3(0, 0, 0);
        let yAxis = 0;

        if (Input.isPressed("w")) {
            movement.z -= 1;
        }

        if (Input.isPressed("s")) {
            movement.z += 1;
        }

        if (Input.isPressed("a")) {
            movement.x -= 1;
        }

        if (Input.isPressed("d")) {
            movement.x += 1;
        }

        if (Input.isPressed("e")) {
            yAxis = 1;
        }

        if (Input.isPressed("q")) {
            yAxis = -1;
        }

        movement.normalize().multiplyScalar(4000).applyQuaternion(this.rotation);
        movement.y = yAxis * 2000;
        this.addForce(movement);

        // friction
        this.addForce(physics.calculateFriction(this.velocity, Constants.PLAYER_FRICTION));

        this.velocity.add(this.acceleration.multiplyScalar(delta));
        this.position.add(this.velocity.clone().multiplyScalar(delta));

        document.getElementById("playerPositionX").innerText = "X: " + (Math.round(this.position.x * 10) / 10).toString();
        document.getElementById("playerPositionY").innerText = "Y: " + (Math.round(this.position.y * 10) / 10).toString();
        document.getElementById("playerPositionZ").innerText = "Z: " + (Math.round(this.position.z * 10) / 10).toString();

        document.getElementById("playerVelocityX").innerText = "X: " + (Math.round(this.velocity.x * 10) / 10).toString();
        document.getElementById("playerVelocityY").innerText = "Y: " + (Math.round(this.velocity.y * 10) / 10).toString();
        document.getElementById("playerVelocityZ").innerText = "Z: " + (Math.round(this.velocity.z * 10) / 10).toString();

        document.getElementById("playerAccelerationX").innerText = "X: " + (Math.round(this.acceleration.x * 10) / 10).toString();
        document.getElementById("playerAccelerationY").innerText = "Y: " + (Math.round(this.acceleration.y * 10) / 10).toString();
        document.getElementById("playerAccelerationZ").innerText = "Z: " + (Math.round(this.acceleration.z * 10) / 10).toString();
    }

    takeDamage(damage) {
        console.log("Player took " + damage + " damage!");
    }
}
