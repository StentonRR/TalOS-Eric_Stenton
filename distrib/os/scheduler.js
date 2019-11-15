var TSOS;
(function (TSOS) {
    var Scheduler = /** @class */ (function () {
        function Scheduler(quantum, // Default quantum for processes
        turns, // Number of turns a process has left with round robin
        currentProcess, // Process currently scheduled to run -- mostly for round robin use
        activeAlgorithm // Current scheduling algorithm in use
        ) {
            if (quantum === void 0) { quantum = 6; }
            if (turns === void 0) { turns = 0; }
            if (currentProcess === void 0) { currentProcess = null; }
            if (activeAlgorithm === void 0) { activeAlgorithm = "rr"; }
            this.quantum = quantum;
            this.turns = turns;
            this.currentProcess = currentProcess;
            this.activeAlgorithm = activeAlgorithm;
        }
        // Sort ready queue in order designated by scheduling algorithm -- running process should always be in index 0
        Scheduler.prototype.scheduleProcesses = function () {
            // Set mode bit = user mode
            _Mode = 1;
            // Set currently running process if there is one
            this.currentProcess = _ReadyQueue.find(function (element) { return element.state == 'running'; });
            switch (this.activeAlgorithm) {
                case "rr": // Round Robin
                    _Kernel.krnTrace("Scheduling with round robin: quantum = " + this.quantum);
                    this.roundRobinScheduler(this.quantum);
                    break;
                case "fcfs": // First Come, First Serve
                    _Kernel.krnTrace("Scheduling with first come, first serve");
                    this.roundRobinScheduler(Infinity); // Doesn't need function of its own, just a high quantum
                    break;
                case "p": // Priority
                    _Kernel.krnTrace("Scheduling with priority");
                    this.priorityScheduler();
                    break;
            }
        };
        // Run the next process in the ready queue
        Scheduler.prototype.runProcess = function () {
            // Make sure process isn't already running
            if (!this.currentProcess || this.currentProcess.pid !== _ReadyQueue[0].pid) {
                // Run process through interrupt and dispatcher
                _Kernel.krnTrace("Issuing context switch");
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(RUN_PROCESS_IRQ, [_ReadyQueue[0]]));
            }
            // Set mode bit = kernel mode
            _Mode = 0;
        };
        // Adds a process to ready queue and changes its state
        Scheduler.prototype.addToReadyQueue = function (pcb) {
            // Process is ready to be processed by cpu
            pcb.state = "ready";
            _ReadyQueue.push(pcb);
        };
        Scheduler.prototype.roundRobinScheduler = function (quantum) {
            // Processes should be 'pushed' to ready queue, so they are already in order of arrival,
            // so no need to reorder them
            if (this.currentProcess && _ReadyQueue[0].pid === this.currentProcess.pid) {
                if (this.turns <= 0) { // Reorder ready queue and run next process because turns ran out
                    var process = _ReadyQueue.splice(0, 1);
                    _ReadyQueue.push(process[0]);
                    this.turns = quantum;
                }
                else {
                    this.turns--;
                }
            }
            else { // Run next process because previous one terminated or this is the first one to run -- quantum reset
                this.turns = quantum;
            }
            this.runProcess();
        };
        Scheduler.prototype.priorityScheduler = function () {
            _ReadyQueue.sort(function (a, b) { return (b.priority <= a.priority) ? 1 : -1; });
            this.runProcess();
        };
        Scheduler.prototype.updateStatistics = function () {
            _Kernel.krnTrace("Updating turnaround time and wait time for PCBs");
            for (var _i = 0, _ResidentList_1 = _ResidentList; _i < _ResidentList_1.length; _i++) {
                var pcb = _ResidentList_1[_i];
                pcb.turnAroundTime++;
                // Turnaround AND wait time increases for ready processes
                if (pcb.state === 'ready')
                    pcb.waitTime++;
            }
        };
        return Scheduler;
    }());
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
