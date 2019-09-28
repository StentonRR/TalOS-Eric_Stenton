module TSOS {
    export class MemoryAccessor {
        constructor() {
        }

        // Read from memory segment and return specific portion of it
        public read(segment, logicalAddress): string | undefined {
            // Change logical address to physical address
            let physicalAddress = logicalAddress + segment.baseRegister;

            // Memory protection
            if (physicalAddress > segment.limitRegister || logicalAddress < 0) {
                _StdOut.putText(`Memory Read Exception: Address is out of bounds`);
                return;
            }else{
                return _Memory.mainMemory[physicalAddress];
            }
        }

        public write(segment, logicalAddress, value): Boolean {
            // Change logical address to physical address
            let physicalAddress = logicalAddress + segment.baseRegister;

            // Memory protection
            if (physicalAddress > segment.limitRegister || logicalAddress < 0){
                _StdOut.putText(`Memory Write Exception: Address is out of bounds`);
                return false;
            } else {
                _Memory.mainMemory[physicalAddress] = value;
                return true;
            }
        }

        public clear(segment): void {
            for(let i = segment.baseRegister; i < segment.limitRegister; i++) {
                this.write(segment, i, "00");
            }
        }

        public getSegmentSize(): number {
            return _Memory.segmentSize;
        }
    }
}
