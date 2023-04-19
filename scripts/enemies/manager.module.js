import * as THREE from 'three';
import Enemy from "./enemy.module.js";
import Store from "../store/store.module.js";


export default class EnemyManager {
    constructor(player, window) {
        this.enemies = [];
        this.win = window;
        this.player = player;
        this.interval = setInterval(this.tick.bind(this), 1000);

        this.probability = 0.02;
        this.currentProbability = this.probability;
    }

    addEnemy(enemy) {
        this.enemies.push(enemy);
        this.win.addObject(enemy);
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

    randomUnitVector() {
        let x = Math.random() * 2 - 1;
        let y = Math.random() * 2 - 1;
        let z = Math.random() * 2 - 1;

        return new THREE.Vector3(x, y, z).normalize();
    }

    newWave() {
        Store.level += 1;
        this.probability = 0;

        for (let i = 0; i < Store.level; i++) {
            let position = new THREE.Vector3(
                this.gaussianRandom(0, 10),
                this.gaussianRandom(0, 10),
                this.gaussianRandom(0, 10)
            ).normalize().multiplyScalar(this.randomInRange(200, 500)).add(this.player.position);

            let enemy = new Enemy(position, this.player, this.win);
            this.addEnemy(enemy);
        }
    }

    tick() {
        Store.score += this.enemies.filter(enemy => enemy.health <= 0).length;
        this.enemies = this.enemies.filter(enemy => enemy.health > 0);
        if (this.enemies.length === 0) {
            this.probability = this.currentProbability;
            if (Math.random() < this.probability) {
                this.newWave();
            } else {
                this.probability += 0.01;
            }
        }
    }
}
