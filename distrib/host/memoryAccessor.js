var TSOS;
(function (TSOS) {
    var MemoryAccessor = /** @class */ (function () {
        function MemoryAccessor() {
        }
        // Read from memory segment and return specific portion of it
        MemoryAccessor.prototype.read = function (segment, logicalAddress) {
            // Change logical address to physical address
            var physicalAddress = logicalAddress + segment.baseRegister;
            // Memory protection
            if (physicalAddress > segment.limitRegister || logicalAddress < 0) {
                _StdOut.putText("Memory Read Exception: Address is out of bounds");
                return;
            }
            else {
                return _Memory.mainMemory[physicalAddress];
            }
        };
        MemoryAccessor.prototype.write = function (segment, logicalAddress, value) {
            // Change logical address to physical address
            var physicalAddress = logicalAddress + segment.baseRegister;
            // Memory protection
            if (physicalAddress > segment.limitRegister || logicalAddress < 0) {
                _StdOut.putText("Memory Write Exception: Address is out of bounds");
                return false;
            }
            else {
                _Memory.mainMemory[physicalAddress] = value;
                return true;
            }
        };
        MemoryAccessor.prototype.clear = function (segment) {
            for (var i = segment.baseRegister; i < segment.limitRegister; i++) {
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
