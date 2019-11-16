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
   DeviceDriverFileSystem.ts

   Requires deviceDriver.ts

   The Kernel File System Device Driver.
   ---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var DeviceDriverFileSystem = /** @class */ (function (_super) {
        __extends(DeviceDriverFileSystem, _super);
        function DeviceDriverFileSystem(formatted, forbiddenPrefixes, // File names cannot start with these
        specialPrefixes, // Files with names that start with these need the -a flag to list
        masterBootRecord, // The key for the master boot record
        directoryBlock, // Information directory portion of disk
        fileBlock // Information file directory portion of disk
        ) {
            // Override the base method pointers.
            if (formatted === void 0) { formatted = false; }
            if (forbiddenPrefixes === void 0) { forbiddenPrefixes = ['@']; }
            if (specialPrefixes === void 0) { specialPrefixes = ['@', '.']; }
            if (masterBootRecord === void 0) { masterBootRecord = '0:0:0'; }
            if (directoryBlock === void 0) { directoryBlock = { 'start': '0:0:1', 'end': '0:7:7' }; }
            if (fileBlock === void 0) { fileBlock = { 'start': '1:0:0', 'end': '3:7:7' }; }
            var _this = 
            // The code below cannot run because "this" can only be
            // accessed after calling super.
            //super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            _super.call(this) || this;
            _this.formatted = formatted;
            _this.forbiddenPrefixes = forbiddenPrefixes;
            _this.specialPrefixes = specialPrefixes;
            _this.masterBootRecord = masterBootRecord;
            _this.directoryBlock = directoryBlock;
            _this.fileBlock = fileBlock;
            _this.driverEntry = _this.krnFsDriverEntry;
            _this.isr = _this.krnFsDispatchOperation;
            return _this;
        }
        DeviceDriverFileSystem.prototype.krnFsDriverEntry = function () {
            // Initialization routine for this, the kernel-mode File System Device Driver.
            this.status = "loaded";
            // More?
        };
        DeviceDriverFileSystem.prototype.krnFsDispatchOperation = function (params) {
            var action = params[0]; // Operation to be completed
            var target = params[1]; // Target of operation -- file or directory name
            var data = params[2]; // Any data associated with operation
            var flags = params[3]; // Flags that modify action
            if (action == 'format') {
                _Disk.init();
            }
            else {
                if (this.formatted) {
                    switch (action) {
                        case 'read': {
                            this.read(target);
                            break;
                        }
                        case 'write': {
                            // Break up data
                            var dataPieces = data.map(function () { return data.splice(0, _Disk.dataSize).filter(function (data) { return data; }); });
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
                }
                else {
                    _StdOut.putText("The disk must be formatted first!");
                }
            }
        };
        DeviceDriverFileSystem.prototype.read = function (key) {
            var block = sessionStorage.getItem(key);
            var blockObj = { 'availability': parseInt(block[0]),
                'pointer': block.substring(1, 4),
                'data': block.substring(4) };
            return blockObj;
        };
        DeviceDriverFileSystem.prototype.write = function (key, dataObj) {
            // Combine values
            var data = dataObj.pointer.concat(dataObj.data);
            data.unshift(dataObj.availability.toString());
            // Save to session storage
            sessionStorage.setItem(key, JSON.stringify(data));
        };
        DeviceDriverFileSystem.prototype.list = function (flags) {
            var commandFlags = ['l'];
        };
        DeviceDriverFileSystem.prototype.format = function () {
            var commandFlags = ['quick', 'full'];
        };
        DeviceDriverFileSystem.prototype.getFreeSpace = function (amount, block) {
            var key = block.start;
        };
        DeviceDriverFileSystem.prototype.clearBlock = function (key) {
            _Disk.initBlock(key);
        };
        return DeviceDriverFileSystem;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverFileSystem = DeviceDriverFileSystem;
})(TSOS || (TSOS = {}));
