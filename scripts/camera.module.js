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
        this.angularVelocity = new THREE.Vector3(0, 0, 0);

        this.cameraSpeed = 0.1;

        this.lockDiv = document.getElementById("lock");

        this.targetPositionXElement = document.getElementById("targetPositionX");
        this.targetPositionYElement = document.getElementById("targetPositionY");
        this.targetPositionZElement = document.getElementById("targetPositionZ");

        this.targetRelativeVelocityXElement = document.getElementById("targetRelativeVelocityX");
        this.targetRelativeVelocityYElement = document.getElementById("targetRelativeVelocityY");
        this.targetRelativeVelocityZElement = document.getElementById("targetRelativeVelocityZ");
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

        // Calculate the target rotation angles based on the mouse position
        const targetRotationX = event.movementY * Math.PI * 0.1;
        const targetRotationY = event.movementX * Math.PI * 0.1;

        // Update the angular velocity
        this.angularVelocity.x -= targetRotationX * this.cameraSpeed;
        this.angularVelocity.y -= targetRotationY * this.cameraSpeed;

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

        if (event === "resize") {
            this.thirdPersonCamera.aspect = window.innerWidth / window.innerHeight;
            this.thirdPersonCamera.updateProjectionMatrix();

            this.firstPersonCamera.aspect = window.innerWidth / window.innerHeight;
            this.firstPersonCamera.updateProjectionMatrix();
        }
    }

    tick(delta) {
        super.tick(delta);

        // angular velocity
        this.angularVelocity.multiplyScalar(0.91);

        // rotation
        const deltaQuaternion = new THREE.Quaternion()
            .setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.angularVelocity.x * delta)
            .multiply(new THREE.Quaternion()
                .setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.angularVelocity.y * delta)
            )
            .multiply(new THREE.Quaternion()
                .setFromAxisAngle(new THREE.Vector3(0, 0, -1), this.angularVelocity.z * delta)
            );
        this.gfx.quaternion.multiply(deltaQuaternion);
        this.rotation = this.gfx.quaternion;

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

        if (this.locked && this.locked.obj.position.distanceTo(this.position) > 30) {
            const collider = this.locked.box;

            const cube = [
                new THREE.Vector3(collider.min.x, collider.min.y, collider.min.z),
                new THREE.Vector3(collider.min.x, collider.min.y, collider.max.z),
                new THREE.Vector3(collider.min.x, collider.max.y, collider.min.z),
                new THREE.Vector3(collider.min.x, collider.max.y, collider.max.z),
                new THREE.Vector3(collider.max.x, collider.min.y, collider.min.z),
                new THREE.Vector3(collider.max.x, collider.min.y, collider.max.z),
                new THREE.Vector3(collider.max.x, collider.max.y, collider.min.z),
                new THREE.Vector3(collider.max.x, collider.max.y, collider.max.z)
            ];

            const cubeProjections = cube.map(point => {
                let newPoint = point.clone().project(this.camera);
                newPoint.x = (newPoint.x + 1) / 2 * window.innerWidth;
                newPoint.y = -(newPoint.y - 1) / 2 * window.innerHeight;
                return newPoint;
            });

            let maxArea = 0
            const topLeftPoint = new THREE.Vector2();
            let side = 0;

            for (let p1 of cubeProjections) {
                for (let p2 of cubeProjections) {
                    if (p1 === p2) {
                        continue;
                    }

                    const area = Math.abs(p1.x - p2.x) * Math.abs(p1.y - p2.y);
                    if (area > maxArea) {
                        maxArea = area;
                        topLeftPoint.x = Math.min(p1.x, p2.x);
                        topLeftPoint.y = Math.min(p1.y, p2.y);

                        side = Math.max(Math.abs(p1.x - p2.x), Math.abs(p1.y - p2.y));
                    }
                }
            }

            this.lockDiv.style.display = "block";
            this.lockDiv.style.left = Math.round(topLeftPoint.x - 10).toString() + "px";
            this.lockDiv.style.top = Math.round(topLeftPoint.y - 10).toString() + "px";
            this.lockDiv.style.width = Math.round(side + 10).toString() + "px";
            this.lockDiv.style.height = Math.round(side + 10).toString() + "px";

            this.targetPositionXElement.innerHTML = (Math.round(this.locked.obj.position.x * 10) / 10).toString();
            this.targetPositionYElement.innerHTML = (Math.round(this.locked.obj.position.y * 10) / 10).toString();
            this.targetPositionZElement.innerHTML = (Math.round(this.locked.obj.position.z * 10) / 10).toString();

            this.targetRelativeVelocityXElement.innerHTML = (Math.round((this.velocity.x - this.locked.obj.velocity.x) * 10) / 10).toString();
            this.targetRelativeVelocityYElement.innerHTML = (Math.round((this.velocity.y - this.locked.obj.velocity.y) * 10) / 10).toString();
            this.targetRelativeVelocityZElement.innerHTML = (Math.round((this.velocity.z - this.locked.obj.velocity.z) * 10) / 10).toString();
        } else {
            this.lockDiv.style.display = "none";
        }

        if (this.locked && !this.locked.obj.locked) {
            this.locked = null;
            this.lockDiv.style.display = "none";
        }
    }
}
