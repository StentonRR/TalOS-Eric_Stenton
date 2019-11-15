///<reference path="../globals.ts" />
///<reference path="queue.ts" />

/* ------------
     Kernel.ts

     Requires globals.ts
              queue.ts

     Routines for the Operating System, NOT the host.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Kernel {
        //
        // OS Startup and Shutdown Routines
        //
        public krnBootstrap() {      // Page 8. {
            Control.hostLog("bootstrap", "host");  // Use hostLog because we ALWAYS want this, even if _Trace is off.

            // Initialize our global queues.
            _KernelInterruptQueue = new Queue();  // A (currently) non-priority queue for interrupt requests (IRQs).
            _KernelBuffers = new Array();         // Buffers... for the kernel.
            _KernelInputQueue = new Queue();      // Where device input lands before being processed out somewhere.

            // Initialize the console.
            _Console = new Console();          // The command line interface / console I/O device.
            _Console.init();

            // Initialize standard input and output to the _Console.
            _StdIn  = _Console;
            _StdOut = _Console;

            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new DeviceDriverKeyboard();     // Construct it.
            _krnKeyboardDriver.driverEntry();                    // Call the driverEntry() initialization routine.
            this.krnTrace(_krnKeyboardDriver.status);

            // Load the File System Driver
            this.krnTrace("Loading the file system driver.");
            _krnFileSystemDriver = new DeviceDriverFileSystem();
            _krnFileSystemDriver.driverEntry();
            this.krnTrace(_krnFileSystemDriver.status);

            // Initialize memory manager
            _MemoryManager = new TSOS.MemoryManager();
            _MemoryManager.init();

            // Initialize scheduler
            _Scheduler = new TSOS.Scheduler();

            // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();

            // Launch the shell.
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new Shell();
            _OsShell.init();

            // Finally, initiate student testing protocol.
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }
        }

        public krnShutdown() {
            this.krnTrace("begin shutdown OS");
            // TODO: Check for running processes.  If there are some, alert and stop. Else...
            // ... Disable the Interrupts.
            this.krnTrace("Disabling the interrupts.");
            this.krnDisableInterrupts();
            // ... Terminate any current processes
            _Dispatcher.terminateCurrentProcess();
            //
            // Unload the Device Drivers?
            // More?
            //
            this.krnTrace("end shutdown OS");
        }


        public krnOnCPUClockPulse() {
            /* This gets called from the host hardware simulation every time there is a hardware clock pulse.
               This is NOT the same as a TIMER, which causes an interrupt and is handled like other interrupts.
               This, on the other hand, is the clock pulse from the hardware / VM / host that tells the kernel
               that it has to look for interrupts and process them if it finds any.                           */

            // Have CPU save PCB state to keep visual displays up to date in real time
            _CPU.saveState();

            // Update the memory and pcb visual displays
            TSOS.Control.updateMemoryDisplay();
            TSOS.Control.updatePcbDisplay();

            // Check for an interrupt, are any. Page 560
            if (_KernelInterruptQueue.getSize() > 0) {
                // Process the first interrupt on the interrupt queue.
                // TODO: Implement a priority queue based on the IRQ number/id to enforce interrupt priority.
                let interrupt = _KernelInterruptQueue.dequeue();
                this.krnInterruptHandler(interrupt.irq, interrupt.params);
            } else if (_CPU.isExecuting) { // If there are no interrupts then run one CPU cycle if there is anything being processed. {
               if (_SingleStep) { // One cycle at a time in single-step mode
                   if (_NextStep) {
                       // Update the turnaround time and wait time for processes
                       _Scheduler.updateStatistics();

                       _CPU.cycle();
                   }
               } else {
                   // Update the turnaround time and wait time for processes
                   _Scheduler.updateStatistics();

                   _CPU.cycle();
               }

                TSOS.Control.updateCpuDisplay(); // Update CPU visual display

            } else {                      // If there are no interrupts and there is nothing being executed then just be idle. {
                this.krnTrace("Idle");
            }

            // Manage process execution if any are ready -- there is no overhead for the project,
            // so no need to put it into the above if-else statement to take up a clock tick.
            // Don't schedule if there are interrupts to avoid any discrepancies.
            // Don't schedule if in single-step mode and it is not the next step
            if( (_ReadyQueue.length > 0 && _KernelInterruptQueue.getSize() == 0) && (!_SingleStep || _NextStep) ) {
                this.krnTrace("Scheduler active");
                _Scheduler.scheduleProcesses();
            }

        }


        //
        // Interrupt Handling
        //
        public krnEnableInterrupts() {
            // Keyboard
            Devices.hostEnableKeyboardInterrupt();
            // Put more here.
        }

        public krnDisableInterrupts() {
            // Keyboard
            Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        }

        public krnInterruptHandler(irq: number, params?: any) {
            // This is the Interrupt Handler Routine.  See pages 8 and 560.
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on. Page 766.
            this.krnTrace("Handling IRQ~" + irq);

            // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
            // TODO: Consider using an Interrupt Vector in the future.
            // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.
            //       Maybe the hardware simulation will grow to support/require that in the future.
            switch (irq) {
                case TIMER_IRQ:
                    this.krnTimerISR();               // Kernel built-in routine for timers (not the clock).
                    break;
                case KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params);   // Kernel mode device driver
                    _StdIn.handleInput();
                    break;
                case TERMINATE_CURRENT_PROCESS_IRQ:   // Use dispatcher to terminate process currently running on CPU
                    _Dispatcher.terminateCurrentProcess();
                    break;
                case RUN_PROCESS_IRQ:                 // Use dispatcher to run specified process
                    _Dispatcher.runProcess(params[0]);
                    break;
                case PRINT_YREGISTER_IRQ:             // Print value in CPU's Y Register
                    _StdOut.putText(_CPU.Yreg.toString());
                    break;
                case PRINT_FROM_MEMORY_IRQ:           // Print string from memory defined by CPU's Y Register
                    let output = "";
                    let address = _CPU.Yreg;
                    let value = parseInt(_MemoryAccessor.read(_CPU.PCB.memorySegment, address), 16);

                    while (value !== 0) {
                        output += String.fromCharCode(value);
                        value = parseInt(_MemoryAccessor.read(_CPU.PCB.memorySegment, ++address), 16);
                    }

                    _StdOut.putText(output);

                    break;
                case TERMINATE_PROCESS_IRQ: // Terminate specified process -- use dispatcher if process is running
                    let pcb = params[0];
                    pcb.state == 'running' ? _Dispatcher.terminateCurrentProcess() : pcb.terminate();
                    break;
                case FILE_SYSTEM_IRQ: // Run file operation
                    _krnKeyboardDriver.isr(params); // Kernel mode device driver
                    break;
                default:
                    this.krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
            }
        }

        public krnTimerISR() {
            // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver). {
            // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
        }

        //
        // System Calls... that generate software interrupts via tha Application Programming Interface library routines.
        //
        // Some ideas:
        // - ReadConsole
        // - WriteConsole
        // - CreateProcess
        // - ExitProcess
        // - WaitForProcessToExit
        // - CreateFile
        // - OpenFile
        // - ReadFile
        // - WriteFile
        // - CloseFile


        //
        // OS Utility Routines
        //
        public krnTrace(msg: string) {
             // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
             if (_Trace) {
                if (msg === "Idle") {
                    // We can't log every idle clock pulse because it would lag the browser very quickly.
                    if (_OSclock % 10 == 0) {
                        // Check the CPU_CLOCK_INTERVAL in globals.ts for an
                        // idea of the tick rate and adjust this line accordingly.
                        Control.hostLog(msg, "OS");
                    }
                } else {
                    Control.hostLog(msg, "OS");
                }
             }
        }

        public krnTrapError(msg) {
            Control.hostLog("OS ERROR - TRAP: " + msg);
            _StdOut.putText(msg);

            // Blue Screen of Death implementation
            if (msg === "Kernal death") {
                _Console.death();
                this.krnShutdown();
            }
        }
    }
}
