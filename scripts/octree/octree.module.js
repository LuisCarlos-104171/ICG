import OctTreeNode from './octreeNode.module.js';
import Boundary from "./boundary.module.js";


export default class OctTree {
    constructor(boundary, capacity) {
        this.node = new OctTreeNode(boundary);
        this.capacity = capacity;
        this.allColliders = [];
    }

    calculateSubCubeBounds(x1, y1, z1, x2, y2, z2) {
        const xMid = (x1 + x2) / 2;
        const yMid = (y1 + y2) / 2;
        const zMid = (z1 + z2) / 2;

        return [
            new Boundary(x1, y1, z1, xMid, yMid, zMid),
            new Boundary(xMid, y1, z1, x2, yMid, zMid),
            new Boundary(x1, yMid, z1, xMid, y2, zMid),
            new Boundary(xMid, yMid, z1, x2, y2, zMid),
            new Boundary(x1, y1, zMid, xMid, yMid, z2),
            new Boundary(xMid, y1, zMid, x2, yMid, z2),
            new Boundary(x1, yMid, zMid, xMid, y2, z2),
            new Boundary(xMid, yMid, zMid, x2, y2, z2)
        ];
    }

    subdivide() {
        const x1 = this.node.bounds.x
        const y1 = this.node.bounds.y
        const z1 = this.node.bounds.z

        const x2 = this.node.bounds.w
        const y2 = this.node.bounds.h
        const z2 = this.node.bounds.d

        const bounds = this.calculateSubCubeBounds(x1, y1, z1, x2, y2, z2);
        this.node.children = bounds.map(b => new OctTree(b, this.capacity));
    }

    register(collider) {
        let bounds = new Boundary(
            collider.min.x, collider.min.y, collider.min.z,
            collider.max.x, collider.max.y, collider.max.z,
        );
        this.insert(bounds, collider);
        this.allColliders.push(collider);
    }

    insert(bounds, collider) {
        if (!this.node.bounds.intersects(bounds)) {
            return false;
        }

        if (this.node.points.length < this.capacity) {
            this.node.points.push(collider);
            return true;
        }

        if (!this.node.children[0]) {
            this.subdivide();
        }

        let flag = false;
        for (let i = 0; i < this.node.children.length; i++) {
            flag = flag || this.node.children[i].insert(bounds, collider);
        }

        return flag;
    }

    colliding() {
        let results = [];
        for (const obj of this.allColliders) {
            let bounds = new Boundary(
                obj.min.x, obj.min.y, obj.min.z,
                obj.max.x, obj.max.y, obj.max.z,
            );

            this.query(bounds, obj, results);
        }

        return results;
    }

    query(bounds, collider, found) {
        if (this.node.bounds.intersects(bounds)) {
            for (let p of this.node.points) {
                if (p.id !== collider.id && this.notIn(found, p) && p.collidesWith(collider)) {
                    found.push([collider, p]);
                }
            }

            if (this.node.children[0]) {
                for (let i = 0; i < 8; i++) {
                    this.node.children[i].query(bounds, collider, found);
                }
            }
        }
    }

    remove(collider) {
        let bounds = new Boundary(
            collider.min.x, collider.min.y, collider.min.z,
            collider.max.x, collider.max.y, collider.max.z,
        );
        this.treeRemove(bounds, collider);
        this.allColliders = this.allColliders.filter(c => c.id !== collider.id);
    }

    treeRemove(bounds, collider) {
        if (!this.node.children[0]) {
            return;
        }

        if (this.node.points.filter(p => p.id === collider.id).length > 0) {
            this.node.points = this.node.points.filter(p => p.id !== collider.id);
            return;
        }

        for (let i = 0; i < this.node.children.length; i++) {
            this.node.children[i].treeRemove(bounds, collider);
        }
    }

    notIn(found, p1, p2) {
        if (p2 === undefined) {
            return found.filter(f => f[0].id === p1.id || f[1].id === p1.id).length === 0;
        }
        return found.filter(f => (f[0].id === p1.id && f[1].id === p2.id) || (f[0].id === p2.id && f[1].id === p1.id)).length === 0;
    }
}