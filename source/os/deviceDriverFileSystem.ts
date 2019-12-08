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
                this.format(flags);

            } else {

                if (this.formatted) {
                    switch (action) {

                        case 'create': {
                            // Check if file name begins with forbidden character
                            if ( this.forbiddenPrefixes.includes(target[0]) ) {
                                return _StdOut.printInfo(`File name cannot begin with '${target[0]}'`);
                            }

                            this.create(target);

                            _StdOut.printInfo("File successfully created");

                            break;
                        }

                        case 'read': {
                            // Find file with given name
                            let result = this.searchFiles(new RegExp(`^${target}$`), this.directoryDataInfo);
                            if (result.length == 0) return _StdOut.printInfo("File does not exist");

                            let dirKey = result[0];
                            let dirBlock = this.read(dirKey);


                            // Get file blocks associated with directory block and concat their data
                            let output = '';
                            let currentBlock;
                            let currentPointer = this.keyObjectToString(dirBlock.pointer);
                            while (currentPointer != "F:F:F") {
                                currentBlock = this.read(currentPointer);

                                output += this.translateFromHex(currentBlock.data);
                                currentPointer = this.keyObjectToString(currentBlock.pointer);
                            }

                            _StdOut.printInfo(output);

                            break;
                        }

                        case 'write': {

                            // Break up data into an array of arrays each at most 60 characters in length
                            data = data.split("");
                            let dataPieces = data.map( () => data.splice(0, _Disk.dataSize).filter(data => data) );

                            // Get directory block
                            let result = this.searchFiles(new RegExp(`^${target}$`), this.directoryDataInfo);
                            if (result.length == 0) return _StdOut.printInfo("File does not exist");

                            let dirKey = result[0];
                            let dirBlock = this.read(dirKey);

                            // If file already written to, reclaim space then allocate new blocks
                            let currentBlock;
                            let currentPointer = this.keyObjectToString(dirBlock.pointer);
                            while (currentPointer != "F:F:F") {
                                currentBlock = this.read(currentPointer);

                                this.delete(currentPointer);

                                currentPointer = this.keyObjectToString(currentBlock.pointer);
                            }

                            // Get blocks of free memory to store data
                            let keys = this.findFreeSpace(Object.keys(dataPieces).length, this.fileDataInfo);
                            let freeBlocks = keys.map( key => this.read(key) );
                            if (freeBlocks.length != Object.keys(dataPieces).length) return _StdOut.printInfo("Insufficient space");

                            // Set pointer of directory block to key of first file block
                            dirBlock.pointer = this.keyStringToObject(keys[0]);

                            // Update directory block on hard drive
                            this.write(dirKey, dirBlock);

                            // Fill file blocks with data and set pointer + availability, then save to hard drive
                            for (let i = 0; i < freeBlocks.length; i++) {
                                freeBlocks[i].data = dataPieces[i].join("");

                                freeBlocks[i].availability = 1;
                                if (i+1 != freeBlocks.length) freeBlocks[i].pointer = this.keyStringToObject(keys[i+1]);

                                this.write(keys[i], freeBlocks[i]);
                            }

                            _StdOut.printInfo("Data successfully written to file");

                            break;
                        }

                        case 'delete': {
                            // Delete directory block
                            let result = this.searchFiles(new RegExp(`^${target}$`), this.directoryDataInfo);
                            if (result.length == 0) return _StdOut.printInfo("File does not exist");

                            let dirKey = result[0];
                            let dirBlock = this.read(dirKey);

                            this.delete(dirKey);


                            // Delete associated file blocks
                            let currentBlock;
                            let currentPointer = this.keyObjectToString(dirBlock.pointer);
                            while (currentPointer != "F:F:F") {
                                currentBlock = this.read(currentPointer);

                                this.delete(currentPointer);

                                currentPointer = this.keyObjectToString(currentBlock.pointer);
                            }

                            _StdOut.printInfo("File successfully deleted");

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
                    _StdOut.printInfo("The disk must be formatted first!");
                }
            }



        }

        public create(fileName) {

            // Check if file name is too long
            if ( fileName.length > _Disk.getDataSize() ) {
                return _StdOut.printInfo("File name is too big");
            }

            // Check if file already exists
            if ( this.searchFiles(new RegExp(`^${fileName}$`), this.directoryDataInfo)[0] ) {
                return _StdOut.printInfo("File with given name already exists");
            }


            // Find a free directory space
            let key = this.findFreeSpace(1, this.directoryDataInfo)[0];

            // No space is available
            if (!key) {
                return _StdOut.printInfo("Insufficient space to create file");
            }

            // Get free data space
            let block = this.read(key);

            // Modify block
            block.availability = 1;
            block.data = fileName;

            // Create the directory in session storage
            this.write(key, block);

        }

        public read(key) {
            // If key object given, translate to string key
            if (typeof key == 'object') key = this.keyObjectToString(key);

            // Get data block and translate it to an object
            let block = sessionStorage.getItem(key);
            let blockObj: {'availability': any, 'pointer': any, 'data': any} = {'availability': parseInt(block[0]),
                            'pointer': this.keyStringToObject( block.substring(1, 4) ),
                            'data': block.substring(_Disk.getHeadSize()).match(/.{1,2}/g)};

            return blockObj;
        }

        public write(key, block) {
            // If key object given, translate to string key
            if (typeof key == 'object') key = this.keyObjectToString(key);

            // Translate data if necesary
            if (typeof block.data == 'string') block.data = this.translateToHex(block.data);

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

        public delete(key) {
            _Disk.initBlock(key);
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

            _StdOut.printInfo( files.join(' ') );

        }

        public format(flags) {

            // Check flags
            if ( flags.includes('quick') ) {
                let key = this.keyStringToObject(this.directoryDataInfo.start);
                let keyLimit = this.keyStringToObject(this.fileDataInfo.end);

                // Initialize first 4 bytes of all blocks -- label loops to break from them easier
                trackLoop:
                    for (let t:any = key.t; t <= keyLimit.t; t++) {
                        sectorLoop:
                            for (let s:any = key.s; s <= keyLimit.s; s++) {
                                blockLoop: // Ternary to skip master book record
                                    for (let b:any = (t == 0 && s == 0) ? key.b : 0; b <= keyLimit.b; b++) {
                                        let block = this.read({t, s, b});

                                        // Skip blocks already initialized
                                        if (block.availability) {
                                            block.availability = 0;
                                            block.pointer = {'t': 'F', 's': 'F', 'b': 'F'}
                                            this.write({t, s, b}, block);
                                        }
                                    }
                            }
                    }

                _StdOut.printInfo("Hard drive quickly formatted");

            } else if ( flags.includes('full') || flags.length == 0 ) { // No flags, assume full format
                _Disk.init();

                _StdOut.printInfo("Hard drive fully formatted");

            } else {
                return _StdOut.printInfo("Supplied flag(s) not valid");
            }
        }

        public findFreeSpace(amount, dataInfo) {
            let key = this.keyStringToObject(dataInfo.start);
            let keyLimit = this.keyStringToObject(dataInfo.end);
            let freeKeys = [];

            // Loop until free space found -- label loops to break from them easier
            trackLoop:
                for (let t:any = key.t; t <= keyLimit.t; t++) {
                        sectorLoop:
                        for (let s:any = key.s; s <= keyLimit.s; s++) {
                            blockLoop: // Ternary to skip master book record
                                for (let b:any = (t == 0 && s == 0) ? key.b : 0; b <= keyLimit.b; b++) {
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
            } else if ( key.includes(':') ) {
                // Make key into an object of integers to loop through easier
                key = key.split(':');
                return {'t': parseInt(key[0]), 's': parseInt(key[1]), 'b': parseInt(key[2])};
            } else { // Pointer key
                // Make key into an object of integers to loop through easier
                key = key.split('');
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

        public searchFiles(re, dataInfo) {
            let key = this.keyStringToObject(dataInfo.start);
            let keyLimit = this.keyStringToObject(dataInfo.end);
            let outputKeys = [];

            // Loop and find files that match search criteria -- label loops to break from them easier
            trackLoop:
                for (let t:any = key.t; t <= keyLimit.t; t++) {
                    sectorLoop:
                        for (let s:any = key.s; s <= keyLimit.s; s++) {
                            blockLoop: // Ternary to skip master book record
                                for (let b:any = (t == 0 && s == 0) ? key.b : 0; b <= keyLimit.b; b++) {
                                    let block = this.read({t, s, b});
                                    if (!block.availability) continue; // Only look at blocks in use

                                    block.data = this.translateFromHex(block.data);

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