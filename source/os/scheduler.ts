module TSOS {
    export class Scheduler {
        constructor(
            public quantum: number = 6, // Default quantum for processes
            public activeAlgorithm: string = "rr", // Current scheduling algorithm in use
        ) {
        }

        // Sort ready queue in order designated by scheduling algorithm
        public scheduleProcesses() {
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

        }

        // Run the next process in the ready queue
        public runProcess() {
            // Run process through interrupt and dispatcher
            _KernelInterruptQueue.enqueue( new Interrupt(RUN_PROCESS_IRQ, [_ReadyQueue[0]]) );
        }

        // Adds a process to ready queue and changes its state
        public addToReadyQueue(pcb) {
            // Process is ready to be processed by cpu
            pcb.state = "ready";
            _ReadyQueue.push(pcb);
        }

        public roundRobinScheduler(quantum) {

        }

        public firstComeFirstServeScheduler() {

        }

        public shortestJobFirstScheduler() {

        }

        public priorityScheduler() {
            _ReadyQueue.sort( (a,b) => (b.priority < a.priority) ? 1 : -1);
        }
    }
}