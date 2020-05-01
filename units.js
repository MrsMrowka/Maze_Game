function units() {
    function getTiltDirection(xTilt, yTilt) {
        const horizontal = xTilt > 1 ? 1 : xTilt < -1 ? -1 : 0;
        const vertical = yTilt > 1 ? 1 : yTilt < -1 ? -1 : 0;
        return { horizontal, vertical };
    }

    return {
        getTiltDirection
    };
}