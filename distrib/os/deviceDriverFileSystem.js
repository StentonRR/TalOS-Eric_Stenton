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
        directoryDataInfo, // Information directory portion of disk
        fileDataInfo // Information file directory portion of disk
        ) {
            // Override the base method pointers.
            if (formatted === void 0) { formatted = true; }
            if (forbiddenPrefixes === void 0) { forbiddenPrefixes = ['@']; }
            if (specialPrefixes === void 0) { specialPrefixes = ['@', '.']; }
            if (masterBootRecord === void 0) { masterBootRecord = '0:0:0'; }
            if (directoryDataInfo === void 0) { directoryDataInfo = { 'type': 'directory', 'start': '0:0:1', 'end': '0:7:7' }; }
            if (fileDataInfo === void 0) { fileDataInfo = { 'type': 'file', 'start': '1:0:0', 'end': '3:7:7' }; }
            var _this = 
            // The code below cannot run because "this" can only be
            // accessed after calling super.
            //super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            _super.call(this) || this;
            _this.formatted = formatted;
            _this.forbiddenPrefixes = forbiddenPrefixes;
            _this.specialPrefixes = specialPrefixes;
            _this.masterBootRecord = masterBootRecord;
            _this.directoryDataInfo = directoryDataInfo;
            _this.fileDataInfo = fileDataInfo;
            _this.driverEntry = _this.krnFsDriverEntry;
            _this.isr = _this.krnFsDispatchOperation;
            return _this;
        }
        DeviceDriverFileSystem.prototype.krnFsDriverEntry = function () {
            // Initialization routine for this, the kernel-mode File System Device Driver.
            this.status = "loaded";
        };
        DeviceDriverFileSystem.prototype.krnFsDispatchOperation = function (params) {
            var action = params[0]; // Operation to be completed
            var target = params[1]; // Target of operation -- file or directory name
            var data = params[2]; // Any data associated with operation
            var flags = params[3]; // Flags that modify action
            console.table({ action: action, target: target, data: data, flags: flags });
            if (action == 'format') {
                _Disk.init();
            }
            else {
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
        DeviceDriverFileSystem.prototype.create = function (fileName) {
            // Check if file name is too long
            if (fileName.length > _Disk.getDataSize()) {
                return _Kernel.krnTrapError(("File allocation error: File name is too big"));
            }
            // Find a free directory space
            var key = this.findFreeSpace(1, this.directoryDataInfo)[0];
            // No space is available
            if (!key) {
                return _Kernel.krnTrapError(("File allocation error: Insufficient space to create file"));
            }
            // Get free data space
            var block = this.read(key);
            // Modify block
            block.availability = 1;
            block.data = fileName;
            // Create the directory in session storage
            this.write(key, block);
            _StdOut.putText("File successfully created");
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        };
        DeviceDriverFileSystem.prototype.read = function (key) {
            // If key object given, translate to string key
            if (typeof key == 'object')
                key = this.keyObjectToString(key);
            // Get data block and translate it to an object
            var block = sessionStorage.getItem(key);
            var blockObj = { 'availability': parseInt(block[0]),
                'pointer': this.keyStringToObject(block.substring(1, 4)),
                'data': block.substring(_Disk.getHeadSize()).match(/.{1,2}/g) };
            return blockObj;
        };
        DeviceDriverFileSystem.prototype.write = function (key, block) {
            // If key object given, translate to string key
            if (typeof key == 'object')
                key = this.keyObjectToString(key);
            // Translate data
            block.data = this.translateToHex(block.data);
            // Fill unused bytes in data section with 00's
            if (block.data.length < _Disk.getDataSize()) {
                var originalDataSize = block.data.length;
                for (var i = 0; i < _Disk.getDataSize() - originalDataSize; i++) {
                    block.data.push('00');
                }
            }
            // Combine data object values into single string
            var data = Object.values(block.pointer).concat(block.data);
            data.unshift(block.availability.toString());
            // Save to session storage
            sessionStorage.setItem(key, data.join(''));
        };
        DeviceDriverFileSystem.prototype.list = function (flags) {
            var commandFlags = ['l'];
        };
        DeviceDriverFileSystem.prototype.format = function (flags) {
            var commandFlags = ['quick', 'full'];
        };
        DeviceDriverFileSystem.prototype.findFreeSpace = function (amount, dataInfo) {
            var key = this.keyStringToObject(dataInfo.start);
            var keyLimit = this.keyStringToObject(dataInfo.end);
            var freeKeys = [];
            // Loop until free space found -- label loops to break from them easier
            trackLoop: for (var t = key.t; t <= keyLimit.t; t++) {
                sectorLoop: for (var s = key.s; s <= keyLimit.s; s++) {
                    blockLoop: // Ternary to skip master book record
                     for (var b = (t == 0 && s == 0) ? key.b : 0; b <= keyLimit.b; b++) {
                        var data = this.read({ t: t, s: s, b: b });
                        // Add key to list if it is available
                        if (!data.availability) {
                            freeKeys.push(this.keyObjectToString({ t: t, s: s, b: b }));
                            amount--;
                        }
                        // Break loops if all desired keys are found
                        if (amount == 0)
                            break trackLoop;
                    }
                }
            }
            return freeKeys;
        };
        DeviceDriverFileSystem.prototype.keyStringToObject = function (key) {
            // Check if key is initialized or not
            if (key == 'FFF') {
                return { 't': 'F', 's': 'F', 'b': 'F' };
            }
            else {
                // Make key into an object of integers to loop through easier
                key = key.split(':');
                return { 't': parseInt(key[0]), 's': parseInt(key[1]), 'b': parseInt(key[2]) };
            }
        };
        DeviceDriverFileSystem.prototype.keyObjectToString = function (key) {
            // Make key back into a string for session storage indexing
            return key.t + ":" + key.s + ":" + key.b;
        };
        DeviceDriverFileSystem.prototype.translateToHex = function (data) {
            // Break string into list
            data = data.split('');
            // Translate characters to ascii digits then to hex
            for (var i in data) {
                data[i] = data[i].charCodeAt().toString(16);
            }
            return data;
        };
        DeviceDriverFileSystem.prototype.clearBlock = function (key) {
            _Disk.initBlock(key);
        };
        return DeviceDriverFileSystem;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverFileSystem = DeviceDriverFileSystem;
})(TSOS || (TSOS = {}));
