var TSOS;
(function (TSOS) {
    var MemoryManager = /** @class */ (function () {
        function MemoryManager(availability) {
            if (availability === void 0) { availability = [true, true, true]; }
            this.availability = availability;
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
                status = _MemoryAccessor.write(memorySegment, i, program[i]);
                // Terminate process if it exceeds memory bounds
                if (!status) {
                    return;
                }
            }
            // Update memory segment's availability
            this.availability[memorySegment] = false;
            // Create process control block for program
            var pcb = new TSOS.PCB();
            pcb.memorySegment = memorySegment;
            pcb.priority = parseInt(priority);
            // Add pcb to global list
            _pcbList.push(pcb);
            return pcb;
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
