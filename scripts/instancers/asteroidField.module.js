import * as THREE from 'three';
import Asteroid from "../primitives/asteroid.module.js";

export default class AsteroidField {
    constructor(player, window) {
        this.player = player;
        this.win = window;
        this.asteroids = [];
        this.maxEntities = 300;

        this.interval = setInterval(this.spawnAsteroid.bind(this), 300);
        this.spawnAsteroid();
    }

    gaussianRandom(mean=0, stdev=1) {
        let u = 1 - Math.random(); //Converting [0,1) to (0,1)
        let v = Math.random();
        let z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
        // Transform to the desired mean and standard deviation:
        return z * stdev + mean;
    }

    randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    spawnAsteroid() {
        console.log(this.asteroids.length)
        this.asteroids = this.asteroids.filter(asteroid => {
            if (Math.pow(asteroid.position.x - this.player.position.x, 2) + Math.pow(asteroid.position.y - this.player.position.y, 2) + Math.pow(asteroid.position.z - this.player.position.z, 2) > 250000) {
                asteroid.destroy();
                return false;
            }
            return true;
        });

        if (this.asteroids.length >= this.maxEntities) {
            return;
        }

        const n = Math.random() * 100;
        const size = Math.random() * 10 + 5;

        for (let i = 0; i < n; i++) {
            if (this.asteroids.length >= this.maxEntities) {
                return;
            }

            let position = new THREE.Vector3(
                this.gaussianRandom(0, 10),
                this.gaussianRandom(0, 10),
                this.gaussianRandom(0, 10)
            ).normalize().multiplyScalar(this.randomInRange(200, 500)).add(this.player.position);

            let asteroid = new Asteroid(position, size, this.win);

            asteroid.velocity = this.randomUnitVector().multiplyScalar(Math.random() * 5 + 5);
            this.asteroids.push(asteroid);
            this.win.addObject(asteroid);
        }
    }

    randomUnitVector() {
        let x = Math.random() * 2 - 1;
        let y = Math.random() * 2 - 1;
        let z = Math.random() * 2 - 1;

        return new THREE.Vector3(x, y, z).normalize();
    }
}
