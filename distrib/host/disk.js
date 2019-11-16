var TSOS;
(function (TSOS) {
    var Disk = /** @class */ (function () {
        function Disk(trackNumber, sectorNumber, blockNumber, headSize, dataSize) {
            if (trackNumber === void 0) { trackNumber = 4; }
            if (sectorNumber === void 0) { sectorNumber = 8; }
            if (blockNumber === void 0) { blockNumber = 8; }
            if (headSize === void 0) { headSize = 4; }
            if (dataSize === void 0) { dataSize = 60; }
            this.trackNumber = trackNumber;
            this.sectorNumber = sectorNumber;
            this.blockNumber = blockNumber;
            this.headSize = headSize;
            this.dataSize = dataSize;
        }
        Disk.prototype.init = function () {
            // Initialize disk space
            for (var t = 0; t < this.trackNumber; t++) {
                for (var s = 0; s < this.sectorNumber; s++) {
                    for (var b = 0; b < this.blockNumber; b++) {
                        this.initBlock(t + ":" + s + ":" + b);
                    }
                }
            }
        };
        Disk.prototype.initBlock = function (key) {
            // Build disk data
            var availability = '0'; // If the block is free to be used
            var pointer = ['-1', '-1', '-1']; // The next associated block address -- -1 values when not set
            var data = Array(this.dataSize).fill("00"); // Hex values of files or programs
            // Combine values
            data = pointer.concat(data);
            data.unshift(availability);
            // Save to session storage
            sessionStorage.setItem(key, JSON.stringify(data));
        };
        Disk.prototype.getDataSize = function () {
            return this.dataSize;
        };
        return Disk;
    }());
    TSOS.Disk = Disk;
})(TSOS || (TSOS = {}));
