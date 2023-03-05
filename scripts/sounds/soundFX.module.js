import Camera from "../camera.module.js";
import Sounds from "./sounds.module.js";
import * as THREE from "three";

export default class SoundFX {
    constructor(soundName, volume = 0.5) {
        this.audio = new THREE.Audio(Camera.audioListener);
        this.audio.setBuffer(Sounds[soundName]);
        this.audio.setVolume(volume);
    }
    play() {
        this.audio.play();
    }
}