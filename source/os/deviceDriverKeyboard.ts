///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />

/* ----------------------------------
   DeviceDriverKeyboard.ts

   Requires deviceDriver.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverKeyboard extends DeviceDriver {

        constructor() {
            // Override the base method pointers.

            // The code below cannot run because "this" can only be
            // accessed after calling super.
            //super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            super();
            this.driverEntry = this.krnKbdDriverEntry;
            this.isr = this.krnKbdDispatchKeyPress;
        }

        public krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }

        public krnKbdDispatchKeyPress(params) {
            // Parse the params.    TODO: Check that the params are valid and osTrapError if not.
            let keyCode = params[0];
            let isShifted = params[1];
            let capsLock = params[2];

            _Kernel.krnTrace("Key code:" + keyCode + " Shifted:" + isShifted + " Caps Lock: " + capsLock);
            let chr = "";
            // Check to see if we even want to deal with the key that was pressed.
            if ((keyCode >= 65) && (keyCode <= 90)) { // letter
                if ((isShifted === true && capsLock === false) || (isShifted === false && capsLock === true)) {
                    chr = String.fromCharCode(keyCode); // Uppercase A-Z
                } else {
                    chr = String.fromCharCode(keyCode + 32); // Lowercase a-z
                }

                _KernelInputQueue.enqueue(chr);
            } else if (((keyCode >= 48) && (keyCode <= 57)) ||   // digits
                        (keyCode == 32)                     ||   // space
                        (keyCode == 8)                      ||   // backspace
                        (keyCode == 13)) {                       // enter

                chr = String.fromCharCode(keyCode);

                // Account for shifted number keys
                if (isShifted) {
                    switch (keyCode) {
                        case 48: {
                            chr = ')';
                            break;
                        }
                        case 49: {
                            chr = '!';
                            break;
                        }
                        case 50: {
                            chr = '@';
                            break;
                        }
                        case 51: {
                            chr = '#';
                            break;
                        }
                        case 52: {
                            chr = '$';
                            break;
                        }
                        case 53: {
                            chr = '%';
                            break;
                        }
                        case 54: {
                            chr = '^';
                            break;
                        }
                        case 55: {
                            chr = '&';
                            break;
                        }
                        case 56: {
                            chr = '*';
                            break;
                        }
                        case 57: {
                            chr = '(';
                            break;
                        }
                        default: {
                            break;
                        }
                    }
                }

                _KernelInputQueue.enqueue(chr);

            // Symbol keys, both shifted and not shifted
            } else if (((keyCode >= 186) && (keyCode <= 192)) ||
                      ((keyCode >= 219) && (keyCode <= 222))) {

                switch (keyCode) {
                    case 186: {
                        chr = isShifted ? ':' : ';';
                        break;
                    }
                    case 187: {
                        chr = isShifted ? '+' : '=';
                        break;
                    }
                    case 188: {
                        chr = isShifted ? '<' : ',';
                        break;
                    }
                    case 189: {
                        chr = isShifted ? '_' : '-';
                        break;
                    }
                    case 190: {
                        chr = isShifted ? '>' : '.';
                        break;
                    }
                    case 191: {
                        chr = isShifted ? '?' : '/';
                        break;
                    }
                    case 192: {
                        chr = isShifted ? '~' : '`';
                        break;
                    }
                    case 219: {
                        chr = isShifted ? '{' : '[';
                        break;
                    }
                    case 220: {
                        chr = isShifted ? '|' : '\\';
                        break;
                    }
                    case 221: {
                        chr = isShifted ? '}' : ']';
                        break;
                    }
                    case 222: {
                        chr = isShifted ? '"' : '\'';
                        break;
                    }
                    default: {
                        break;
                    }
                }


                _KernelInputQueue.enqueue(chr);
            }
        }
    }
}
