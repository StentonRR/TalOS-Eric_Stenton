var TSOS;
(function (TSOS) {
    var MemoryManager = /** @class */ (function () {
        function MemoryManager(availability, // Whether the memory segment is being used or not
        memoryRegisters) {
            if (availability === void 0) { availability = []; }
            if (memoryRegisters === void 0) { memoryRegisters = []; }
            this.availability = availability;
            this.memoryRegisters = memoryRegisters;
        }
        MemoryManager.prototype.init = function () {
            // Create memory information
            var memorySegmentSize = _MemoryAccessor.getSegmentSize();
            var memorySize = _MemoryAccessor.getMemorySize();
            var numberOfSegments = memorySize / memorySegmentSize;
            for (var i = 0; i < numberOfSegments; i++) {
                this.availability[i] = true;
                this.memoryRegisters[i] = { index: i,
                    baseRegister: memorySegmentSize * i,
                    limitRegister: memorySegmentSize * (i + 1) };
            }
        };
        MemoryManager.prototype.load = function (program, priority) {
            var memorySegment;
            // Find next available memory segment
            for (var i = 0; i < this.availability.length; i++) {
                if (this.availability[i]) {
                    memorySegment = i;
                    break;
                }
                // todo Swapping stuff
            }
            // Memory is full
            if (memorySegment === undefined) {
                _Kernel.krnTrapError("There are no free memory segments available");
                return;
            }
            // Clear memory in case of remaining process code
            _MemoryAccessor.clear(this.memoryRegisters[memorySegment]);
            // Load program into free memory segment
            var status;
            for (var i = 0; i < program.length; i++) {
                status = _MemoryAccessor.write(this.memoryRegisters[memorySegment], i, program[i]);
                // Process terminated if it exceeds memory bounds
                if (!status) {
                    return;
                }
            }
            // Update memory segment's availability
            this.availability[memorySegment] = false;
            // Create process control block for program
            var pcb = new TSOS.PCB();
            pcb.memorySegment = this.memoryRegisters[memorySegment];
            pcb.priority = parseInt(priority) || 0;
            pcb.state = "resident";
            // Add pcb to global list
            _ResidentList.push(pcb);
            return pcb;
        };
        MemoryManager.prototype.clearAllMem = function (ignoreList) {
            for (var _i = 0, _a = this.memoryRegisters; _i < _a.length; _i++) {
                var segment = _a[_i];
                if (!ignoreList.includes(segment.index))
                    _MemoryAccessor.clear(segment);
            }
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
