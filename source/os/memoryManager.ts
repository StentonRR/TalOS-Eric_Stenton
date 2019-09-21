module TSOS {
    export class MemoryManager {
        constructor(
            public availability = [true, true, true] ) { // Whether the memory segment is being used or not
        }

        public load(program, priority): PCB {
            let memorySegment;

            // Find next available memory segment
            for (let i = 0; i < this.availability.length; i++) {
                if (this.availability[i]){
                    memorySegment = i;
                    break;
                }
                // todo Swapping stuff
            }

            // Load program into free memory segment
            for (let i = 0; i < program.length; i++) {
                _MemoryAccessor.write(memorySegment, i, program[i]);
            }

            // Update memory segment's availability
            this.availability[memorySegment] = false;

            console.log(_Memory.mainMemory);
            // Create process control block for program
            let pcb = new PCB();
            pcb.memorySegment = memorySegment;
            pcb.priority = priority;

            // Add pcb to global list
            _pcbList.push(pcb);

            return pcb;
        }






    }
}