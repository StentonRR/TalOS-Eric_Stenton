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
                _Kernel.krnTrapError("Memory read exception: Cannot read memory address. Address is out of bounds");
                _Dispatcher.terminateCurrentProcess();
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
                _Kernel.krnTrapError("Memory write exception: Cannot write to memory address. Address is out of bounds.");
                _Dispatcher.terminateCurrentProcess();
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
        MemoryAccessor.prototype.getMemorySize = function () {
            return _Memory.totalSize;
        };
        MemoryAccessor.prototype.dump = function () {
            return _Memory.mainMemory;
        };
        return MemoryAccessor;
    }());
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
