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
            }

            // Create process control block for program
            let pcb = new PCB();

            // Memory is full ... use hard drive
            if (memorySegment === undefined) {
                let result;

                // Create swap file and store in hard disk
                pcb.swapFile = `@${pcb.pid}`;
                result = _krnFileSystemDriver.create(pcb.swapFile, true);
                if (result.status) return _StdOut.putText(result.msg);

                result = _krnFileSystemDriver.writeFile(pcb.swapFile, program, true);
                if (result.status) return _StdOut.putText(result.msg);

                pcb.storageLocation = 'hdd';

            } else {
                // Clear memory in case of remaining process code
                _MemoryAccessor.clear(this.memoryRegisters[memorySegment]);

                // Load program into free memory segment
                let status;
                for (let i = 0; i < program.length; i++) {
                    status = _MemoryAccessor.write(this.memoryRegisters[memorySegment], i, program[i]);

                    // Process terminated if it exceeds memory bounds
                    if (!status) {
                        return;
                    }
                }

                // Update memory segment's availability
                this.availability[memorySegment] = false;

                // Update pcb's memory segment information
                pcb.memorySegment = this.memoryRegisters[memorySegment];
            }

            // Finalize pcb information
            pcb.priority = parseInt(priority) || 0;
            pcb.state = "resident";

            // Add pcb to global list
            _ResidentList.push(pcb);

            return pcb;
        }

        public rollIn(pcb) {
            let memorySegment;

            // Find available memory segment
            for (let i = 0; i < this.availability.length; i++) {
                if (this.availability[i]){
                    memorySegment = i;
                    break;
                }
            }

            // Get program from hard drive
            let program = _krnFileSystemDriver.readFile(pcb.swapFile, true).msg;

            // Clear memory of remaining process code
            _MemoryAccessor.clear(this.memoryRegisters[memorySegment]);

            // Load program into free memory segment
            let status;
            for (let i = 0; i < program.length; i++) {
                status = _MemoryAccessor.write(this.memoryRegisters[memorySegment], i, program[i]);

                // Process terminated if it exceeds memory bounds
                if (!status) {
                    return;
                }
            }

            // Update memory segment's availability
            this.availability[memorySegment] = false;

            // Update pcb's memory segment information
            pcb.memorySegment = this.memoryRegisters[memorySegment];

            // Delete swap file
            _krnFileSystemDriver.deleteFile(pcb.swapFile, true);
            pcb.swapFile = '';

            // Update storage location
            pcb.storageLocation = 'memory';

            return;
        }

        public rollOut(pcb) {
            // Get program
            let program = [];
            for (let i = 0; i < _MemoryAccessor.getSegmentSize(); i++) {
                program.push( _MemoryAccessor.read(pcb.memorySegment, i) );
            }

            // Memory segment now available to be used
            this.availability[pcb.memorySegment.index] = true;

            // Change PCB information to reflect location change
            pcb.storageLocation = 'hdd';
            pcb.memorySegment = {};
            pcb.swapFile = `@${pcb.pid}`;

            // Create swap file and write program to it
            _krnFileSystemDriver.create(pcb.swapFile, true);
            _krnFileSystemDriver.writeFile(pcb.swapFile, program, true);

            return;
        }

        public clearAllMem(ignoreList): void {
            for (let segment of this.memoryRegisters) {
                if ( !ignoreList.includes(segment.index) ) _MemoryAccessor.clear(segment);
            }
        }
    }
}