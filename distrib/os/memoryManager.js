var TSOS;
(function (TSOS) {
    var MemoryManager = /** @class */ (function () {
        function MemoryManager(availability, // Whether the memory segment is being used or not
        memoryRegisters) {
            if (availability === void 0) { availability = []; }
            if (memoryRegisters === void 0) { memoryRegisters = []; }
            this.availability = availability;
            this.memoryRegisters = memoryRegisters;
        }
        MemoryManager.prototype.init = function () {
            // Create memory information
            var memorySegmentSize = _MemoryAccessor.getSegmentSize();
            var memorySize = _MemoryAccessor.getMemorySize();
            var numberOfSegments = memorySize / memorySegmentSize;
            for (var i = 0; i < numberOfSegments; i++) {
                this.availability[i] = true;
                this.memoryRegisters[i] = { index: i,
                    baseRegister: memorySegmentSize * i,
                    limitRegister: memorySegmentSize * (i + 1) };
            }
        };
        MemoryManager.prototype.load = function (program, priority) {
            var memorySegment;
            // Find next available memory segment
            for (var i = 0; i < this.availability.length; i++) {
                if (this.availability[i]) {
                    memorySegment = i;
                    break;
                }
            }
            // Memory is full ... use hard drive
            if (memorySegment === undefined) {
                // Hard drive must be formatted first
                if (!_krnFileSystemDriver.formatted) {
                    return _StdOut.putText("No free memory available. Format hard drive for more space.");
                }
                // Create process control block for program
                var pcb = new TSOS.PCB();
                var result = void 0;
                // Create swap file and store in hard disk
                pcb.swapFile = "@" + pcb.pid;
                result = _krnFileSystemDriver.create(pcb.swapFile, true);
                if (result.status)
                    return _StdOut.putText(result.msg);
                result = _krnFileSystemDriver.writeFile(pcb.swapFile, program, true);
                if (result.status)
                    return _StdOut.putText(result.msg);
                pcb.storageLocation = 'hdd';
            }
            else {
                // Create process control block for program
                var pcb = new TSOS.PCB();
                // Clear memory in case of remaining process code
                _MemoryAccessor.clear(this.memoryRegisters[memorySegment]);
                // Load program into free memory segment
                var status_1;
                for (var i = 0; i < program.length; i++) {
                    status_1 = _MemoryAccessor.write(this.memoryRegisters[memorySegment], i, program[i]);
                    // Process terminated if it exceeds memory bounds
                    if (!status_1) {
                        return;
                    }
                }
                // Update memory segment's availability
                this.availability[memorySegment] = false;
                // Update pcb's memory segment information
                pcb.memorySegment = this.memoryRegisters[memorySegment];
            }
            // Finalize pcb information
            pcb.priority = parseInt(priority) || 0;
            pcb.state = "resident";
            // Add pcb to global list
            _ResidentList.push(pcb);
            return pcb;
        };
        MemoryManager.prototype.rollIn = function (pcb) {
            var memorySegment;
            // Find available memory segment
            for (var i = 0; i < this.availability.length; i++) {
                if (this.availability[i]) {
                    memorySegment = i;
                    break;
                }
            }
            // Get program from hard drive
            var program = _krnFileSystemDriver.readFile(pcb.swapFile, true).msg;
            // Clear memory of remaining process code
            _MemoryAccessor.clear(this.memoryRegisters[memorySegment]);
            // Load program into free memory segment
            var status;
            for (var i = 0; i < program.length; i++) {
                status = _MemoryAccessor.write(this.memoryRegisters[memorySegment], i, program[i]);
                // Process terminated if it exceeds memory bounds
                if (!status) {
                    return;
                }
            }
            // Update memory segment's availability
            this.availability[memorySegment] = false;
            // Update pcb's memory segment information
            pcb.memorySegment = this.memoryRegisters[memorySegment];
            // Delete swap file
            _krnFileSystemDriver.deleteFile(pcb.swapFile, true);
            pcb.swapFile = '';
            // Update storage location
            pcb.storageLocation = 'memory';
            return;
        };
        MemoryManager.prototype.rollOut = function (pcb) {
            // Get program
            var program = [];
            for (var i = 0; i < _MemoryAccessor.getSegmentSize(); i++) {
                program.push(_MemoryAccessor.read(pcb.memorySegment, i));
            }
            // Memory segment now available to be used
            this.availability[pcb.memorySegment.index] = true;
            // Change PCB information to reflect location change
            pcb.storageLocation = 'hdd';
            pcb.memorySegment = {};
            pcb.swapFile = "@" + pcb.pid;
            // Create swap file and write program to it
            _krnFileSystemDriver.create(pcb.swapFile, true);
            _krnFileSystemDriver.writeFile(pcb.swapFile, program, true);
            return;
        };
        MemoryManager.prototype.clearAllMem = function (ignoreList) {
            for (var _i = 0, _a = this.memoryRegisters; _i < _a.length; _i++) {
                var segment = _a[_i];
                if (!ignoreList.includes(segment.index))
                    _MemoryAccessor.clear(segment);
            }
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
