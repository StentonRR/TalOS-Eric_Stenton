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
            public formatted = false,
            public forbiddenPrefixes = ['@'], // File names cannot start with these
            public specialPrefixes = ['@', '.'], // Files with names that start with these need the -a flag to list
            public masterBootRecord = '0:0:0', // The key for the master boot record
            public directoryBlock = {'start': '0:0:1', 'end': '0:7:7'}, // Information directory portion of disk
            public fileBlock = {'start': '1:0:0', 'end': '3:7:7'} // Information file directory portion of disk
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

        public read(key) {
            let block = sessionStorage.getItem(key);
            let blockObj = {'availability': parseInt(block[0]),
                            'pointer': block.substring(1, 4),
                            'data': block.substring(4)};

            return blockObj;
        }

        public write(key, dataObj) {
            // Combine values
            let data = dataObj.pointer.concat(dataObj.data);
            data.unshift( dataObj.availability.toString() );

            // Save to session storage
            sessionStorage.setItem( key, JSON.stringify(data) );
        }

        public list(flags) {
            let commandFlags = ['l'];
        }

        public format() {
            let commandFlags = ['quick', 'full'];

        }

        public getFreeSpace(amount, block) {
            let key = block.start;

        }

        public clearBlock(key) {
            _Disk.initBlock(key);
        }


    }
}