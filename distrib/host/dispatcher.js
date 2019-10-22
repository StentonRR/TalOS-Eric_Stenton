var TSOS;
(function (TSOS) {
    var Dispatcher = /** @class */ (function () {
        function Dispatcher() {
        }
        Dispatcher.prototype.runProcess = function (pcb) {
            pcb.state = "running";
            // Process that was running returns to ready state
            if (_CPU.PCB && _CPU.PCB.state !== "terminated")
                _CPU.PCB.state = "ready";
            _CPU.changeContext(pcb);
            _CPU.isExecuting = true;
        };
        Dispatcher.prototype.terminateCurrentProcess = function () {
            if (_CPU.PCB && _CPU.PCB.state != "terminated") {
                _CPU.saveState();
                _CPU.PCB.terminate();
                _CPU.isExecuting = false;
            }
        };
        return Dispatcher;
    }());
    TSOS.Dispatcher = Dispatcher;
})(TSOS || (TSOS = {}));
