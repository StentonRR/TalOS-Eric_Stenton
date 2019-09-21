module TSOS {
    export class Memory {
        constructor(
            public totalSize: number = 768, // Total size of memory
            public segmentSize: number = 256, // Size of each memory segment

            // Segments of memory
            public mainMemory: any[] = [[], [], []] ) {
        }

        public init(): void {
            // Fill each memory segment with 0's -- symbolizes empty byte of memory
            for (let segment of this.mainMemory){
                for(let i = 0; i < this.segmentSize; i++){
                    segment[i] = "00";
                }
            }
        }
    }
}
