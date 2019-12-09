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

            let result;

            if (action == 'format') {
                result = this.format(flags);
                _StdOut.printInfo(result.msg);

            } else {

                if (this.formatted) {
                    switch (action) {

                        case 'create': {
                            result = this.create(target, false);
                            _StdOut.printInfo(result.msg);

                            break;
                        }

                        case 'read': {
                            result = this.readFile(target, target[0] == '@');
                            _StdOut.printInfo( typeof result.msg == 'string' ? result.msg : result.msg.join('') );

                            break;
                        }

                        case 'write': {
                            result = this.writeFile(target, data, false);
                            _StdOut.printInfo(result.msg);

                            break;
                        }

                        case 'delete': {
                            result = this.deleteFile(target, false);
                            _StdOut.printInfo(result.msg);

                            break;
                        }

                        case 'list': {
                            result = this.list(flags);
                            _StdOut.printInfo(result.msg);

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

        public create(fileName, isSwap) {
            // Check if file name is too long
            if ( fileName.length > _Disk.getDataSize() ) return {status: 1, msg: `File name '${fileName}' is too big`};

            // Check if file already exists
            if ( this.searchFiles(new RegExp(`^${fileName}$`), this.directoryDataInfo)[0] ) {
                return {status: 1, msg: `File with name '${fileName}' already exists`};
            }


            // Find a free directory space
            let key = this.findFreeSpace(1, this.directoryDataInfo)[0];

            // No space is available
            if (!key) return {status: 1, msg: `Insufficient space to create file '${fileName}'`};


            // Get free data space
            let block = this.read(key);

            // Modify block
            block.availability = 1;
            block.data = fileName;

            // Create the directory in session storage
            this.write(key, block);


            return {status: 0, msg: `File '${fileName}' created successfully`};
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

            // Translate data if necessary
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

        public readFile(target, isSwap) {
            // Find file with given name
            let result = this.searchFiles(new RegExp(`^${target}$`), this.directoryDataInfo);
            if (result.length == 0) return {status: 1, msg: `File '${target}' does not exist`};


            let dirKey = result[0];
            let dirBlock = this.read(dirKey);


            // Get file blocks associated with directory block and concat their data
            let output = isSwap ? [] : '';
            let currentBlock;
            let currentPointer = this.keyObjectToString(dirBlock.pointer);
            while (currentPointer != "F:F:F") {
                currentBlock = this.read(currentPointer);

                // Program hex should not be translated
                if(!isSwap) {
                    output += this.translateFromHex(currentBlock.data);
                } else {
                    output = output.concat(currentBlock.data);
                }

                currentPointer = this.keyObjectToString(currentBlock.pointer);
            }

            // Get rid of extra 00's if program
            if (isSwap && typeof output == 'object') {
                while ( output[output.length-1] == '00' && (output[output.length-2] && output[output.length-2] == '00') ) {
                    output.pop();
                }
            }

            return {status: 0, msg: output};
        }

        public writeFile(target, data, isSwap) {
            // If swap file, don't break up like regular characters; it's already broken up 
            if (!isSwap) data = data.split("");

            // Break up data into an array of arrays each at most 60 characters in length
            let dataPieces = data.map( () => data.splice(0, _Disk.dataSize).filter(data => data) );

            // Get directory block
            let result = this.searchFiles(new RegExp(`^${target}$`), this.directoryDataInfo);
            if (result.length == 0) return {status: 1, msg: `File '${target}' does not exist`};

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
            if (freeBlocks.length != Object.keys(dataPieces).length) return {status: 1, msg: `Insufficient space`};

            // Set pointer of directory block to key of first file block
            dirBlock.pointer = this.keyStringToObject(keys[0]);

            // Update directory block on hard drive
            this.write(dirKey, dirBlock);

            // Fill file blocks with data and set pointer + availability, then save to hard drive
            for (let i = 0; i < freeBlocks.length; i++) {
                freeBlocks[i].data = isSwap ? dataPieces[i] : dataPieces[i].join(""); // Don't join if swap file to avoid hex translation

                freeBlocks[i].availability = 1;
                if (i+1 != freeBlocks.length) freeBlocks[i].pointer = this.keyStringToObject(keys[i+1]);

                this.write(keys[i], freeBlocks[i]);
            }

            return {status: 0, msg: `Data successfully written to file '${target}'`};
        }

        public delete(key) {
            _Disk.initBlock(key);
        }

        public deleteFile(target, isSwap) {
            // Delete directory block
            let result = this.searchFiles(new RegExp(`^${target}$`), this.directoryDataInfo);
            if (result.length == 0) return {status: 1, msg: `File '${target}' does not exist`};

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

           return {status: 0, msg: `File '${target}' successfully deleted`};
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

           return {status: 0, msg: files.join(' ')};
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

                return {status: 0, msg: "Hard drive quickly formatted"};

            } else if ( flags.includes('full') || flags.length == 0 ) { // No flags, assume full format
                _Disk.init();

                return {status: 0, msg: "Hard drive fully formatted"};

            } else {
                return {status: 1, msg: "Supplied flag(s) not valid"};
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