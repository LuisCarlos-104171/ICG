import Store from "./store.module.js";

export default class StoreUI {
    constructor() {
        this.storeFrontElement = document.getElementById("storeFront");

        for (const upgrade in Store.state.upgrades) {
            const upgradeElement = document.createElement("div");
            const upgradeButton = document.createElement("button");
            const upgradeCost = document.createElement("span");
            const upgradeName = document.createElement("span");
            const upgradeLevel = document.createElement("span");

            upgradeElement.classList.add("upgrade");

            upgradeButton.classList.add("upgradeButton");
            upgradeCost.classList.add("upgradeCost");
            upgradeName.classList.add("upgradeName");
            upgradeLevel.classList.add("upgradeLevel");

            upgradeName.innerText = upgrade;
            upgradeCost.innerText = Store.state.currentCosts[upgrade];
            upgradeLevel.innerText = Store.state.upgrades[upgrade];
            upgradeButton.innerText = "Buy";

            upgradeButton.onclick = function(ev) {
                Store.buyUpgrade(upgrade);
                this.upgradeCost.innerText = Store.state.currentCosts[upgrade];
                this.upgradeLevel.innerText = Store.state.upgrades[upgrade];

                ev.stopPropagation();
            }.bind({upgradeCost, upgradeLevel});

            upgradeElement.appendChild(upgradeName);
            upgradeElement.appendChild(upgradeButton);
            upgradeElement.appendChild(upgradeCost);
            upgradeElement.appendChild(upgradeLevel);

            this.storeFrontElement.appendChild(upgradeElement);
        }
    }

    static close() {
        document.getElementById("storeFront").style.display = "none";
        console.log("STORE CLOSED")
    }
}
