///<reference path="../globals.ts" />
///<reference path="../os/canvastext.ts" />

/* ------------
     Control.ts

     Requires globals.ts.

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

//
// Control Services
//
module TSOS {

    export class Control {

        public static hostInit(): void {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.

            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = <HTMLCanvasElement>document.getElementById('display');

            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");

            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            CanvasTextFunctions.enable(_DrawingContext);   // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.

            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("taHostLog")).value="";

            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("btnStartOS")).focus();

            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        }

        public static hostLog(msg: string, source: string = "?"): void {
            // Note the OS CLOCK.
            var clock: number = _OSclock;

            // Note the REAL clock in milliseconds since January 1, 1970.
            var now: number = new Date().getTime();

            // Build the log string.
            var str: string = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now  + " })"  + "\n";

            // Update the log console.
            var taLog = <HTMLInputElement> document.getElementById("taHostLog");
            taLog.value = str + taLog.value;

            // TODO in the future: Optionally update a log database or some streaming service.
        }

        //
        // Display functions
        //
        public static initializeMemoryDisplay(): void {
            let table = document.getElementById("tableMemory");
        }

        public static initializePcbDisplay(): void {
            let table = document.getElementById("tablePcb");
        }


        public static updateCpuDisplay(): void {
            // Get row for output
            let table = document.getElementById("tableCpu") as HTMLTableElement;
            let row = table.rows[1];

            // Set cpu information
            row.cells[0].innerHTML = _CPU.PC.toString();
            row.cells[1].innerHTML = _CPU.IR.toString(16).toLocaleUpperCase();
            row.cells[2].innerHTML = _CPU.Acc.toString(16).toLocaleUpperCase();
            row.cells[3].innerHTML = _CPU.Xreg.toString(16).toLocaleUpperCase();
            row.cells[4].innerHTML = _CPU.Yreg.toString(16).toLocaleUpperCase();
            row.cells[5].innerHTML = _CPU.Zflag.toString();
        }

        public static updatePcbDisplay(): void {
            let table = document.getElementById("tablePcb") as HTMLTableElement;
            let newTbody = document.createElement('tbody');

            // Add rows for each process to tbody
            let row;
            for (let i = 0; i < _PcbList.length; i++) {
                row = newTbody.insertRow(-1);

                // Add pcb information
                row.insertCell(-1).innerHTML = _PcbList[i].pid;
                row.insertCell(-1).innerHTML = _PcbList[i].priority;
                row.insertCell(-1).innerHTML = _PcbList[i].state.toLocaleUpperCase();
                row.insertCell(-1).innerHTML = _PcbList[i].PC;
                row.insertCell(-1).innerHTML = _PcbList[i].Acc.toString(16).toLocaleUpperCase();
                row.insertCell(-1).innerHTML = _PcbList[i].Xreg.toString(16).toLocaleUpperCase();
                row.insertCell(-1).innerHTML = _PcbList[i].Yreg.toString(16).toLocaleUpperCase();
                row.insertCell(-1).innerHTML = _PcbList[i].Zflag.toString(16);
            }

            // Replace old tbody with new one
            table.replaceChild(newTbody, table.tBodies[0]);
        }

        public static updateMemoryDisplay(): void {
            let table = document.getElementById("tableMemory") as HTMLTableElement;
            let newTbody = document.createElement('tbody');

            // Add memory information -- must work around memory accessor, so need physical to logical address calculations
            let row;
            let rowLabel = "0x000";
            let rowNumber = 0;
            let placeNumber = 0;

            let physicalAddress = 0;
            let memory = _MemoryAccessor.dump();

            for (let i = 0; i <  _MemoryAccessor.getMemorySize() / 8; i++) {
                row = newTbody.insertRow(-1);

                // Get how many zeroes should be in the row label
                rowNumber = 8 * i;
                if (rowNumber > 255) {
                    placeNumber = 2;
                } else if (rowNumber > 15) {
                    placeNumber = 3;
                } else {
                    placeNumber = 4;
                }

                row.insertCell(-1).innerHTML = rowLabel.slice(0, placeNumber) + rowNumber.toString(16).toLocaleUpperCase();

                // Add memory information
                for (let j = 0; j < 8; j++) {
                    row.insertCell(-1).innerHTML = memory[physicalAddress];
                    physicalAddress++;
                }
            }

            // Replace old tbody with new one
            table.replaceChild(newTbody, table.tBodies[0]);
        }


        //
        // Host Events
        //
        public static hostBtnStartOS_click(btn): void {
            // Disable the (passed-in) start button...
            btn.disabled = true;

            // .. enable the Halt, Reset, and Single-Step buttons ...
            (<HTMLButtonElement>document.getElementById("btnHaltOS")).disabled = false;
            (<HTMLButtonElement>document.getElementById("btnReset")).disabled = false;
            (<HTMLButtonElement>document.getElementById("btnSingleStep")).disabled = false;

            // .. set focus on the OS console display ...
            document.getElementById("display").focus();

            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new Cpu();  // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init();       //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.

            // ... Create and initialize memory ...
            _Memory = new Memory();
            _Memory.init();

            // ... Create memory accessor ...
            _MemoryAccessor = new TSOS.MemoryAccessor();

            // ... Create memory manager ...
            _MemoryManager = new TSOS.MemoryManager();

            // ... Create dispatcher ...
            _Dispatcher = new TSOS.Dispatcher();

            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new Kernel();
            _Kernel.krnBootstrap();  // _GLaDOS.afterStartup() will get called in there, if configured.
        }

        public static hostBtnHaltOS_click(btn): void {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }

        public static hostBtnReset_click(btn): void {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        }

        public static hostBtnSingleStep_click(btn): void {
            _SingleStep = !_SingleStep;

            // Make button green if in single-step mode or red if not
            btn.style.backgroundColor = _SingleStep ? "green" : "red";

            // Enable or disable the next-step button depending on if in single-step mode or not
            let nextStepBtn = (<HTMLButtonElement>document.getElementById("btnNextStep")).disabled = !_SingleStep;
        }

        public static hostBtnNextStep_click(btn): void {
            // Only set _NextStep if in single-step mode
            if (_SingleStep) _NextStep = true;
        }

    }
}
