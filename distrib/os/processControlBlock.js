var TSOS;
(function (TSOS) {
    var PCB = /** @class */ (function () {
        function PCB(state, // State of the program (new, resident, ready, running, or terminated
        pc, // Program counter
        acc, // Accumulator
        xReg, // X register
        yReg, // Y register
        zFlag, // Zero flag
        pid, // Process id
        priority, // Priority of the process
        memorySegment, // The segment of memory the program resides
        // Accounting information
        waitTime, // Time the program spent waiting
        turnAroundTime // Time it took for the program to execute
        ) {
            if (state === void 0) { state = "new"; }
            if (pc === void 0) { pc = 0; }
            if (acc === void 0) { acc = 0; }
            if (xReg === void 0) { xReg = 0; }
            if (yReg === void 0) { yReg = 0; }
            if (zFlag === void 0) { zFlag = 0; }
            if (pid === void 0) { pid = _pidCounter++; }
            if (priority === void 0) { priority = 0; }
            if (memorySegment === void 0) { memorySegment = null; }
            if (waitTime === void 0) { waitTime = 0; }
            if (turnAroundTime === void 0) { turnAroundTime = 0; }
            this.state = state;
            this.pc = pc;
            this.acc = acc;
            this.xReg = xReg;
            this.yReg = yReg;
            this.zFlag = zFlag;
            this.pid = pid;
            this.priority = priority;
            this.memorySegment = memorySegment;
            this.waitTime = waitTime;
            this.turnAroundTime = turnAroundTime;
        }
        return PCB;
    }());
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
