import Store from "./store.module.js";

export default class StoreUI {
    constructor() {
        this.storeFrontElement = document.getElementById("storeFront");

        for (const upgrade in Store.state.upgrades) {
            const upgradeElement = document.createElement("div");
            const upgradeButton = document.createElement("button");
            const upgradeCost = document.createElement("span");
            const upgradeName = document.createElement("span");

            upgradeElement.classList.add("upgrade");
            upgradeButton.classList.add("upgradeButton");
            upgradeCost.classList.add("upgradeCost");

            upgradeName.innerText = upgrade;
            upgradeCost.innerText = Store.state.currentCosts[upgrade];
            upgradeButton.innerText = "Buy";

            upgradeButton.onclick = function(ev) {
                Store.buyUpgrade(upgrade);
                this.upgradeCost.innerText = Store.state.currentCosts[upgrade];

                ev.stopPropagation();
            }.bind({upgradeCost});

            upgradeElement.appendChild(upgradeName);
            upgradeElement.appendChild(upgradeButton);
            upgradeElement.appendChild(upgradeCost);

            this.storeFrontElement.appendChild(upgradeElement);
        }
    }
}
