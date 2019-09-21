var TSOS;
(function (TSOS) {
    var MemoryAccessor = /** @class */ (function () {
        function MemoryAccessor() {
        }
        // Read from memory segment and return specific portion of it
        MemoryAccessor.prototype.read = function (segment, location) {
            if (!_Memory.mainMemory[segment][location]) {
                throw "Memory Read Exception: Location " + location + " of segment " + segment + " is out of bounds";
            }
            else {
                return _Memory.mainMemory[segment][location];
            }
        };
        MemoryAccessor.prototype.write = function (segment, location, value) {
            if (!_Memory.mainMemory[segment][location]) {
                throw "Memory Write Exception: Location " + location + " of segment " + segment + " is out of bounds";
            }
            else {
                _Memory.mainMemory[segment][location] = value;
            }
        };
        MemoryAccessor.prototype.clear = function (segment) {
            for (var i = 0; i < _Memory.segmentSize; i++) {
                this.write(segment, i, 0x00);
            }
        };
        MemoryAccessor.prototype.getSegmentSize = function () {
            return _Memory.segmentSize;
        };
        return MemoryAccessor;
    }());
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
