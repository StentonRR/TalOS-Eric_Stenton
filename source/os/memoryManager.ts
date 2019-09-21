module TSOS {
    export class MemoryManager {
        constructor(
            public availability = [true, true, true] ) { // Whether the memory segment is being used or not
        }

        public load(program, priority): PCB | undefined {
            let memorySegment;

            // Find next available memory segment
            for (let i = 0; i < this.availability.length; i++) {
                if (this.availability[i]){
                    memorySegment = i;
                    break;
                } else {
                    _StdOut.putText("Memory Allocation Exception: There are no free memory segments available");
                    return;
                }
                // todo Swapping stuff
            }

            // Load program into free memory segment
            let status;
            for (let i = 0; i < program.length; i++) {
               status =  _MemoryAccessor.write(memorySegment, i, program[i]);

               // Terminate process if it exceeds memory bounds
               if (!status) {
                    return;
               }
            }

            // Update memory segment's availability
            this.availability[memorySegment] = false;

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