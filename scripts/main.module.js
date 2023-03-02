import * as THREE from 'three';
import { GLTFLoader } from "addons/loaders/GLTFLoader.js";
import Window from './window.module.js';
import Camera from './camera.module.js';
import primitives from './primitives/primitives.module.js';
import Gun from "./instancers/gun.module.js";
import AsteroidField from "./instancers/asteroidField.module.js";
import Models from "./models.module.js";

function run() {
    const camera = new Camera();
    const window = new Window(camera);

    let start = Date.now();

    const models = [
        ["models/spaceship.gltf", "spaceship"],
        ["models/asteroid01.glb", "asteroid01"]
    ];

    const loader = new GLTFLoader();
    const promises = models.map(([model, name]) => new Promise((resolve, _) => {
        loader.load(model, (gltf) => {
            resolve({scene: gltf.scene, name: name});
        });
    }));

    Promise.all(promises).then((results) => {
        results.forEach(result => {
            Models[result.name] = result.scene;
        });

        // instance creators
        const gunLeft = new Gun(camera, window, new THREE.Vector3(-10, -6, -10));
        const gunRight = new Gun(camera, window, new THREE.Vector3(10, -6, -10));
        const asteroidField = new AsteroidField(camera, window);

        let cube = new primitives.Cube(100, new THREE.Vector3(0, 0, -30), 10, 0xff0000, 130, true, false);
        window.addObject(cube);
        cube = new primitives.Cube(100, new THREE.Vector3(30, 0, -30), 10, 0x00ff00, 130, true, false);
        window.addObject(cube);

        let ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        window.scene.add(ambientLight);

        camera.onModelsLoaded();
        requestAnimationFrame(updateLoop);
    });

    const updateLoop = () => {
        requestAnimationFrame(updateLoop);

        const delta = Date.now() - start;
        start = Date.now();
        window.tick(delta / 1000);
        window.render();
    }
}

run();
