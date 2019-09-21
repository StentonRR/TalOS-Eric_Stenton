module TSOS {
    export class PCB {
        constructor(
            public state = "new", // State of the program (new, resident, ready, running, or terminated
            public pc = 0, // Program counter
            public acc = 0, // Accumulator
            public xReg = 0, // X register
            public yReg = 0, // Y register
            public pid = _pidCounter++, // Process id
            public priority = 0, // Priority of the process
            public memorySegment = null, // The segment of memory the program resides

            // Accounting information
            public waitTime = 0, // Time the program spent waiting
            public turnAroundTime = 0 // Time it took for the program to execute
            ) {
        }
    }
}
