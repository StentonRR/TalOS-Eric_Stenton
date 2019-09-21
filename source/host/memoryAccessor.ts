module TSOS {
    export class MemoryAccessor {
        constructor() {
        }

        // Read from memory segment and return specific portion of it
        public read(segment, location): String {
            return _Memory.mainMemory[segment][location];
        }

        public write(segment, location, value): void {
            _Memory.mainMemory[segment][location] = value;
            // todo Add memory security to terminate process if it goes out of bounds
        }

        public clear(segment): void {
            for(let i = 0; i < _Memory.segmentSize; i++) {
                this.write(segment, i, 0x00);
            }
        }
    }
}
