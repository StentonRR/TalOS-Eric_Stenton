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

        constructor() {
            // Override the base method pointers.

            // The code below cannot run because "this" can only be
            // accessed after calling super.
            //super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            super();
            this.driverEntry = this.krnKbdDriverEntry;
            //this.isr = this.krnKbdDispatchKeyPress;
        }

        public krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode File System Device Driver.
            this.status = "loaded";
            // More?
        }

        public clearBlock(key) {

            // Get block and parse it to json object
            let block = JSON.parse( sessionStorage.getItem(key) );

            // Clear data and mark availability + pointer to
            block.data = Array(_Disk.dataSize).fill("00");
            block.availability = 0;
            block.pointer = '-1:-1:-1';

            // Set session object to new block object
            sessionStorage.setItem(key, JSON.stringify(block));
        }


    }
}
