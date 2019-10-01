var TSOS;
(function (TSOS) {
    var Dispatcher = /** @class */ (function () {
        function Dispatcher() {
        }
        Dispatcher.prototype.runProcess = function (pcb) {
            pcb.state = "running";
            _CPU.changeContext(pcb);
            _CPU.isExecuting = true;
        };
        Dispatcher.prototype.terminateCurrentProcess = function () {
            if (_CPU.PCB) {
                _CPU.saveState();
                _CPU.PCB.terminate();
            }
        };
        return Dispatcher;
    }());
    TSOS.Dispatcher = Dispatcher;
})(TSOS || (TSOS = {}));