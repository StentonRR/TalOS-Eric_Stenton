var TSOS;
(function (TSOS) {
    var MemoryAccessor = /** @class */ (function () {
        function MemoryAccessor() {
        }
        // Read from memory segment and return specific portion of it
        MemoryAccessor.prototype.read = function (segment, location) {
            return _Memory.mainMemory[segment][location];
        };
        MemoryAccessor.prototype.write = function (segment, location, value) {
            _Memory.mainMemory[segment][location] = value;
            // todo Add memory security to terminate process if it goes out of bounds
        };
        MemoryAccessor.prototype.clear = function (segment) {
            for (var i = 0; i < _Memory.segmentSize; i++) {
                this.write(segment, i, 0x00);
            }
        };
        return MemoryAccessor;
    }());
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
