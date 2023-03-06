import * as THREE from 'three';
import { GLTFLoader } from "addons/loaders/GLTFLoader.js";
import Window from './window.module.js';
import Camera from './camera.module.js';
import primitives from './primitives/primitives.module.js';
import Gun from "./instancers/gun.module.js";
import AsteroidField from "./instancers/asteroidField.module.js";
import Models from "./models.module.js";
import Sounds from "./sounds/sounds.module.js";

function run() {
    const camera = new Camera();
    const window = new Window(camera);
    let frames = 0;
    let fpsCounter = 0;

    let start = Date.now();

    const models = [
        ["models/spaceship.gltf", "spaceship"],
        ["models/asteroid01.gltf", "asteroid01"]
    ];

    const sounds = [
        ["sounds/shooting.wav", "shot"],
        ["sounds/explosion.wav", "explosion"]
    ];

    const loader = new GLTFLoader();
    const soundLoader = new THREE.AudioLoader();

    let promises = models.map(([model, name]) => new Promise((resolve, _) => {
        loader.load(model, (gltf) => {
            resolve({type: "model", scene: gltf.scene, name: name});
        });
    }));

    promises = promises.concat(sounds.map(([sound, name]) => new Promise((resolve, _) => {
        soundLoader.load(sound, buffer => {
            resolve({type: "sound", sound: buffer, name: name});
        });
    })));

    Promise.all(promises).then((results) => {
        results.forEach(result => {
            if (result.type === "sound") {
                Sounds[result.name] = result.sound;
            } else {
                Models[result.name] = result.scene;
            }
        });

        // instance creators
        new Gun(camera, window, new THREE.Vector3(-5, -6, -3), new THREE.Vector3(0, 0, -500));
        new Gun(camera, window, new THREE.Vector3(5, -6, -3), new THREE.Vector3(0, 0, -500));
        new AsteroidField(camera, window);

        let ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        window.scene.add(ambientLight);

        camera.onModelsLoaded();
        requestAnimationFrame(updateLoop);
    });

    const updateLoop = () => {
        requestAnimationFrame(updateLoop);

        const delta = Date.now() - start;
        start = Date.now();
        fpsCounter += delta;
        frames++;
        if (fpsCounter > 500) {
            console.log(fpsCounter)
            document.getElementById("fps").innerHTML = Math.round(frames / (fpsCounter / 1000)) + " fps";
            fpsCounter = 0;
            frames = 0;
        }

        if (window.paused) {
            return;
        }
        window.tick(delta / 1000);
        window.render();
    }
}

run();
