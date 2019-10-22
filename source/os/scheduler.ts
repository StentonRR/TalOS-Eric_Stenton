module TSOS {
    export class Scheduler {
        constructor(
            public quantum: number = 6, // Default quantum for processes
            public turns: number = 0, // Number of turns a process has left with round robin
            public currentProcess: PCB = null, // Process currently scheduled to run -- mostly for round robin use
            public activeAlgorithm: string = "rr" // Current scheduling algorithm in use
        ) {
        }

        // Sort ready queue in order designated by scheduling algorithm -- running process should always be in index 0
        public scheduleProcesses() {
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
        }

        // Run the next process in the ready queue
        public runProcess() {
            // Make sure process isn't already running
            let runningProcess = _PcbList.find(element => element.state == 'running');

            if (!runningProcess || runningProcess.pid !== _ReadyQueue[0].pid) {
                // Run process through interrupt and dispatcher
                _KernelInterruptQueue.enqueue(new Interrupt(RUN_PROCESS_IRQ, [_ReadyQueue[0]]));
            }
        }

        // Adds a process to ready queue and changes its state
        public addToReadyQueue(pcb) {
            // Process is ready to be processed by cpu
            pcb.state = "ready";
            _ReadyQueue.push(pcb);
        }

        public roundRobinScheduler(quantum) {
            // Processes should be 'pushed' to ready queue, so they are already in order of arrival,
            // so no need to reorder them
            if (this.currentProcess && _ReadyQueue[0].pid === this.currentProcess.pid) {
                if (this.turns <= 0) { // Reorder ready queue and run next process because turns ran out
                    let process = _ReadyQueue.splice(0, 1);
                    _ReadyQueue.push(process[0]);

                    this.currentProcess = _ReadyQueue[0];
                    this.turns = quantum;
                }
            } else { // Run next process because previous one terminated or this is the first one to run
                this.turns = quantum;
                this.currentProcess = _ReadyQueue[0];
            }

            this.runProcess();
            this.turns--;
        }

        public shortestJobFirstScheduler() {

        }

        public priorityScheduler() {
            _ReadyQueue.sort((a, b) => (b.priority < a.priority) ? 1 : -1);
        }

        public updateStatistics() {
            for (let pcb of _PcbList) {
                pcb.turnAroundTime++;

                // Turnaround and wait time increases for ready processes
                if (pcb.state === 'ready') pcb.waitTime++;
            }

        }
    }
}