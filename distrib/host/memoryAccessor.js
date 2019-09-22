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
            if (_Memory.mainMemory[segment][location] === undefined) {
                _StdOut.putText("Memory Write Exception: Location " + location + " of segment " + segment + " is out of bounds");
                return false;
            }
            else {
                _Memory.mainMemory[segment][location] = value;
                return true;
            }
        };
        MemoryAccessor.prototype.clear = function (segment) {
            for (var i = 0; i < _Memory.segmentSize; i++) {
                this.write(segment, i, "00");
            }
        };
        MemoryAccessor.prototype.getSegmentSize = function () {
            return _Memory.segmentSize;
        };
        return MemoryAccessor;
    }());
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
