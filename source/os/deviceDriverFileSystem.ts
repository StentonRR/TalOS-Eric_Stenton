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
            public specialPrefixes = ['@', '.'] // Files with names that start with these need the -a flag to list
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
            let flags = params[1]; // Flags that modify action
            let target = params[2]; // Target of operation -- file or directory name
            let data = params[3]; // Any data associated with operation

            if (action == 'format') {
                _Disk.init();

            } else {

                if (this.formatted) {
                    switch (action) {

                        case 'readDir': {

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

        public readFile(key) {
            let commandFlags = [];
        }

        public writeFile(key, data) {
            let commandFlags = [];

        }

        public readDir(key) {
            let commandFlags = [];

        }

        public writeDir(key, data) {
            let commandFlags = [];

        }

        public format() {
            let commandFlags = ['quick', 'full'];

        }

        public clearBlock(key) {
            _Disk.initBlock(key);
        }


    }
}
