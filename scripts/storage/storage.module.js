import Store from "../store/store.module.js";

export default class Storage {
    static currentState = this.deserialize();

    static serialize() {
        this.currentState = {
            runHistory: [{
                score: Store.score,
                ts: Date.now(),
            }, ...this.currentState.runHistory],
            highestScore: Math.max(Store.score, this.currentState.highestScore ?? 0),
            cash: Store.cash,
        }

        localStorage.setItem('game', JSON.stringify(this.currentState));
    }

    static deserialize() {
        if (localStorage.getItem('game') === null) {
            return {
                runHistory: [],
                highestScore: null,
                cash: 0,
            }
        } else {
            return JSON.parse(localStorage.getItem('game'));
        }
    }
}
