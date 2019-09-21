module TSOS {
    export class Memory {
        constructor(
            public totalSize = 765, // Total size of memory
            public segmentSize = 255, // Size of each memory segment

            // Segments of memory
            public mainMemory = [[], [], []] ) {
        }

        public init(): void {
            // Fill each memory segment with 0's -- symbolizes empty byte of memory
            for (let segment of this.mainMemory){
                for(let i = 0; i < this.segmentSize; i++){
                    segment[i] = 0x00;
                }
            } console.log(this.mainMemory);
        }
    }
}
