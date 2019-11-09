var TSOS;
(function (TSOS) {
    var Disk = /** @class */ (function () {
        function Disk(trackNumber, sectorNumber, blockNumber, dataSize) {
            if (trackNumber === void 0) { trackNumber = 4; }
            if (sectorNumber === void 0) { sectorNumber = 8; }
            if (blockNumber === void 0) { blockNumber = 8; }
            if (dataSize === void 0) { dataSize = 60; }
            this.trackNumber = trackNumber;
            this.sectorNumber = sectorNumber;
            this.blockNumber = blockNumber;
            this.dataSize = dataSize;
        }
        Disk.prototype.init = function () {
            // Initialize disk space
            for (var t = 0; t < this.trackNumber; t++) {
                for (var s = 0; s < this.sectorNumber; s++) {
                    for (var b = 0; b < this.blockNumber; b++) {
                        var availability = 0; // If the block is free to be used
                        var pointer = '-1:-1:-1'; // The next associated block address
                        var data = Array(this.dataSize).fill("00"); // Hex values of files or programs
                        sessionStorage.setItem(t + ":" + s + ":" + b, JSON.stringify({ availability: availability,
                            pointer: pointer,
                            data: data }));
                    }
                }
            }
        };
        return Disk;
    }());
    TSOS.Disk = Disk;
})(TSOS || (TSOS = {}));
