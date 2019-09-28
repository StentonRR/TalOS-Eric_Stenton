///<reference path="../globals.ts" />
/* ------------
     CPU.ts

     Requires global.ts.

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    var Cpu = /** @class */ (function () {
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, isExecuting, PCBIndex) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            if (PCBIndex === void 0) { PCBIndex = 0; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
            this.PCBIndex = PCBIndex;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            this.PCBIndex = 0;
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
        };
        // Op codes
        // Put desired value into the accumulator
        Cpu.prototype.loadAccWithConstant = function (value) {
            this.Acc = value;
        };
        // Put the value stored in memory address into the accumulator
        Cpu.prototype.loadAccFromMemory = function (address) {
            this.Acc = parseInt(_MemoryAccessor.read(_pcbList[this.PCBIndex].memorySegment, address), 16);
        };
        // Store the value in the accumulator into memory address
        Cpu.prototype.storeAccInMemory = function (address) {
            _MemoryAccessor.write(_pcbList[this.PCBIndex].memorySegment, address, this.Acc.toString(16));
        };
        // Add value stored in memory to the accumulator -- store the sum in accumulator
        Cpu.prototype.addWithCarry = function (address) {
            this.Acc += parseInt(_MemoryAccessor.read(_pcbList[this.PCBIndex].memorySegment, address), 16);
        };
        // Put desired value into the X register
        Cpu.prototype.loadXRegWithConstant = function (value) {
            this.Xreg = value;
        };
        // Put the value stored in memory address into the X register
        Cpu.prototype.loadXRegFromMemory = function (address) {
            this.Xreg = parseInt(_MemoryAccessor.read(_pcbList[this.PCBIndex].memorySegment, address), 16);
        };
        // Put desired value into the Y register
        Cpu.prototype.loadYRegWithConstant = function (value) {
            this.Yreg = value;
        };
        // Put the value stored in memory address into the Y register
        Cpu.prototype.loadYRegFromMemory = function (address) {
            this.Yreg = parseInt(_MemoryAccessor.read(_pcbList[this.PCBIndex].memorySegment, address), 16);
        };
        // If value stored in memory address is equal to value in X register, then make Z flag equal to 1
        Cpu.prototype.compareToXReg = function (address) {
            this.Zflag = parseInt(_MemoryAccessor.read(_pcbList[this.PCBIndex].memorySegment, address), 16) === this.Xreg ? 1 : 0;
        };
        // Change the PC if the Z flag is 0
        Cpu.prototype.branchBytes = function (bytes) {
            if (this.Zflag === 0)
                this.PC += bytes;
        };
        // Increase the value stored in memory by 1
        Cpu.prototype.incrementByteValue = function (address) {
            var value = parseInt(_MemoryAccessor.read(_pcbList[this.PCBIndex].memorySegment, address));
            value++;
            _MemoryAccessor.write(_pcbList[this.PCBIndex].memorySegment, address, value.toString(16));
        };
        // Print value of Y register or text stored in memory until a break code
        Cpu.prototype.systemCall = function () {
            if (this.Xreg === 1) {
                _StdOut.putText(this.Yreg.toString());
            }
            else if (this.Xreg === 2) {
                var output = "";
                var address = this.Yreg;
                var value = parseInt(_MemoryAccessor.read(_pcbList[this.PCBIndex].memorySegment, address), 16);
                while (value !== 0) {
                    output += String.fromCharCode(value);
                    value = parseInt(_MemoryAccessor.read(_pcbList[this.PCBIndex].memorySegment, ++address), 16);
                }
                _StdOut.putText(output);
            }
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
