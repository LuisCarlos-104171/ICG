export default {
    calculateFriction: function (velocity, coefficient) {
        return velocity.clone().multiplyScalar(-1).normalize().multiplyScalar(coefficient);
    }
}
