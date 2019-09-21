module TSOS {
    export class MemoryAccessor {
        constructor() {
        }

        // Read from memory segment and return specific portion of it
        public read(segment, location): String {
            return _Memory.mainMemory[segment][location];
        }

        public write(segment, location, value): Boolean {
            if (_Memory.mainMemory[segment][location] === undefined){
                _StdOut.putText(`Memory Write Exception: Location ${location} of segment ${segment} is out of bounds`);
                return false;
            } else {
                _Memory.mainMemory[segment][location] = value;
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
    }
}
