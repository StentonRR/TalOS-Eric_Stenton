var TSOS;
(function (TSOS) {
    var Scheduler = /** @class */ (function () {
        function Scheduler(quantum, // Default quantum for processes
        activeAlgorithm) {
            if (quantum === void 0) { quantum = 6; }
            if (activeAlgorithm === void 0) { activeAlgorithm = "rr"; }
            this.quantum = quantum;
            this.activeAlgorithm = activeAlgorithm;
        }
        // Sort ready queue in order designated by scheduling algorithm
        Scheduler.prototype.scheduleProcesses = function () {
            switch (this.activeAlgorithm) {
                case "rr": // Round Robin
                    break;
                case "fcfs": // First Come, First Serve
                    this.quantum = Infinity;
                    break;
                case "sjf": // Shortest Job First
                    break;
                case "p": // Priority
                    break;
            }
        };
        // Run the next process in the ready queue
        Scheduler.prototype.runProcess = function () {
            // Run process through interrupt and dispatcher
            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(RUN_PROCESS_IRQ, [_ReadyQueue[0]]));
        };
        // Adds a process to ready queue and changes its state
        Scheduler.prototype.addToReadyQueue = function (pcb) {
            // Process is ready to be processed by cpu
            pcb.state = "ready";
            _ReadyQueue.push(pcb);
        };
        Scheduler.prototype.roundRobinScheduler = function (quantum) {
        };
        Scheduler.prototype.firstComeFirstServeScheduler = function () {
        };
        Scheduler.prototype.shortestJobFirstScheduler = function () {
        };
        Scheduler.prototype.priorityScheduler = function () {
            _ReadyQueue.sort(function (a, b) { return (b.priority < a.priority) ? 1 : -1; });
        };
        return Scheduler;
    }());
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
