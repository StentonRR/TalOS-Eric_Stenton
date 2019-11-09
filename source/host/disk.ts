module TSOS {
    export class Disk {
        constructor(
            public trackNumber: number = 4,
            public sectorNumber: number = 8,
            public blockNumber: number = 8,

            public dataSize: number = 60 ) {
        }

        public init(): void {

            // Initialize disk space
            for (let t = 0; t < this.trackNumber; t++) {
                for (let s = 0; s < this.sectorNumber; s++) {
                    for (let b = 0; b < this.blockNumber; b++) {

                        let availability = 0; // If the block is free to be used
                        let pointer = '-1:-1:-1'; // The next associated block address -- -1 values when not set
                        let data = Array(this.dataSize).fill("00"); // Hex values of files or programs

                        sessionStorage.setItem(`${t}:${s}:${b}`, JSON.stringify({availability,
                                                                                 pointer,
                                                                                 data }));
                    }
                }
            }
        }

        public getDataSize(): number {
            return this.dataSize;
        }



    }
}
