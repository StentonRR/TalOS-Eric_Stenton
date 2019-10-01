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
                    public IR: number = 0x00,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false,
                    public PCB: PCB = null ) {

        }

        public init(): void {
            this.PC = 0;
            this.IR = 0x00;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            this.PCB = null;
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.

            // Fetch next instruction from memory
            this.IR = parseInt(_MemoryAccessor.read(this.PCB.memorySegment, this.PC), 16);

            // Prime first data byte for use if necessary -- can be an address or data
            let data = parseInt(_MemoryAccessor.read(this.PCB.memorySegment, this.PC + 1), 16);

            // Decode and execute instruction
            switch (this.IR) {
                case 0xA9:
                    this.loadAccWithConstant(data);
                    this.PC += 2;
                    break;

                case 0xAD:
                    this.loadAccFromMemory(data);
                    this.PC += 3;
                    break;

                case 0x8D:
                    this.storeAccInMemory(data);
                    this.PC += 3;
                    break;

                case 0x6D:
                    this.addWithCarry(data);
                    this.PC += 3;
                    break;

                case 0xA2:
                    this.loadXRegWithConstant(data);
                    this.PC += 2;
                    break;

                case 0xAE:
                    this.loadXRegFromMemory(data);
                    this.PC += 3;
                    break;

                case 0xA0:
                    this.loadYRegWithConstant(data);
                    this.PC += 2;
                    break;

                case 0xAC:
                    this.loadYRegFromMemory(data);
                    this.PC += 3;
                    break;

                case 0xEA:
                    this.PC++;
                    break;

                case 0x00:
                    this.saveState();
                    this.PCB.terminate();
                    this.isExecuting = false;
                    break;

                case 0xEC:
                    this.compareToXReg(data);
                    this.PC += 3;
                    break;

                case 0xD0:
                    this.branchBytes(data);
                    this.PC += 2;
                    break;
                case 0xEE:
                    this.incrementByteValue(data);
                    this.PC += 3;
                    break;

                case 0xFF:
                    this.systemCall();
                    this.PC++;
                    break;

                default:
                    _Kernel.krnTrapError(`Process execution Exception: Instruction '${this.IR.toString(16).toUpperCase()}' is not valid`);

                    this.PCB.terminate();
                    this.isExecuting = false;
            }
        }

        public saveState(): void {
            // Initial run of a program won't have a pcb to saves, so skip this
            if (this.PCB) {
                this.PCB.PC = this.PC;
                this.PCB.Acc = this.Acc;
                this.PCB.Xreg = this.Xreg;
                this.PCB.Yreg = this.Yreg;
                this.PCB.Zflag = this.Zflag;
            }
        }

        public changeContext(newPcb): void {
            this.saveState();

            this.PCB = newPcb;
            this.PC = newPcb.PC;
            this.Acc = newPcb.Acc;
            this.Xreg = newPcb.Xreg;
            this.Yreg = newPcb.Yreg;
            this.Zflag = newPcb.Zflag;
        }


        // Op codes

        // Put desired value into the accumulator
        public loadAccWithConstant(value): void {
            this.Acc = value;
        }

        // Put the value stored in memory address into the accumulator
        public loadAccFromMemory(address): void {
            this.Acc = parseInt(_MemoryAccessor.read(this.PCB.memorySegment, address), 16);
        }

        // Store the value in the accumulator into memory address
        public storeAccInMemory(address): void {
            _MemoryAccessor.write(this.PCB.memorySegment, address, this.Acc.toString(16));
        }

        // Add value stored in memory to the accumulator -- store the sum in accumulator
        public addWithCarry(address): void {
            this.Acc += parseInt(_MemoryAccessor.read(this.PCB.memorySegment, address), 16);
        }

        // Put desired value into the X register
        public loadXRegWithConstant(value): void {
            this.Xreg = value;
        }

        // Put the value stored in memory address into the X register
        public loadXRegFromMemory(address): void {
            this.Xreg = parseInt(_MemoryAccessor.read(this.PCB.memorySegment, address), 16);
        }

        // Put desired value into the Y register
        public loadYRegWithConstant(value): void {
            this.Yreg = value;
        }

        // Put the value stored in memory address into the Y register
        public loadYRegFromMemory(address): void {
            this.Yreg = parseInt(_MemoryAccessor.read(this.PCB.memorySegment, address), 16);
        }

        // If value stored in memory address is equal to value in X register, then make Z flag equal to 1
        public compareToXReg(address): void {
            this.Zflag = parseInt(_MemoryAccessor.read(this.PCB.memorySegment, address), 16) === this.Xreg ? 1 : 0;
        }

        // Change the PC if the Z flag is 0
        public branchBytes(bytes): void {
            if (this.Zflag === 0) this.PC += bytes;

            // Loop the process counter back around to beginning of partition if it exceeds its size
            // plus the amount it went over
            if (this.PC > _MemoryAccessor.getSegmentSize()) this.PC %= _MemoryAccessor.getSegmentSize();
        }

        // Increase the value stored in memory by 1
        public incrementByteValue(address): void {
            let value = parseInt(_MemoryAccessor.read(this.PCB.memorySegment, address));

            value++;
            _MemoryAccessor.write(this.PCB.memorySegment, address, value.toString(16));
        }

        // Print value of Y register or text stored in memory until a break code
        public systemCall(): void {
            if (this.Xreg === 1) {
                _StdOut.putText(this.Yreg.toString());
            } else if (this.Xreg === 2) {
                let output = "";
                let address = this.Yreg;
                let value = parseInt(_MemoryAccessor.read(this.PCB.memorySegment, address), 16);

                while (value !== 0) {
                    output += String.fromCharCode(value);
                    value = parseInt(_MemoryAccessor.read(this.PCB.memorySegment, ++address), 16);
                }

                _StdOut.putText(output);
            }
        }
    }
}
