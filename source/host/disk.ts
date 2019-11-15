module TSOS {
    export class Disk {
        constructor(
            public trackNumber: number = 4,
            public sectorNumber: number = 8,
            public blockNumber: number = 8,

            public headSize: number = 4,
            public dataSize: number = 60 ) {
        }

        public init(): void {

            // Initialize disk space
            for (let t = 0; t < this.trackNumber; t++) {
                for (let s = 0; s < this.sectorNumber; s++) {
                    for (let b = 0; b < this.blockNumber; b++) {

                       this.initBlock(`${t}:${s}:${b}`);
                    }
                }
            }
        }

        public initBlock(key) {
            // Build disk data
            let availability = '0'; // If the block is free to be used
            let pointer = ['-1', '-1', '-1']; // The next associated block address -- -1 values when not set

            let data = Array(this.dataSize).fill("00"); // Hex values of files or programs

            // Combine values
            data = pointer.concat(data);
            data.unshift(availability);

            // Save to session storage
            sessionStorage.setItem( key, JSON.stringify(data) );
        }

        public getDataSize(): number {
            return this.dataSize;
        }



    }
}
