import * as THREE from 'three';
import physics from "./physics.module.js";
import Constants from "./constants.module.js";


export default class Body {
    static bodies = [];

    static update(delta) {
        Body.bodies.forEach(body => body.update(delta));
    }

    constructor(size, mass, position, Cr=1) {
        this.position = position;
        this.size = size;
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.acceleration = new THREE.Vector3(0, 0, 0);

        this.Cr = Cr;

        Body.bodies.push(this);

        this.mass = mass;
    }

    applyForce(force) {
        this.acceleration.add(force.clone().divideScalar(this.mass));
    }

    update(delta) {
        this.applyForce(physics.calculateFriction(this.velocity, Constants.PLAYER_FRICTION));

        this.velocity.add(this.acceleration.multiplyScalar(delta));
        this.position.add(this.velocity.clone().multiplyScalar(delta));
        this.acceleration = new THREE.Vector3(0, 0, 0);
    }

    destroy() {
        Body.bodies.splice(Body.bodies.indexOf(this), 1);
    }
}
