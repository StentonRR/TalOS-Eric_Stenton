module TSOS {
    export class MemoryAccessor {
        constructor() {
        }

        // Read from memory segment and return specific portion of it
        public read(segment, logicalAddress): string | undefined {
            // Change logical address to physical address
            let physicalAddress = logicalAddress + segment.baseRegister;

            // Memory protection
            if (physicalAddress >= segment.limitRegister || logicalAddress < 0) {
                _Kernel.krnTrapError("Memory read exception: Cannot read memory address. Address is out of bounds");
                _Dispatcher.terminateCurrentProcess();
                return;
            }else{
                return _Memory.mainMemory[physicalAddress];
            }
        }

        public write(segment, logicalAddress, value): Boolean {
            // Change logical address to physical address
            let physicalAddress = logicalAddress + segment.baseRegister;

            // Pad value with extra 0 if only 1 character
            value = Utils.padHex(value);

            // Memory protection
            if (physicalAddress >= segment.limitRegister || logicalAddress < 0) {
                _Kernel.krnTrapError("Memory write exception: Cannot write to memory address. Address is out of bounds.");
                _Dispatcher.terminateCurrentProcess();
                return false;
            } else {
                _Memory.mainMemory[physicalAddress] = value;
                return true;
            }
        }

        public clear(segment): void {
            for(let i = 0; i < _Memory.segmentSize; i++) {
                this.write(segment, i, "00");
            }
        }

        public getSegmentSize(): number {
            return _Memory.segmentSize;
        }

        public getMemorySize(): number {
            return _Memory.totalSize;
        }

        public dump(): any {
            return _Memory.mainMemory;
        }

        public dumpSegment(base, limit): any {
            return _Memory.mainMemory.slice(base, limit);
        }
    }
}
