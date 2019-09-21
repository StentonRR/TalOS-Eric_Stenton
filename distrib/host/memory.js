var TSOS;
(function (TSOS) {
    var Memory = /** @class */ (function () {
        function Memory(totalSize, // Total size of memory
        segmentSize, // Size of each memory segment
        // Segments of memory
        mainMemory) {
            if (totalSize === void 0) { totalSize = 765; }
            if (segmentSize === void 0) { segmentSize = 255; }
            if (mainMemory === void 0) { mainMemory = [[], [], []]; }
            this.totalSize = totalSize;
            this.segmentSize = segmentSize;
            this.mainMemory = mainMemory;
        }
        Memory.prototype.init = function () {
            // Fill each memory segment with 0's -- symbolizes empty byte of memory
            for (var _i = 0, _a = this.mainMemory; _i < _a.length; _i++) {
                var segment = _a[_i];
                for (var i = 0; i < this.segmentSize; i++) {
                    segment[i] = 0x00;
                }
            }
        };
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
