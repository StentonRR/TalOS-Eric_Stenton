var TSOS;
(function (TSOS) {
    var MemoryManager = /** @class */ (function () {
        function MemoryManager(availability, // Whether the memory segment is being used or not
        memoryRegisters) {
            if (availability === void 0) { availability = [true, true, true]; }
            if (memoryRegisters === void 0) { memoryRegisters = [{ index: 0, baseRegister: 0, limitRegister: 256 },
                { index: 1, baseRegister: 256, limitRegister: 512 },
                { index: 2, baseRegister: 512, limitRegister: 768 }]; }
            this.availability = availability;
            this.memoryRegisters = memoryRegisters;
        }
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
                _StdOut.putText("Memory Allocation Exception: There are no free memory segments available");
                return;
            }
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
            pcb.priority = parseInt(priority);
            pcb.state = "resident";
            // Add pcb to global list
            _pcbList.push(pcb);
            return pcb;
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
