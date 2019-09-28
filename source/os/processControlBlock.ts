module TSOS {
    export class PCB {
        constructor(
            public state: String = "new", // State of the program (new, resident, ready, running, or terminated
            public pc: number = 0, // Program counter
            public acc: number = 0, // Accumulator
            public xReg: number = 0, // X register
            public yReg: number = 0, // Y register
            public zFlag: number = 0, // Zero flag
            public pid: number = _pidCounter++, // Process id
            public priority: number = 0, // Priority of the process
            public memorySegment: any = {}, // The segment of memory the program resides

            // Accounting information
            public waitTime: number = 0, // Time the program spent waiting
            public turnAroundTime: number = 0 // Time it took for the program to execute
            ) {
        }
    }
}
