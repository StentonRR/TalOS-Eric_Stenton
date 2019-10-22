module TSOS {
    export class Dispatcher {
        constructor() {
        }

        public runProcess(pcb) {
            pcb.state = "running";

            // Process that was running returns to ready state
            if (_CPU.PCB && _CPU.PCB.state !== "terminated") _CPU.PCB.state = "ready";

            _CPU.changeContext(pcb);
            _CPU.isExecuting = true;
        }

        public terminateCurrentProcess() {
            if (_CPU.PCB && _CPU.PCB.state != "terminated") {
                _CPU.saveState();
                _CPU.PCB.terminate();
                _CPU.isExecuting = false;
            }
        }
    }
}