import Input from "./input/input.module.js";

export default class PauseControl extends Input {
    constructor() {
        super();

        this.paused = false;
        this.pauseElement = document.getElementById("pause_controls");
    }

    update(event, data) {
        if (data.key === "p" && event === "keydown") {
            this.paused = !this.paused;
            this.pauseElement.style.display = this.paused ? "block" : "none";
        }
    }
}