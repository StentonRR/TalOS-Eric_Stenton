var TSOS;
(function (TSOS) {
    var PCB = /** @class */ (function () {
        function PCB(state, // State of the program (new, resident, ready, running, or terminated)
        PC, // Program counter
        Acc, // Accumulator
        Xreg, // X register
        Yreg, // Y register
        Zflag, // Zero flag
        pid, // Process id
        priority, // Priority of the process
        memorySegment, // The segment of memory the program resides
        swapFile, storageLocation, // Where the program is currently stored
        // Accounting information
        waitTime, // Time the program spent waiting
        turnAroundTime // Time it took for the program to execute
        ) {
            if (state === void 0) { state = "new"; }
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (pid === void 0) { pid = _PidCounter++; }
            if (priority === void 0) { priority = 0; }
            if (memorySegment === void 0) { memorySegment = {}; }
            if (swapFile === void 0) { swapFile = ''; }
            if (storageLocation === void 0) { storageLocation = "memory"; }
            if (waitTime === void 0) { waitTime = 0; }
            if (turnAroundTime === void 0) { turnAroundTime = 0; }
            this.state = state;
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.pid = pid;
            this.priority = priority;
            this.memorySegment = memorySegment;
            this.swapFile = swapFile;
            this.storageLocation = storageLocation;
            this.waitTime = waitTime;
            this.turnAroundTime = turnAroundTime;
        }
        PCB.prototype.terminate = function () {
            var _this = this;
            this.state = "terminated";
            // Filter out pcb from ready queue if it is in there
            _ReadyQueue = _ReadyQueue.filter(function (element) { return element.pid != _this.pid; });
            // Release memory
            _MemoryManager.availability[this.memorySegment.index] = true;
            // Delete swap file if it exists and process is in hard drive
            if (this.storageLocation == 'hdd') {
                _krnFileSystemDriver.deleteFile(this.swapFile, true);
            }
            // Notify user of termination
            _StdOut.advanceLine();
            _StdOut.putText("Process " + this.pid + " terminated");
            _StdOut.advanceLine();
            _StdOut.putText("Turnaround Time: " + this.turnAroundTime + " Cycles");
            _StdOut.advanceLine();
            _StdOut.putText("Wait Time: " + this.waitTime + " Cycles");
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        };
        return PCB;
    }());
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
