import * as THREE from "three";
import Player from "./entities/player.module.js";
import Input from "./input/input.module.js";
import Models from "./models.module.js";


export default class Camera extends Player {
    constructor() {
        super();
        this.skybox = new THREE.Mesh(
            new THREE.BoxGeometry(1000, 1000, 1000),
            [
                new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("images/skybox/corona_ft.png"), side: THREE.DoubleSide }),
                new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("images/skybox/corona_bk.png"), side: THREE.DoubleSide }),
                new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("images/skybox/corona_up.png"), side: THREE.DoubleSide }),
                new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("images/skybox/corona_dn.png"), side: THREE.DoubleSide }),
                new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("images/skybox/corona_rt.png"), side: THREE.DoubleSide }),
                new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("images/skybox/corona_lf.png"), side: THREE.DoubleSide })
            ]
        );
        this.gfx = new THREE.Group();

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 4, 10);
        this.gfx.add(this.camera);

        this.prev = { x: 0, y: 0 };
    }

    onModelsLoaded() {
        super.onModelsLoaded();

        let model = Models.spaceship;
        // point the model forward
        model.rotation.y = -Math.PI / 2;

        this.gfx.add(model);
    }

    rotate(event) {
        const mouseX = this.prev.x + event.movementX;
        const mouseY = this.prev.y + event.movementY;

        // Calculate the normalized position of the mouse in the viewport (-1 to +1)
        const normalizedMouseX = -(mouseX / window.innerWidth) * 2 - 1;
        const normalizedMouseY = -(mouseY / window.innerHeight) * 2 + 1;

        // Calculate the target rotation angles based on the mouse position
        const targetRotationX = normalizedMouseY * Math.PI; // Limit vertical rotation to 90 degrees
        const targetRotationY = normalizedMouseX * Math.PI;

        // Clamp the target rotation angles
        const minRotationX = -Math.PI * 0.5; // Minimum vertical rotation is -90 degrees
        const maxRotationX = Math.PI * 0.5; // Maximum vertical rotation is 90 degrees
        const clampedRotationX = Math.max(minRotationX, Math.min(maxRotationX, targetRotationX));

        // Create a new Quaternion representing the clamped rotation
        const targetQuaternion = new THREE.Quaternion()
            .setFromAxisAngle(new THREE.Vector3(0, 1, 0), targetRotationY)
            .multiply(new THREE.Quaternion()
                .setFromAxisAngle(new THREE.Vector3(1, 0, 0), clampedRotationX)
            );

        // Rotate the camera's quaternion towards the target quaternion
        const speed = 0.2; // Adjust this to change the rotation speed
        this.gfx.quaternion.slerp(targetQuaternion, speed);
        this.rotation = this.gfx.quaternion;

        this.prev.x = mouseX;
        this.prev.y = Math.min(mouseY, window.innerHeight);
    }

    update(event, data) {
        super.update(event, data);

        if (event === "mouseclick") {
            Input.requestPointerLock();
        }

        if (event === "mousemove") {
            if (Input.pointerLock) {
                this.rotate(data);
            } else {
                this.prev.x = data.clientX;
                this.prev.y = data.clientY;
            }
        }
    }

    tick(delta) {
        super.tick(delta);

        this.gfx.position.x = this.position.x;
        this.gfx.position.y = this.position.y;
        this.gfx.position.z = this.position.z;

        this.skybox.position.x = this.position.x;
        this.skybox.position.y = this.position.y;
        this.skybox.position.z = this.position.z;
    }
}
