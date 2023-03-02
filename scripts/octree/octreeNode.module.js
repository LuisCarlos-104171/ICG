export default class OctreeNode {
     constructor(bounds) {
        this.bounds = bounds;
        this.children = new Array(8);
        this.points = [];
    }
}