import * as THREE from 'three';
import Asteroid from "../primitives/asteroid.module.js";

export default class AsteroidField {
    constructor(player, window) {
        this.player = player;
        this.win = window;
        this.asteroids = [];
        this.maxEntities = 500;

        this.interval = setInterval(this.spawnAsteroid.bind(this), 1000);
        this.spawnAsteroid();
    }

    gaussianRandom(mean=0, stdev=1) {
        let u = 1 - Math.random(); //Converting [0,1) to (0,1)
        let v = Math.random();
        let z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
        // Transform to the desired mean and standard deviation:
        return z * stdev + mean;
    }

    spawnAsteroid() {
        const n = Math.random() * 100;
        const size = Math.random() * 10 + 5;

        for (let i = 0; i < n; i++) {
            let position = new THREE.Vector3(
                this.gaussianRandom(0, 10),
                this.gaussianRandom(0, 10),
                this.gaussianRandom(0, 10)
            ).normalize().multiplyScalar(Math.random() * 300 + 200);

            let asteroid = new Asteroid(position, size);

            asteroid.velocity = this.randomUnitVector().multiplyScalar(Math.random() * 5 + 5);
            this.asteroids.push(asteroid);
            this.win.addObject(asteroid);
        }

        if (this.asteroids.length > this.maxEntities) {
            clearInterval(this.interval);
            for (let i = 0; i < this.asteroids.length - this.maxEntities; i++) {
                this.asteroids[i].destroy();
            }
            this.asteroids = this.asteroids.slice(this.asteroids.length - this.maxEntities);
        }
    }

    randomUnitVector() {
        let x = Math.random() * 2 - 1;
        let y = Math.random() * 2 - 1;
        let z = Math.random() * 2 - 1;

        return new THREE.Vector3(x, y, z).normalize();
    }
}
