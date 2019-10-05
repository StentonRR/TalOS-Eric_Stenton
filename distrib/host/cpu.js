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
        function Cpu(PC, IR, Acc, Xreg, Yreg, Zflag, isExecuting, PCB) {
            if (PC === void 0) { PC = 0; }
            if (IR === void 0) { IR = 0x00; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            if (PCB === void 0) { PCB = null; }
            this.PC = PC;
            this.IR = IR;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
            this.PCB = PCB;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.IR = 0x00;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            this.PCB = null;
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            // Fetch next instruction from memory and place in instruction register
            this.IR = parseInt(_MemoryAccessor.read(this.PCB.memorySegment, this.PC), 16);
            // Decode and execute instruction
            switch (this.IR) {
                case 0xA9:
                    this.loadAccWithConstant();
                    break;
                case 0xAD:
                    this.loadAccFromMemory();
                    break;
                case 0x8D:
                    this.storeAccInMemory();
                    break;
                case 0x6D:
                    this.addWithCarry();
                    break;
                case 0xA2:
                    this.loadXRegWithConstant();
                    break;
                case 0xAE:
                    this.loadXRegFromMemory();
                    break;
                case 0xA0:
                    this.loadYRegWithConstant();
                    break;
                case 0xAC:
                    this.loadYRegFromMemory();
                    break;
                case 0xEA:
                    break;
                case 0x00:
                    this.saveState();
                    this.PCB.terminate();
                    this.isExecuting = false;
                    break;
                case 0xEC:
                    this.compareToXReg();
                    break;
                case 0xD0:
                    this.branchBytes();
                    break;
                case 0xEE:
                    this.incrementByteValue();
                    break;
                case 0xFF:
                    this.systemCall();
                    break;
                default:
                    _Kernel.krnTrapError("Process Execution Exception: Instruction '" + this.IR.toString(16).toUpperCase() + "' is not valid");
                    this.PCB.terminate();
                    this.isExecuting = false;
            }
            this.increaseCounter(); // Go to next Op Code
        };
        Cpu.prototype.saveState = function () {
            // Initial run of a program won't have a pcb to saves, so skip this
            if (this.PCB) {
                this.PCB.PC = this.PC;
                this.PCB.Acc = this.Acc;
                this.PCB.Xreg = this.Xreg;
                this.PCB.Yreg = this.Yreg;
                this.PCB.Zflag = this.Zflag;
            }
        };
        Cpu.prototype.changeContext = function (newPcb) {
            this.saveState();
            this.PCB = newPcb;
            this.PC = newPcb.PC;
            this.Acc = newPcb.Acc;
            this.Xreg = newPcb.Xreg;
            this.Yreg = newPcb.Yreg;
            this.Zflag = newPcb.Zflag;
        };
        Cpu.prototype.increaseCounter = function () {
            this.PC++;
        };
        // Op codes
        // Put desired value into the accumulator
        Cpu.prototype.loadAccWithConstant = function () {
            this.increaseCounter();
            this.Acc = parseInt(_MemoryAccessor.read(this.PCB.memorySegment, this.PC), 16);
        };
        // Put the value stored in memory address into the accumulator
        Cpu.prototype.loadAccFromMemory = function () {
            this.increaseCounter();
            var address = parseInt(_MemoryAccessor.read(this.PCB.memorySegment, this.PC), 16);
            this.increaseCounter();
            this.Acc = parseInt(_MemoryAccessor.read(this.PCB.memorySegment, address), 16);
        };
        // Store the value in the accumulator into memory address
        Cpu.prototype.storeAccInMemory = function () {
            this.increaseCounter();
            var address = parseInt(_MemoryAccessor.read(this.PCB.memorySegment, this.PC), 16);
            this.increaseCounter();
            _MemoryAccessor.write(this.PCB.memorySegment, address, this.Acc.toString(16));
        };
        // Add value stored in memory to the accumulator -- store the sum in accumulator
        Cpu.prototype.addWithCarry = function () {
            this.increaseCounter();
            var address = parseInt(_MemoryAccessor.read(this.PCB.memorySegment, this.PC), 16);
            this.increaseCounter();
            this.Acc += parseInt(_MemoryAccessor.read(this.PCB.memorySegment, address), 16);
        };
        // Put desired value into the X register
        Cpu.prototype.loadXRegWithConstant = function () {
            this.increaseCounter();
            this.Xreg = parseInt(_MemoryAccessor.read(this.PCB.memorySegment, this.PC), 16);
        };
        // Put the value stored in memory address into the X register
        Cpu.prototype.loadXRegFromMemory = function () {
            this.increaseCounter();
            var address = parseInt(_MemoryAccessor.read(this.PCB.memorySegment, this.PC), 16);
            this.increaseCounter();
            this.Xreg = parseInt(_MemoryAccessor.read(this.PCB.memorySegment, address), 16);
        };
        // Put desired value into the Y register
        Cpu.prototype.loadYRegWithConstant = function () {
            this.increaseCounter();
            this.Yreg = parseInt(_MemoryAccessor.read(this.PCB.memorySegment, this.PC), 16);
        };
        // Put the value stored in memory address into the Y register
        Cpu.prototype.loadYRegFromMemory = function () {
            this.increaseCounter();
            var address = parseInt(_MemoryAccessor.read(this.PCB.memorySegment, this.PC), 16);
            this.increaseCounter();
            this.Yreg = parseInt(_MemoryAccessor.read(this.PCB.memorySegment, address), 16);
        };
        // If value stored in memory address is equal to value in X register, then make Z flag equal to 1
        Cpu.prototype.compareToXReg = function () {
            this.increaseCounter();
            var address = parseInt(_MemoryAccessor.read(this.PCB.memorySegment, this.PC), 16);
            this.increaseCounter();
            this.Zflag = parseInt(_MemoryAccessor.read(this.PCB.memorySegment, address), 16) === this.Xreg ? 1 : 0;
        };
        // Change the PC if the Z flag is 0
        Cpu.prototype.branchBytes = function () {
            this.increaseCounter();
            var bytes = parseInt(_MemoryAccessor.read(this.PCB.memorySegment, this.PC), 16);
            if (this.Zflag === 0)
                this.PC += bytes;
            // Loop the process counter back around to beginning of partition if it exceeds its size
            // plus the amount it went over
            if (this.PC > _MemoryAccessor.getSegmentSize())
                this.PC %= _MemoryAccessor.getSegmentSize();
        };
        // Increase the value stored in memory by 1
        Cpu.prototype.incrementByteValue = function () {
            this.increaseCounter();
            var address = parseInt(_MemoryAccessor.read(this.PCB.memorySegment, this.PC), 16);
            this.increaseCounter();
            var value = parseInt(_MemoryAccessor.read(this.PCB.memorySegment, address), 16);
            value++;
            _MemoryAccessor.write(this.PCB.memorySegment, address, value.toString(16));
        };
        // Print value of Y register or text stored in memory until a break code
        Cpu.prototype.systemCall = function () {
            if (this.Xreg === 1) {
                _StdOut.putText(this.Yreg.toString());
            }
            else if (this.Xreg === 2) {
                var output = "";
                var address = this.Yreg;
                var value = parseInt(_MemoryAccessor.read(this.PCB.memorySegment, address), 16);
                while (value !== 0) {
                    output += String.fromCharCode(value);
                    value = parseInt(_MemoryAccessor.read(this.PCB.memorySegment, ++address), 16);
                }
                _StdOut.putText(output);
            }
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
