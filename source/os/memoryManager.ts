module TSOS {
    export class MemoryManager {
        constructor(
            public availability: Boolean[] = [true, true, true], // Whether the memory segment is being used or not
            public memoryRegisters: any[] = [{index: 0, baseRegister: 0, limitRegister: 256},
                                            {index: 1, baseRegister: 256, limitRegister: 512},
                                            {index: 2, baseRegister: 512, limitRegister: 768}]) { // Memory segment info to be placed into process control blocks
        }

        public load(program, priority): PCB | undefined {
            let memorySegment;

            // Find next available memory segment
            for (let i = 0; i < this.availability.length; i++) {
                if (this.availability[i]){
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
            _MemoryAccessor.clear(memorySegment);

            // Load program into free memory segment
            let status;
            for (let i = 0; i < program.length; i++) {
               status =  _MemoryAccessor.write(this.memoryRegisters[memorySegment], i, program[i]);

               // Process terminated if it exceeds memory bounds
               if (!status) {
                    return;
               }
            }

            // Update memory segment's availability
            this.availability[memorySegment] = false;

            // Create process control block for program
            let pcb = new PCB();
            pcb.memorySegment = this.memoryRegisters[memorySegment];
            pcb.priority = parseInt(priority) || 0;
            pcb.state = "resident";

            // Add pcb to global list
            _PcbList.push(pcb);

            return pcb;
        }
    }
}