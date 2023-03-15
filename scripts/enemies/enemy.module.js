import EnemyBody from "./enemyBody.module.js";

export default class Enemy extends EnemyBody {
    constructor(position, target) {
        super(position, target);
    }
}
