///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />

/* ----------------------------------
   DeviceDriverFileSystem.ts

   Requires deviceDriver.ts

   The Kernel File System Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverFileSystem extends DeviceDriver {

        constructor(
            public formatted = true,
            public forbiddenPrefixes = ['@'], // File names cannot start with these
            public specialPrefixes = ['@', '.'], // Files with names that start with these need the -a flag to list
            public masterBootRecord = '0:0:0', // The key for the master boot record
            public directoryDataInfo = {'type': 'directory', 'start': '0:0:1', 'end': '0:7:7'}, // Information directory portion of disk
            public fileDataInfo = {'type': 'file', 'start': '1:0:0', 'end': '3:7:7'} // Information file directory portion of disk
        ) {
            // Override the base method pointers.

            // The code below cannot run because "this" can only be
            // accessed after calling super.
            //super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            super();
            this.driverEntry = this.krnFsDriverEntry;
            this.isr = this.krnFsDispatchOperation;
        }

        public krnFsDriverEntry() {
            // Initialization routine for this, the kernel-mode File System Device Driver.
            this.status = "loaded";
            // More?
        }

        public krnFsDispatchOperation(params) {
            let action = params[0]; // Operation to be completed
            let target = params[1]; // Target of operation -- file or directory name
            let data = params[2]; // Any data associated with operation
            let flags = params[3]; // Flags that modify action


            if (action == 'format') {
                _Disk.init();

            } else {

                if (this.formatted) {
                    switch (action) {

                        case 'create': {
                            this.create(target);
                            break;
                        }

                        case 'read': {
                            this.read(target);
                            break;
                        }

                        case 'write': {

                            // Break up data
                            let dataPieces = data.map( () => data.splice(0, _Disk.dataSize).filter(data => data) );


                            this.write(target, data, this.fileDataInfo);
                            break;
                        }

                        case 'list': {
                            this.list(flags);
                            break;
                        }

                        default: {

                            break;
                        }

                    }

                } else {
                    _StdOut.putText("The disk must be formatted first!");
                }
            }



        }

        public create(fileName) {
            // Find a free directory space
            let key = this.findFreeSpace(1, this.directoryDataInfo)[0];

            // Get free data space
            let block = this.read(key);

            // Modify block
            block.availability = 1;
            block.data = fileName;

            // Create the directory in session storage
            this.write(key, block, this.directoryDataInfo);
        }

        public read(key) {
            let block = sessionStorage.getItem(key);
            let blockObj = {'availability': parseInt(block[0]),
                            'pointer': this.keyStringToObject( block.substring(1, 4) ),
                            'data': block.substring(4).match(/.{1,2}/g)};

            return blockObj;
        }

        public write(key, block, dataInfo) {
            console.log(block);
            // Combine data object values into single string
            let data = block.pointer.values.concat(block.data);
            data.unshift( block.availability.toString() );

            // Save to session storage
            sessionStorage.setItem( key, JSON.stringify(data) );
        }

        public list(flags) {
            let commandFlags = ['l'];
        }

        public format() {
            let commandFlags = ['quick', 'full'];

        }

        public findFreeSpace(amount, dataInfo) {
            let key = this.keyStringToObject(dataInfo.start);
            let keyLimit = this.keyStringToObject(dataInfo.end);
            let freeKeys = [];

            // Loop until free space found -- label loops to break from them easier
            trackLoop:
                for (let t = key.t; t <= keyLimit.t; t++) {
                    sectorLoop:
                        for (let s = key.s; s <= keyLimit.s; s++) {
                            blockLoop: // Ternary to skip master book record
                                for (let b = (t == 0 && s == 0) ? key.b : 0; b <= keyLimit.b; b++) {
                                    let data = this.read( this.keyObjectToString({t, s, b}) );

                                    // Add key to list if it is available
                                    if (!data.availability) {
                                        freeKeys.push( this.keyObjectToString({t, s, b}) );
                                        amount--;
                                    }

                                    // Break loops if all desired keys are found
                                    if (amount == 0) break trackLoop;
                                }
                        }
                }

            return freeKeys;
        }

        public keyStringToObject(key) {
            // Make key into an object of integers to loop through easier
            key = key.split(':');
            return { 't': parseInt(key[0]), 's': parseInt(key[1]), 'b': parseInt(key[2]) };
        }

        public keyObjectToString(key) {
            // Make key back into a string for session storage indexing
            return `${key.t}:${key.s}:${key.b}`;
        }

        public clearBlock(key) {
            _Disk.initBlock(key);
        }


    }
}