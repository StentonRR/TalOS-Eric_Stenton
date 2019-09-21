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
                else {
                    throw "Memory Allocation Exception: There are no free memory segments available";
                }
                // todo Swapping stuff
            }
            // Load program into free memory segment
            for (var i = 0; i < program.length; i++) {
                _MemoryAccessor.write(memorySegment, i, program[i]);
            }
            // Update memory segment's availability
            this.availability[memorySegment] = false;
            // Create process control block for program
            var pcb = new TSOS.PCB();
            pcb.memorySegment = memorySegment;
            pcb.priority = priority;
            // Add pcb to global list
            _pcbList.push(pcb);
            return pcb;
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
