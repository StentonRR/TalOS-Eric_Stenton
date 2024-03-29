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
        public static updateCpuDisplay(): void {
            // Op code information
            let opCodeInfo = {"A9": {"operandNumber": 1},
                "AD": {"operandNumber": 2},
                "8D": {"operandNumber": 2},
                "6D": {"operandNumber": 2},
                "A2": {"operandNumber": 1},
                "AE": {"operandNumber": 2},
                "A0": {"operandNumber": 1},
                "AC": {"operandNumber": 2},
                "EA": {"operandNumber": 0},
                "00": {"operandNumber": 0},
                "EC": {"operandNumber": 2},
                "D0": {"operandNumber": 1},
                "EE": {"operandNumber": 2},
                "FF": {"operandNumber": 0}
            };

            // Get row for output
            let table = document.getElementById("tableCpu") as HTMLTableElement;
            let row = table.rows[1];

            let currentInstruction = Utils.padHex( _CPU.IR.toString(16).toLocaleUpperCase() );

            // If invalid op code, return
            if (!opCodeInfo[currentInstruction]) return;

            // Set cpu information
            row.cells[0].innerHTML = (_CPU.PC - opCodeInfo[currentInstruction].operandNumber - 1).toString(); // Subtract 1 due to the program counter
                                                                                                              // increasing at the end of a cycle.
                                                                                                              // Remember PC starts from 0.
            row.cells[1].innerHTML = currentInstruction;
            row.cells[2].innerHTML = _CPU.Acc.toString(16).toLocaleUpperCase();
            row.cells[3].innerHTML = _CPU.Xreg.toString(16).toLocaleUpperCase();
            row.cells[4].innerHTML = _CPU.Yreg.toString(16).toLocaleUpperCase();
            row.cells[5].innerHTML = _CPU.Zflag.toString();
        }

        public static updatePcbDisplay(): void {
            let table = document.getElementById("tablePcb") as HTMLTableElement;
            let newTbody = document.createElement('tbody');
            table.style.display = 'block';
            table.style.height = '208px';

            // Add rows for each process to tbody
            let row;
            for (let i = 0; i < _ResidentList.length; i++) {
                row = newTbody.insertRow(-1);

                // Add pcb information
                row.insertCell(-1).innerHTML = _ResidentList[i].pid;
                row.insertCell(-1).innerHTML = _ResidentList[i].state.toLocaleUpperCase();
                row.insertCell(-1).innerHTML = _ResidentList[i].state == 'terminated' ? '--' : _ResidentList[i].storageLocation.toLocaleUpperCase();
                row.insertCell(-1).innerHTML = _ResidentList[i].priority;
                row.insertCell(-1).innerHTML = _ResidentList[i].PC;
                row.insertCell(-1).innerHTML = _ResidentList[i].Acc.toString(16).toLocaleUpperCase();
                row.insertCell(-1).innerHTML = _ResidentList[i].Xreg.toString(16).toLocaleUpperCase();
                row.insertCell(-1).innerHTML = _ResidentList[i].Yreg.toString(16).toLocaleUpperCase();
                row.insertCell(-1).innerHTML = _ResidentList[i].Zflag.toString(16);
            }

            // Replace old tbody with new one
            table.replaceChild(newTbody, table.tBodies[0]);
        }

        public static updateMemoryDisplay(): void {
            // Op code information
            let opCodeInfo = {"A9": {"operandNumber": 1},
                "AD": {"operandNumber": 2},
                "8D": {"operandNumber": 2},
                "6D": {"operandNumber": 2},
                "A2": {"operandNumber": 1},
                "AE": {"operandNumber": 2},
                "A0": {"operandNumber": 1},
                "AC": {"operandNumber": 2},
                "EA": {"operandNumber": 0},
                "00": {"operandNumber": 0},
                "EC": {"operandNumber": 2},
                "D0": {"operandNumber": 1},
                "EE": {"operandNumber": 2},
                "FF": {"operandNumber": 0}
            };

            let table = document.getElementById("tableMemory") as HTMLTableElement;
            let newTbody = document.createElement('tbody');
            table.style.display = 'block';

            // Add memory information -- must work around memory accessor, so need physical to logical address calculations
            let row;
            let rowLabel = "0x000";
            let rowNumber = 0;
            let placeNumber = 0;

            let physicalAddress = 0;
            let memory = _MemoryAccessor.dump();

            let highlightedCell;

            for (let i = 0; i <  _MemoryAccessor.getMemorySize() / 8; i++) {
                row = newTbody.insertRow(-1);

                // Get how many zeros should be in the row label
                rowNumber = 8 * i;
                if (rowNumber > 255) {
                    placeNumber = 2;
                } else if (rowNumber > 15) {
                    placeNumber = 3;
                } else {
                    placeNumber = 4;
                }

                // Set row label EX: 0x2E8
                row.insertCell(-1).innerHTML = rowLabel.slice(0, placeNumber) + rowNumber.toString(16).toLocaleUpperCase();

                // Add memory information
                let cell;
                let currentInstruction;
                let operandHighlights = [];
                for (let j = 0; j < 8; j++) {
                    cell = row.insertCell(-1);
                    cell.innerHTML = memory[physicalAddress].toLocaleUpperCase();

                    currentInstruction = Utils.padHex( _CPU.IR.toString(16).toLocaleUpperCase() );

                    // Highlight the current memory address being read in display
                    if ( _CPU.PCB && _CPU.isExecuting && opCodeInfo[currentInstruction] ) {
                        // Subtract 1 from below due to the program counter being incremented at the end of a cycle
                        if ( (_CPU.PCB.memorySegment.baseRegister + _CPU.PC - opCodeInfo[currentInstruction].operandNumber - 1) == physicalAddress ) {
                            cell.style.backgroundColor = "#ff6961";
                            highlightedCell = cell;

                            operandHighlights[0] = opCodeInfo[currentInstruction].operandNumber;
                            operandHighlights[1] = false;

                            // Since D0 branches, do not highlight operands
                            if (currentInstruction == "D0") {
                                operandHighlights[0] = 0;
                            }
                        }

                        // Highlight operands
                        if (operandHighlights[0] > 0 && operandHighlights[1]) {
                            cell.style.backgroundColor = "#77dd77 ";
                            highlightedCell = cell;

                            operandHighlights[0]--;
                        }

                        // Skip highlight operands once so that the current instruction isn't highlighted
                        if(operandHighlights[0] > 0 && !operandHighlights[1]) {
                            operandHighlights[1] = true;
                        }
                    }

                    physicalAddress++;
                }
            }

            // Replace old tbody with new one
            table.replaceChild(newTbody, table.tBodies[0]);

            // Scroll to highlighted cell in display
            if (highlightedCell) highlightedCell.scrollIntoView({block: 'nearest'});
        }

        public static updateHardDriveDisplay(): void {
            // Only update if hard drive is formatted
            if (!_krnFileSystemDriver.formatted) return;

            let table = document.getElementById("tableHardDrive") as HTMLTableElement;
            let newTbody = document.createElement('tbody');
            table.style.display = 'block';

            let row;

            // Loop through all tracks, sectors, and blocks
            let pointer;
            for (let t = 0; t < _Disk.getTrackNumber(); t++) {
                for (let s = 0; s < _Disk.getSectorNumber(); s++) {
                    for (let b = 0; b < _Disk.getBlockNumber(); b++) {
                        // Create a row for an entry
                        row = newTbody.insertRow(-1);

                        // Grab block
                        let block = sessionStorage.getItem(`${t}:${s}:${b}`);

                        // Insert key
                        row.insertCell(-1).innerHTML = `${t}:${s}:${b}`;

                        // Insert availability
                        row.insertCell(-1).innerHTML = block[0];

                        // Insert next pointer
                        pointer = block.substring(1, 4);
                        row.insertCell(-1).innerHTML = `${pointer[0]}:${pointer[1]}:${pointer[2]}`;

                        // Insert data
                        row.insertCell(-1).innerHTML = block.substring(4);
                    }
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

            // ... Create disk ...
            _Disk = new Disk();

            // ... Create memory accessor ...
            _MemoryAccessor = new TSOS.MemoryAccessor();

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
