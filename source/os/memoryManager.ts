module TSOS {
    export class MemoryManager {
        constructor(
            public availability: Boolean[] = [], // Whether the memory segment is being used or not
            public memoryRegisters: any[] = []) { // Memory segment info to be placed into process control blocks
        }

        public init(): void {
            // Create memory information
            let memorySegmentSize = _MemoryAccessor.getSegmentSize();
            let memorySize = _MemoryAccessor.getMemorySize();
            let numberOfSegments = memorySize / memorySegmentSize;

            for (let i = 0; i < numberOfSegments; i++) {
                this.availability[i] = true;
                this.memoryRegisters[i] = {index: i,
                                           baseRegister: memorySegmentSize*i,
                                           limitRegister: memorySegmentSize*(i+1)}
            }
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
            _MemoryAccessor.clear(this.memoryRegisters[memorySegment]);

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
            _ResidentList.push(pcb);

            return pcb;
        }

        public clearAllMem(): void {
            for (let segment of this.memoryRegisters) {
                _MemoryAccessor.clear(segment.index);
            }
        }
    }
}