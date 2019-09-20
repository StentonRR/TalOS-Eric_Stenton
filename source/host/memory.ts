module TSOS {
    export class Memory {
        constructor(
            public totalSize = 765, // Total size of memory
            public segmentSize = 255, // Size of each memory segment

            // Memory segments
            public segment1 = [],
            public segment2 = [],
            public segment3 = [],

            // Segments in single array for ease of use
            public mainMemory = [segment1, segment2, segment3] ) {
        }

        public init(): void {
            // Fill each memory segment with 0's -- symbolizes empty byte of memory
            for (let segment of this.mainMemory){
                for(let i = 0; i < this.segmentSize; i++){
                    segment[i] = "0";
                }
            }
        }
    }
}
