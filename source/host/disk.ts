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

            // Fill master boot record
            let block = _krnFileSystemDriver.read('0:0:0');
            block.availability = 1;
            block.data = `In the beginning were words, and words made the world`;
            _krnFileSystemDriver.write('0:0:0', block);
        }

        public initBlock(key) {
            // Build disk data
            let availability = '0'; // If the block is free to be used
            let pointer = ['F', 'F', 'F']; // The next associated block address -- F values when not set

            let data = Array(this.dataSize).fill("00"); // Hex values of files or programs

            // Combine values
            data = pointer.concat(data);
            data.unshift(availability);

            // Save to session storage
            sessionStorage.setItem( key, data.join('') );
        }

        public getDataSize(): number {
            return this.dataSize;
        }

        public getHeadSize(): number {
            return this.headSize;
        }

        public getTrackNumber(): number {
            return this.trackNumber;
        }

        public getSectorNumber(): number {
            return this.sectorNumber;
        }

        public getBlockNumber(): number {
            return this.blockNumber;
        }

    }
}
