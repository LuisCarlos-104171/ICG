import Camera from "../camera.module.js";
import Sounds from "./sounds.module.js";
import * as THREE from "three";

export default class SoundFX {
    constructor(soundName, volume = 0.5) {
        this.sound = Sounds[soundName];
        this.volume = volume;
    }
    play() {
        if (!Camera.audioListener)
            return

        let sound;
        if (this.sound instanceof Array) {
            sound = this.sound[Math.floor(Math.random() * this.sound.length)];
        } else {
            sound = this.sound;
        }

        this.audio = new THREE.Audio(Camera.audioListener);
        this.audio.setBuffer(sound);
        this.audio.setVolume(this.volume);
        this.audio.play();
    }
}