export default class Store {
    static state = {
        score: 0,
        level: 0,
        cash: 100,
        upgrades: {
            health: 1,
            damage: 1,
            mining: 1,
        },
        currentCosts: {
            health: 5,
            damage: 5,
            mining: 5,
        }
    };

    static scoreElement = document.getElementById("score");
    static levelElement = document.getElementById("level");
    static cashElement = document.getElementById("cash");

    static updateState() {
        this.scoreElement.innerText = this.state.score;
        this.levelElement.innerText = this.state.level;
        this.cashElement.innerText = this.state.cash.toFixed(2);
    }

    static get state() {
        return this.state;
    }

    static set level(newLevel) {
        this.state.level = newLevel;
        this.updateState();
    }

    static set score(newScore) {
        this.state.score = newScore;
        this.updateState();
    }

    static set cash(newCash) {
        this.state.cash = newCash
        this.updateState();
    }

    static get upgrades() {
        return this.state.upgrades;
    }

    static get level() {
        return this.state.level;
    }

    static get score() {
        return this.state.score;
    }

    static get cash() {
        return this.state.cash;
    }

    static buyUpgradeMiningLevel() {
        if (this.cash >= this.state.currentCosts.mining) {
            this.cash -= this.state.currentCosts.mining;
            this.upgrades.mining += 1;
            this.state.currentCosts.mining = Math.round(Math.pow(this.upgrades.mining, 1.7) + 5);
        }
    }

    static buyUpgradeHealthLevel() {
        if (this.cash >= this.state.currentCosts.health) {
            this.cash -= this.state.currentCosts.health;
            this.upgrades.health += 1;
            this.state.currentCosts.health = Math.round(Math.pow(this.upgrades.health, 1.7) + 5);
        }
    }

    static buyUpgradeDamageLevel() {
        if (this.cash >= this.state.currentCosts.damage) {
            this.cash -= this.state.currentCosts.damage;
            this.upgrades.damage += 1;
            this.state.currentCosts.damage = Math.round(Math.pow(this.upgrades.damage, 1.7) + 5);
        }
    }

    static buyUpgrade(upgrade) {
        switch (upgrade) {
            case "health":
                this.buyUpgradeHealthLevel();
                break;
            case "damage":
                this.buyUpgradeDamageLevel();
                break;
            case "mining":
                this.buyUpgradeMiningLevel();
                break;
        }
    }
}
