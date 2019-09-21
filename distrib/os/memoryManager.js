var TSOS;
(function (TSOS) {
    var MemoryManager = /** @class */ (function () {
        function MemoryManager(availability, // Whether the memory segment is being used or not
        limits) {
            if (availability === void 0) { availability = [true, true, true]; }
            if (limits === void 0) { limits = [{ start: 0, end: 255 },
                { start: 256, end: 511 },
                { start: 512, end: 767 }]; }
            this.availability = availability;
            this.limits = limits;
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
            // Load program into free memory segment
            for (var i = 0; i < program.length; i++) {
                _MemoryAccessor.write(memorySegment, i, program[i]);
            }
            // Update memory segment's availability
            this.availability[memorySegment] = false;
            console.log(_Memory.mainMemory);
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
