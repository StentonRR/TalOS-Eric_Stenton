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

module TSOS {

    export class Cpu {

        constructor(public PC: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false,
                    public PCBIndex: number = 0) {

        }

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            this.PCBIndex = 0;
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
        }


        // Op codes

        // Put desired value into the accumulator
        public loadAccWithConstant(value): void {
            this.Acc = value;
        }

        // Put the value stored in memory address into the accumulator
        public loadAccFromMemory(address): void {
            this.Acc = parseInt(_MemoryAccessor.read(_pcbList[this.PCBIndex].memorySegment, address), 16);
        }

        // Store the value in the accumulator into memory address
        public storeAccInMemory(address): void {
            _MemoryAccessor.write(_pcbList[this.PCBIndex].memorySegment, address, this.Acc.toString(16));
        }

        // Add value stored in memory to the accumulator -- store the sum in accumulator
        public addWithCarry(address): void {
            this.Acc += parseInt(_MemoryAccessor.read(_pcbList[this.PCBIndex].memorySegment, address), 16);
        }

        // Put desired value into the X register
        public loadXRegWithConstant(value): void {
            this.Xreg = value;
        }

        // Put the value stored in memory address into the X register
        public loadXRegFromMemory(address): void {
            this.Xreg = parseInt(_MemoryAccessor.read(_pcbList[this.PCBIndex].memorySegment, address), 16);
        }

        // Put desired value into the Y register
        public loadYRegWithConstant(value): void {
            this.Yreg = value;
        }

        // Put the value stored in memory address into the Y register
        public loadYRegFromMemory(address): void {
            this.Yreg = parseInt(_MemoryAccessor.read(_pcbList[this.PCBIndex].memorySegment, address), 16);
        }

        // If value stored in memory address is equal to value in X register, then make Z flag equal to 1
        public compareToXReg(address): void {
            this.Zflag = parseInt(_MemoryAccessor.read(_pcbList[this.PCBIndex].memorySegment, address), 16) === this.Xreg ? 1 : 0;
        }

        // Change the PC if the Z flag is 0
        public branchBytes(bytes): void {
            if (this.Zflag === 0) this.PC += bytes;
        }

        // Increase the value stored in memory by 1
        public incrementByteValue(address): void {
            let value = parseInt(_MemoryAccessor.read(_pcbList[this.PCBIndex].memorySegment, address));

            value++;
            _MemoryAccessor.write(_pcbList[this.PCBIndex].memorySegment, address, value.toString(16));
        }

        // Print value of Y register or text stored in memory until a break code
        public systemCall(): void {
            if (this.Xreg === 1) {
                _StdOut.putText(this.Yreg.toString());
            } else if (this.Xreg === 2) {
                let output = "";
                let address = this.Yreg;
                let value = parseInt(_MemoryAccessor.read(_pcbList[this.PCBIndex].memorySegment, address), 16);

                while (value !== 0) {
                    output += String.fromCharCode(value);
                    value = parseInt(_MemoryAccessor.read(_pcbList[this.PCBIndex].memorySegment, ++address), 16);
                }

                _StdOut.putText(output);
            }
        }





    }
}
