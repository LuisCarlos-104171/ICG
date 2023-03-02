import * as THREE from 'three';


export default class Boundary {
    constructor(x, y, z, w, h, d) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        this.h = h;
        this.d = d;

        this.box = new THREE.Box3(
            new THREE.Vector3(x, y, z),
            new THREE.Vector3(w, h, d)
        );
    }

    contains(bounds) {
        return this.x < bounds.x && this.w > bounds.w &&
            this.y < bounds.y && this.h > bounds.h &&
            this.z < bounds.z && this.d > bounds.d;
    }

    intersects(range) {
        return this.box.intersectsBox(range.box)
    }
}
