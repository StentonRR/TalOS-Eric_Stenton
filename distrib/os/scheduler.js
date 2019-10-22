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
            switch (this.activeAlgorithm) {
                case "rr": // Round Robin
                    this.roundRobinScheduler(this.quantum);
                    break;
                case "fcfs": // First Come, First Serve
                    this.roundRobinScheduler(Infinity); // Doesn't need function of its own, just a high quantum
                    break;
                case "sjf": // Shortest Job First
                    break;
                case "p": // Priority
                    break;
            }
        };
        // Run the next process in the ready queue
        Scheduler.prototype.runProcess = function () {
            // Make sure process isn't already running
            var runningProcess = _PcbList.find(function (element) { return element.state == 'running'; });
            if (!runningProcess || runningProcess.pid !== _ReadyQueue[0].pid) {
                // Run process through interrupt and dispatcher
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(RUN_PROCESS_IRQ, [_ReadyQueue[0]]));
            }
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
                    this.currentProcess = _ReadyQueue[0];
                    this.turns = quantum;
                }
            }
            else { // Run next process because previous one terminated or this is the first one to run
                this.turns = quantum;
                this.currentProcess = _ReadyQueue[0];
            }
            this.runProcess();
            this.turns--;
        };
        Scheduler.prototype.shortestJobFirstScheduler = function () {
        };
        Scheduler.prototype.priorityScheduler = function () {
            _ReadyQueue.sort(function (a, b) { return (b.priority < a.priority) ? 1 : -1; });
        };
        Scheduler.prototype.updateStatistics = function () {
            for (var _i = 0, _PcbList_1 = _PcbList; _i < _PcbList_1.length; _i++) {
                var pcb = _PcbList_1[_i];
                pcb.turnAroundTime++;
                // Turnaround and wait time increases for ready processes
                if (pcb.state === 'ready')
                    pcb.waitTime++;
            }
        };
        return Scheduler;
    }());
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
