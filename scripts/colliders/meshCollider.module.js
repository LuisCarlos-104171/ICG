import * as THREE from "three";
import OctTree from "../octree/octree.module.js";
import Boundary from "../octree/boundary.module.js";

function calculateMinMax(object, scale = new THREE.Vector3(1, 1, 1)) {
    let currentMin = new THREE.Vector3(Infinity, Infinity, Infinity);
    let currentMax = new THREE.Vector3(-Infinity, -Infinity, -Infinity);

    if (object instanceof THREE.Mesh && object.visible) {
        let geo = object.geometry;
        geo.computeBoundingBox();
        let min = geo.boundingBox.min.clone().multiply(object.scale.clone().multiply(scale));
        let max = geo.boundingBox.max.clone().multiply(object.scale.clone().multiply(scale));

        currentMin.min(min);
        currentMax.max(max);
    }

    if (object instanceof THREE.Group) {
        object.children.forEach(child => {
            let minMax = calculateMinMax(child, object.scale.clone().multiply(scale));
            currentMin.min(minMax.min);
            currentMax.max(minMax.max);
        });
    }

    return { min: currentMin, max: currentMax };
}

export default class MeshCollider {
    static counter = 0;
    static colliders = new OctTree(new Boundary(-1000, -1000, -1000, 1000, 1000, 1000), 200);

    constructor(obj, mesh, fixed, onCollision=null) {
        this.obj = obj;
        this.fixed = fixed;
        this.id = MeshCollider.counter++;

        this.previousPosition = obj.position.clone();
        this.onCollision = onCollision;

        this.box = new THREE.Box3();
        let { min, max } = calculateMinMax(mesh);
        this.box.set(min.clone().add(this.obj.position), max.clone().add(this.obj.position));

        this.size = max.clone().sub(min);

        this.min = min;
        this.max = max;
        this.recalculate = false;

        MeshCollider.colliders.register(this);

        this.mesh = mesh;
        this.meshChildren = [];
        mesh.traverse(child => {
            if (child instanceof THREE.Mesh) {
                this.meshChildren.push(child);
            }
        });

        this.raycaster = new THREE.Raycaster();
    }

    collidesWith(other) {
        if (this.box.intersectsBox(other.box)) {
            let center1 = new THREE.Vector3();
            let center2 = new THREE.Vector3();

            this.box.getCenter(center1);
            other.box.getCenter(center2);

            this.raycaster.set(center1, center2.sub(center1).normalize());
            let intersection = this.raycaster.intersectObjects([this.mesh, other.mesh]);
            for (const i of intersection) {
                if (this.meshChildren.includes(i.object) || other.meshChildren.includes(i.object)) {
                    intersection.splice(intersection.indexOf(i), 1);
                }
            }

            return intersection.length > 0 && intersection[0].distance <= center1.distanceTo(center2);
        }
        return false;
    }

    destroy() {
        MeshCollider.colliders.remove(this);
    }

    static processCollisions() {
        for (const collider of MeshCollider.colliders.allColliders) {
            if (collider.obj.position.distanceTo(collider.previousPosition) > 0.001) {
                collider.previousPosition = collider.obj.position.clone();
                const { min, max } = calculateMinMax(collider.mesh);

                collider.box.set(min.clone().add(collider.obj.position), max.clone().add(collider.obj.position));
                this.min = min;
                this.max = max;

                if (collider.recalculate) {
                    MeshCollider.colliders.remove(collider);
                    MeshCollider.colliders.register(collider);
                }
            }
        }

        for (const [a, b] of MeshCollider.colliders.colliding()) {
            let onCollisionA = a.onCollision === null || a.onCollision(b);
            let onCollisionB = b.onCollision === null || b.onCollision(a);

            if (a.fixed || b.fixed) {
                a.obj.position = a.previousPosition.clone();
                b.obj.position = b.previousPosition.clone();

                // reset the velocity
                if (!a.fixed && onCollisionA) {
                    a.obj.velocity = new THREE.Vector3(0, 0, 0);
                }

                if (!b.fixed && onCollisionB) {
                    b.obj.velocity = new THREE.Vector3(0, 0, 0);
                }

                continue;
            }

            let ua = a.obj.velocity.clone();
            let ub = b.obj.velocity.clone();

            let ma = a.obj.mass;
            let mb = b.obj.mass;

            const constant = ua.clone().multiplyScalar(ma).add(ub.clone().multiplyScalar(mb));
            const ub_ua = ub.clone().sub(ua).multiplyScalar(a.obj.Cr * mb);
            const ua_ub = ua.clone().sub(ub).multiplyScalar(b.obj.Cr * ma);

            let va = constant.clone().add(ub_ua).divideScalar(ma + mb);
            let vb = constant.clone().add(ua_ub).divideScalar(ma + mb);

            if (onCollisionA) {
                a.obj.acceleration = new THREE.Vector3(0, 0, 0);
                a.obj.velocity = va;
                a.obj.position = a.previousPosition.clone();
            }

            if (onCollisionB) {
                b.obj.acceleration = new THREE.Vector3(0, 0, 0);
                b.obj.velocity = vb;
                b.obj.position = b.previousPosition.clone();
            }
        }


    }

    static debug(scene) {
        for (const collider of MeshCollider.colliders.allColliders) {
            const box = new THREE.Box3Helper(collider.box, 0xff0000);
            scene.add(box);
        }
    }
}