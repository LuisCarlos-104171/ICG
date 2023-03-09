import * as THREE from "three";
import Player from "./entities/player.module.js";
import Input from "./input/input.module.js";
import Models from "./models.module.js";


export default class Camera extends Player {
    static audioListener = null;

    constructor() {
        super();
        this.skybox = new THREE.Mesh(
            new THREE.BoxGeometry(1000, 1000, 1000),
            [
                new THREE.MeshBasicMaterial({ fog: false, map: new THREE.TextureLoader().load("images/skybox/corona_ft.png"), side: THREE.DoubleSide }),
                new THREE.MeshBasicMaterial({ fog: false, map: new THREE.TextureLoader().load("images/skybox/corona_bk.png"), side: THREE.DoubleSide }),
                new THREE.MeshBasicMaterial({ fog: false, map: new THREE.TextureLoader().load("images/skybox/corona_up.png"), side: THREE.DoubleSide }),
                new THREE.MeshBasicMaterial({ fog: false, map: new THREE.TextureLoader().load("images/skybox/corona_dn.png"), side: THREE.DoubleSide }),
                new THREE.MeshBasicMaterial({ fog: false, map: new THREE.TextureLoader().load("images/skybox/corona_rt.png"), side: THREE.DoubleSide }),
                new THREE.MeshBasicMaterial({ fog: false, map: new THREE.TextureLoader().load("images/skybox/corona_lf.png"), side: THREE.DoubleSide })
            ]
        );

        this.gfx = new THREE.Group();
        this.model = null;

        this.thirdPersonCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.thirdPersonCamera.position.set(0, 4, 10);
        this.gfx.add(this.thirdPersonCamera);

        this.firstPersonCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.firstPersonCamera.position.set(0, 0.5, -2.5);
        this.firstPersonCameraDesire = new THREE.Vector3(0, 0.5, -2.5);
        this.firstPersonCameraDefault = new THREE.Vector3(0, 0.5, -2.5);
        this.gfx.add(this.firstPersonCamera);

        this.camera = this.thirdPersonCamera;
        this.speedometer = document.getElementById("speedometer");

        this.prev = { x: 0, y: 0 };
    }

    onModelsLoaded() {
        super.onModelsLoaded();

        this.model = Models.spaceship;
        this.model.rotation.y += -Math.PI / 2;
        this.gfx.add(this.model);
    }

    rotate(event) {
        const mouseX = this.prev.x + event.movementX;
        const mouseY = this.prev.y + event.movementY;

        // Calculate the normalized position of the mouse in the viewport (-1 to +1)
        const normalizedMouseX = -(mouseX / window.innerWidth) * 2 - 1;
        const normalizedMouseY = -(mouseY / window.innerHeight) * 2 - 1;

        // Calculate the target rotation angles based on the mouse position
        const targetRotationX = normalizedMouseY * Math.PI;
        const targetRotationY = normalizedMouseX * Math.PI;

        // Create a new Quaternion representing the clamped rotation
        const targetQuaternion = new THREE.Quaternion()
            .setFromAxisAngle(new THREE.Vector3(0, 1, 0), targetRotationY)
            .multiply(new THREE.Quaternion()
                .setFromAxisAngle(new THREE.Vector3(1, 0, 0), targetRotationX)
            );

        // Rotate the camera's quaternion towards the target quaternion
        const speed = 0.2; // Adjust this to change the rotation speed
        this.gfx.quaternion.slerp(targetQuaternion, speed);
        this.rotation = this.gfx.quaternion;

        this.prev.x = mouseX;
        this.prev.y = mouseY;
    }

    update(event, data) {
        super.update(event, data);

        if (event === "mouseclick") {
            Input.requestPointerLock();
            if (!Camera.audioListener) {
                Camera.audioListener = new THREE.AudioListener();

                this.thirdPersonCamera.add(Camera.audioListener);
                this.firstPersonCamera.add(Camera.audioListener);
            }
        }

        if (event === "keydown" && data.key === "1") {
            if (this.camera !== this.thirdPersonCamera) {
                this.camera = this.thirdPersonCamera;
                this.speedometer.style.left = "0";
                this.speedometer.style.bottom = "10%";
                this.speedometer.style.transform = "translate(0, 0)";
            }
        }

        if (event === "keydown" && data.key === "2") {
            if (this.camera !== this.firstPersonCamera) {
                this.camera = this.firstPersonCamera;
                this.speedometer.style.left = "50%";
                this.speedometer.style.bottom = "20%";
                this.speedometer.style.transform = "translate(-50%, 0)";
            }
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

        if (this.movement.length() > 0) {
            const move = this.movement.clone().divideScalar(4000).multiplyScalar(0.3).add(this.firstPersonCameraDefault);
            this.firstPersonCameraDesire = new THREE.Vector3(move.x, move.y * 0.07 + this.firstPersonCameraDefault.y, move.z);
        } else {
            this.firstPersonCameraDesire = this.firstPersonCameraDefault;
        }

        this.firstPersonCamera.position.lerp(this.firstPersonCameraDesire, delta);

        this.gfx.position.x = this.position.x;
        this.gfx.position.y = this.position.y;
        this.gfx.position.z = this.position.z;

        this.skybox.position.x = this.position.x;
        this.skybox.position.y = this.position.y;
        this.skybox.position.z = this.position.z;
    }
}
