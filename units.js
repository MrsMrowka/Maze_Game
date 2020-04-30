function units() {
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function getTiltDirection(xTilt, yTilt) {
        const horizontal = xTilt > 1 ? 1 : xTilt < -1 ? -1 : 0;
        const vertical = yTilt > 1 ? 1 : yTilt < -1 ? -1 : 0;
        return { horizontal, vertical };
    }

    return {
        getRandomInt,
        getTiltDirection
    };
}
