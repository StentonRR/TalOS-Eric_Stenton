module TSOS {
    export class PCB {
        constructor(
            public state: String = "new", // State of the program (new, resident, ready, running, or terminated)
            public PC: number = 0, // Program counter
            public Acc: number = 0, // Accumulator
            public Xreg: number = 0, // X register
            public Yreg: number = 0, // Y register
            public Zflag: number = 0, // Zero flag
            public pid: number = _PidCounter++, // Process id
            public priority: number = 0, // Priority of the process
            public memorySegment: any = {}, // The segment of memory the program resides

            // Accounting information
            public waitTime: number = 0, // Time the program spent waiting
            public turnAroundTime: number = 0 // Time it took for the program to execute
        ) {
        }

        public terminate() {
            this.state = "terminated";

            // Filter out pcb from ready queue if it is in there
            _ReadyQueue = _ReadyQueue.filter(element => element.pid != this.pid);

            // Release memory
            _MemoryManager.availability[this.memorySegment.index] = true;

            // Notify user of termination
            _StdOut.advanceLine();
            _StdOut.putText(`Process ${this.pid} terminated`);
            _StdOut.advanceLine();
            _StdOut.putText(`Turnaround Time: ${this.turnAroundTime} Cycles`);
            _StdOut.advanceLine();
            _StdOut.putText(`Wait Time: ${this.waitTime} Cycles`);
            _StdOut.advanceLine();
            _OsShell.putPrompt();

        }
    }
}