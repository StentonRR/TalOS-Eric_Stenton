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
        }

        public krnFsDispatchOperation(params) {
            let action = params[0]; // Operation to be completed
            let target = params[1]; // Target of operation -- file or directory name
            let data = params[2]; // Any data associated with operation
            let flags = params[3]; // Flags that modify action
            console.table({action, target, data, flags});

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


                            this.write(target, data);
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

            // Check if file name is too long
            if ( fileName.length > _Disk.getDataSize() ) {
                return _Kernel.krnTrapError("File allocation error: File name is too big");
            }

            // Find a free directory space
            let key = this.findFreeSpace(1, this.directoryDataInfo)[0];

            // No space is available
            if (!key) {
                return _Kernel.krnTrapError("File allocation error: Insufficient space to create file");
            }

            // Get free data space
            let block = this.read(key);

            // Modify block
            block.availability = 1;
            block.data = fileName;

            // Create the directory in session storage
            this.write(key, block);

            _StdOut.putText("File successfully created");
            _StdOut.advanceLine();
            _OsShell.putPrompt()
        }

        public read(key) {
            // If key object given, translate to string key
            if (typeof key == 'object') key = this.keyObjectToString(key);

            // Get data block and translate it to an object
            let block = sessionStorage.getItem(key);
            let blockObj = {'availability': parseInt(block[0]),
                            'pointer': this.keyStringToObject( block.substring(1, 4) ),
                            'data': block.substring(_Disk.getHeadSize()).match(/.{1,2}/g)};

            return blockObj;
        }

        public write(key, block) {
            // If key object given, translate to string key
            if (typeof key == 'object') key = this.keyObjectToString(key);

            // Translate data
            block.data = this.translateToHex(block.data);

            // Fill unused bytes in data section with 00's
            if (block.data.length < _Disk.getDataSize()) {
                let originalDataSize = block.data.length;
                for (let i = 0; i < _Disk.getDataSize() - originalDataSize; i++) {
                    block.data.push('00');
                }
            }

            // Combine data object values into single string
            let data = Object.values(block.pointer).concat(block.data);
            data.unshift( block.availability.toString() );

            // Save to session storage
            sessionStorage.setItem( key, data.join('') );
        }

        public list(flags) {
            let keys;

            // Check to see if special files should be included
            if ( flags.includes('l') ) {
                keys = this.searchFiles(new RegExp('.'), this.directoryDataInfo);
            } else {
                keys = this.searchFiles(new RegExp(`^(?!^[${this.specialPrefixes.join('')}])`), this.directoryDataInfo);
            }

            let files = keys.map( key => this.translateFromHex(this.read(key).data) );

            _StdOut.putText( files.join(' ') );
            _StdOut.advanceLine();
            _OsShell.putPrompt()
        }

        public format(flags) {
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
                                    let block = this.read({t, s, b});

                                    // Add key to list if it is available
                                    if (!block.availability) {
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
            // Check if key is initialized or not
            if (key == 'FFF') {
                return { 't': 'F', 's': 'F', 'b': 'F' };
            } else {
                // Make key into an object of integers to loop through easier
                key = key.split(':');
                return {'t': parseInt(key[0]), 's': parseInt(key[1]), 'b': parseInt(key[2])};
            }
        }

        public keyObjectToString(key) {
            // Make key back into a string for session storage indexing
            return `${key.t}:${key.s}:${key.b}`;
        }

        public translateToHex(data) {
            // Break string into list
            data = data.split('');

            // Translate characters to ascii digits then to hex
            for (let i in data) {
                data[i] = data[i].charCodeAt().toString(16);
            }

            return data;
        }

        public translateFromHex(data) {
            let output = '';

            // Translate hex to characters
            for (let i in data) {

                if (data[i] == "00") break; // Break when hits empty bytes

                output += String.fromCharCode(parseInt(data[i], 16));
            }

            return output;
        }

        public searchFiles(re, dataInfo) { console.log(re)
            let key = this.keyStringToObject(dataInfo.start);
            let keyLimit = this.keyStringToObject(dataInfo.end);
            let outputKeys = [];

            // Loop and find files that match search criteria -- label loops to break from them easier
            trackLoop:
                for (let t = key.t; t <= keyLimit.t; t++) {
                    sectorLoop:
                        for (let s = key.s; s <= keyLimit.s; s++) {
                            blockLoop: // Ternary to skip master book record
                                for (let b = (t == 0 && s == 0) ? key.b : 0; b <= keyLimit.b; b++) {
                                    let block = this.read({t, s, b});
                                    if (!block.availability) continue; // Only look at blocks in use

                                    block.data = this.translateFromHex(block.data);
                                    console.log(block);
                                    // Check if matches search criteria
                                    if ( re.test(block.data) ) {
                                        outputKeys.push( this.keyObjectToString({t, s, b}) );
                                    }

                                }
                        }
                }

            return outputKeys;
        }

        public clearBlock(key) {
            _Disk.initBlock(key);
        }


    }
}