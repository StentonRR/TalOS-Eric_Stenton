///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/* ----------------------------------
   DeviceDriverKeyboard.ts

   Requires deviceDriver.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var DeviceDriverKeyboard = /** @class */ (function (_super) {
        __extends(DeviceDriverKeyboard, _super);
        function DeviceDriverKeyboard() {
            // Override the base method pointers.
            var _this = 
            // The code below cannot run because "this" can only be
            // accessed after calling super.
            //super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            _super.call(this) || this;
            _this.driverEntry = _this.krnKbdDriverEntry;
            _this.isr = _this.krnKbdDispatchKeyPress;
            return _this;
        }
        DeviceDriverKeyboard.prototype.krnKbdDriverEntry = function () {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        };
        DeviceDriverKeyboard.prototype.krnKbdDispatchKeyPress = function (params) {
            // Parse the params.    TODO: Check that the params are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            var capsLock = params[2];
            var ctrl = params[3];
            _Kernel.krnTrace("Key code:" + keyCode + " Shifted:" + isShifted + " Caps Lock: " + capsLock + " Control: " + ctrl);
            var chr = "";
            // Check to see if we even want to deal with the key that was pressed.
            if (ctrl && keyCode == 67) { // Ctrl-C
                chr = "ctrl-c";
                _KernelInputQueue.enqueue(chr);
            }
            else if ((keyCode >= 65) && (keyCode <= 90)) { // letter
                if ((isShifted === true && capsLock === false) || (isShifted === false && capsLock === true)) {
                    chr = String.fromCharCode(keyCode); // Uppercase A-Z
                }
                else {
                    chr = String.fromCharCode(keyCode + 32); // Lowercase a-z
                }
                _KernelInputQueue.enqueue(chr);
            }
            else if (((keyCode >= 48) && (keyCode <= 57)) || // digits
                (keyCode == 32) || // space
                (keyCode == 8) || // backspace
                (keyCode == 13) || // enter
                (keyCode == 9)) { // tab
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
            }
            else if (((keyCode >= 186) && (keyCode <= 192)) ||
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
                // Up and down arrow keys
            }
            else if (keyCode == 38) {
                chr = "up_arrow";
                _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 40) {
                chr = "down_arrow";
                _KernelInputQueue.enqueue(chr);
            }
        };
        return DeviceDriverKeyboard;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverKeyboard = DeviceDriverKeyboard;
})(TSOS || (TSOS = {}));
