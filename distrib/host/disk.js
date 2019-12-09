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
            // Fill master boot record
            var block = _krnFileSystemDriver.read('0:0:0');
            block.availability = 1;
            block.data = "In the beginning were words, and words made the world";
            _krnFileSystemDriver.write('0:0:0', block);
        };
        Disk.prototype.initBlock = function (key) {
            // Build disk data
            var availability = '0'; // If the block is free to be used
            var pointer = ['F', 'F', 'F']; // The next associated block address -- F values when not set
            var data = Array(this.dataSize).fill("00"); // Hex values of files or programs
            // Combine values
            data = pointer.concat(data);
            data.unshift(availability);
            // Save to session storage
            sessionStorage.setItem(key, data.join(''));
        };
        Disk.prototype.getDataSize = function () {
            return this.dataSize;
        };
        Disk.prototype.getHeadSize = function () {
            return this.headSize;
        };
        Disk.prototype.getTrackNumber = function () {
            return this.trackNumber;
        };
        Disk.prototype.getSectorNumber = function () {
            return this.sectorNumber;
        };
        Disk.prototype.getBlockNumber = function () {
            return this.blockNumber;
        };
        return Disk;
    }());
    TSOS.Disk = Disk;
})(TSOS || (TSOS = {}));
