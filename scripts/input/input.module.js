export default class Input {
    static all = [];
    static pressedKeys = [];
    static pointerLock = false;

    static requestPointerLock() {
        document.body.requestPointerLock();
    }

    static isPressed(k) {
        if (k in Input.pressedKeys) {
            return Input.pressedKeys[k];
        }
        return false;
    }

    static resize(event) {
        Input.all.forEach(inp => inp.update("resize", event));
    }

    static mouseMove(event) {
        Input.all.forEach(character => character.update("mousemove", event));
    }

    static mouseDown(event) {
        Input.all.forEach(character => character.update("mousedown", event));
    }

    static mouseUp(event) {
        Input.all.forEach(character => character.update("mouseup", event));
    }

    static mouseClick(event) {
        Input.all.forEach(character => character.update("mouseclick", event));
    }

    static keyDown(event) {
        Input.pressedKeys[event.key] = true;
        Input.all.forEach(character => character.update("keydown", event));
    }

    static keyUp(event) {
        Input.pressedKeys[event.key] = false;
        Input.all.forEach(character => character.update("keyup", event));
    }

    static update(delta) {
        Input.all.forEach(inp => inp.tick(delta));
    }

    constructor() {
        this.id = Input.all.length;
        Input.all.push(this);

        document.addEventListener('mousemove', Input.mouseMove);
        document.addEventListener('click', Input.mouseClick);
        document.addEventListener('mousedown', Input.mouseDown);
        document.addEventListener('mouseup', Input.mouseUp);
        document.addEventListener('keydown', Input.keyDown);
        document.addEventListener('keyup', Input.keyUp);
        window.addEventListener('resize', Input.resize);

        // pointer lock
        document.addEventListener('pointerlockchange', () => Input.pointerLock = document.pointerLockElement === document.body);
    }

    update(event, data) {
        // Override this
    }

    tick(delta) {
        // Override this
    }

    destroy() {
        Input.all.splice(this.id, 1);
    }
}
