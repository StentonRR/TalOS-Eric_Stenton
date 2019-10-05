module TSOS {
    export class Memory {
        constructor(
            public totalSize: number = 768, // Total size of memory
            public segmentSize: number = 256, // Size of each memory segment

            // Segments of memory
            public mainMemory: string[] = [] ) {
        }

        public init(): void {
            // Fill each main memory with 00's -- symbolizes empty byte of memory
            for(let i = 0; i < this.totalSize; i++){
                this.mainMemory[i] = "00";
            }
        }
    }
}
