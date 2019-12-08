///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />


/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

module TSOS {
    export class Shell {
        // Properties
        public promptStr = ">";
        public commandList = [];
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";

        constructor() {
        }

        public init() {
            let sc;
            //
            // Load the command list.

            // ver
            sc = new ShellCommand(this.shellVer,
                                  "ver",
                                  "Displays the current version data.",
                                  "ver");
            this.commandList.push(sc);

            // help
            sc = new ShellCommand(this.shellHelp,
                                  "help",
                                  "This is the help command. Seek help.",
                                  "help");
            this.commandList.push(sc);

            // load <priority>
            sc = new ShellCommand(this.shellLoad,
                                  "load",
                                  "Loads user program and validates hexadecimal code.",
                                  "load <priority>");
            this.commandList.push(sc);

            // run <pid>
            sc = new ShellCommand(this.shellRun,
                                  "run",
                                  "Runs the specified process",
                                  "run <PID>");
            this.commandList.push(sc);

            // status <string>
            sc = new ShellCommand(this.shellStatus,
                                  "status",
                                  "Updates the user's status.",
                                  "status <string>");
            this.commandList.push(sc);

            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                                  "shutdown",
                                  "Shuts down the virtual OS but leaves the underlying host / hardware simulation running.",
                                  "shutdown");
            this.commandList.push(sc);

            // cls
            sc = new ShellCommand(this.shellCls,
                                  "cls",
                                  "Clears the screen and resets the cursor position.",
                                  "cls");
            this.commandList.push(sc);

            // death
            sc = new ShellCommand(this.shellDeath,
                "death",
                "Death is only a new beginning, except for this kernal. This one is done for.",
                "death");
            this.commandList.push(sc);

            // man <topic>
            sc = new ShellCommand(this.shellMan,
                                  "man",
                                  "Displays the MANual page for <topic>.",
                                  "man <topic>");
            this.commandList.push(sc);

            // trace <on | off>
            sc = new ShellCommand(this.shellTrace,
                                  "trace",
                                  "Turns the OS trace on or off.",
                                  "trace <on | off>");
            this.commandList.push(sc);

            // rot13 <string>
            sc = new ShellCommand(this.shellRot13,
                                  "rot13",
                                  "Does rot13 obfuscation on <string>.",
                                  "rot13 <string>");
            this.commandList.push(sc);

            // prompt <string>
            sc = new ShellCommand(this.shellPrompt,
                                  "prompt",
                                  "Sets the prompt.",
                                  "prompt <string>");
            this.commandList.push(sc);

            // date
            sc = new ShellCommand(this.shellDate,
                                  "date",
                                  "Displays the current date.",
                                  "date");
            this.commandList.push(sc);

            // whereami
            sc = new ShellCommand(this.shellWhereami,
                "whereami",
                "Displays your current location",
                "whereami");
            this.commandList.push(sc);

            // quote
            sc = new ShellCommand(this.shellQuote,
                "quote",
                "Displays a random programmer quote in labeled text area",
                "quote");
            this.commandList.push(sc);

            // ps
            sc = new ShellCommand(this.shellPs,
                "ps",
                "List the running processes and their IDs",
                "ps");
            this.commandList.push(sc);

            // kill <PID>
            sc = new ShellCommand(this.shellKill,
                "kill",
                "Kills the process with specified process ID",
                "kill <PID>");
            this.commandList.push(sc);

            // clearmem
            sc = new ShellCommand(this.shellClearMem,
                "clearmem",
                "Clears memory partitions; this will terminate ready processes but ignore running process",
                "clearmem");
            this.commandList.push(sc);

            // runall
            sc = new ShellCommand(this.shellRunAll,
                "runall",
                "Run all processes with a 'resident' state",
                "runall");
            this.commandList.push(sc);

            // killall
            sc = new ShellCommand(this.shellKillAll,
                "killall",
                "Kill all processes",
                "killall");
            this.commandList.push(sc);

            // quantum <int>
            sc = new ShellCommand(this.shellQuantum,
                "quantum",
                "Sets the Round Robin quantum",
                "quantum <int>");
            this.commandList.push(sc);

            // create <file name>
            sc = new ShellCommand(this.shellCreate,
                "create",
                "Creates a new file with the given name",
                "create <file name>");
            this.commandList.push(sc);

            // read <file name>
            sc = new ShellCommand(this.shellRead,
                "read",
                "Prints contents of a file",
                "read <file name>");
            this.commandList.push(sc);

            // write <file name>
            sc = new ShellCommand(this.shellWrite,
                "write",
                "Writes provided data to file. Make sure to put data in quotes.",
                'write "<text>"');
            this.commandList.push(sc);

            // delete <file name>
            sc = new ShellCommand(this.shellDelete,
                "delete",
                "Deletes the file with given name",
                "delete <file name>");
            this.commandList.push(sc);

            // format
            sc = new ShellCommand(this.shellFormat,
                "format",
                "Initializes data blocks. Quick format only initializes first four bytes while full format " +
                "initializes the entire block, both header and data portion",
                "format <-quick, -full>");
            this.commandList.push(sc);

            // ls
            sc = new ShellCommand(this.shellLs,
                "ls",
                "Lists the files in the directory. The -l flag includes special files in output",
                "ls <-l (optional)>");
            this.commandList.push(sc);

            // setschedule <schedule type>
            sc = new ShellCommand(this.shellSetSchedule,
                "setschedule",
                "Changes the current scheduler. Options are round robin, first come first serve, and priority",
                "setschedule <scheduler type (rr, fcfs, or priority)>");
            this.commandList.push(sc);

            // getschedule
            sc = new ShellCommand(this.shellGetSchedule,
                "getschedule",
                "Returns the current scheduling algorithm",
                "getschedule");
            this.commandList.push(sc);

            // Display the initial prompt.
            this.putPrompt();
        }

        public putPrompt() {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            let userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            let cmd = userCommand.command;
            let args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match.  TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            let index: number = 0;
            let found: boolean = false;
            let fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].name === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses.
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {        // Check for apologies.
                    this.execute(this.shellApology);
                } else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }

        // Note: args is an option parameter, ergo the ? which allows TypeScript to understand that.
        public execute(fn, args?) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);

            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        }

        public parseInput(buffer): UserCommand {
            let retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            // 2. Separate on spaces so we can determine the command and command-line args, if any.
            let tempList = buffer.split(" ");

            // 3. Lower-case command.
            tempList[0] = tempList[0].toLowerCase();

            // 4. Take the first (zeroth) element and use that as the command.
            let cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for (let i in tempList) {
                let arg = Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }

        //
        // Shell Command Functions. Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        public shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology() {
           if (_SarcasticMode) {
              _StdOut.putText("I think we can put our differences behind us.");
              _StdOut.advanceLine();
              _StdOut.putText("For science . . . You monster.");
              _SarcasticMode = false;
           } else {
              _StdOut.putText("For what?");
           }
        }

        public shellVer() {
            _StdOut.putText(`${APP_NAME} version ${APP_VERSION} android @v${ANDROID_VERSION}`);
        }

        public shellHelp() {
            _StdOut.putText("Commands:");
            for (let i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].usage + " - " + _OsShell.commandList[i].description);
            }
        }

        public shellLoad(args) {
            let programInput = (<HTMLInputElement>document.getElementById("taProgramInput")).value;

            // Remove whitespace from string
            programInput = programInput.replace(/\s/g, "");

            // Hexadecimal must have either digits 0 through 9 or letters A through F whether lowercase or uppercase
            let regex = /^[A-Fa-f0-9]+$/;

            // Test if input passes hexadecimal requirements
            let validity = regex.test(programInput);

            // Load the program into memory if it is valid hexadecimal
            if (validity) {
               // Break program input into array of 2 characters
               let input = programInput.match(/.{2}/g);

               let pcb = _MemoryManager.load(input, args[0]);

               // Print program details if it loaded without error
               if (pcb) _StdOut.putText(`Program with PID ${pcb.pid} loaded into memory segment ${pcb.memorySegment.index}.`);
            } else {
                _StdOut.putText(`User program is not valid hexadecimal.`);
            }

        }

        public shellRun(args) {
            if (args.length > 0) {
                let pid = parseInt(args[0]);
                let pcb = _ResidentList.find(element => element.pid == pid);

                if (!pcb) {
                    _StdOut.putText(`Process ${pid} does not exist`);

                }else if (pcb.state === "ready") {
                    _StdOut.putText(`Process ${pid} is already running`);

                }else if (pcb.state === "terminated") {
                    _StdOut.putText(`Process ${pid} has already ran and terminated`);

                } else {
                    _StdOut.putText(`Running process ${pid}`);
                    _Scheduler.addToReadyQueue(pcb);

                }

            }else{
                _StdOut.putText("Usage: run <pid> Please supply a process id.");

            }
        }

        public shellClearMem() {
            // Kill processes in memory first -- ignore already terminated ones and currently running process

            let ignoreList = []; // list of memory segments to ignore when clearing
            for(let pcb of _ResidentList) {
                if(pcb.state != 'terminated' && pcb.state != 'running' && pcb.storageLocation == 'memory') {
                   _KernelInterruptQueue.enqueue(new Interrupt(TERMINATE_PROCESS_IRQ,[pcb]));
               } else if(pcb.state == 'running') {
                    ignoreList.push(pcb.memorySegment.index);
                }
            }

            _MemoryManager.clearAllMem(ignoreList);
        }

        public shellRunAll(args) {
            // Get list of resident processes
            let residentList = _ResidentList.filter(element => element.state == 'resident');

            // Get a list of the pids of all the resident processes
            let pids = residentList.map( element => element.pid);

            // Run each resident process
            for(let pid of pids) {
                let pcb = _ResidentList.find(element => element.pid == pid);
                _StdOut.putText(`Running process ${pid}`);
                _StdOut.advanceLine();
                _Scheduler.addToReadyQueue(pcb);
            }
        }

        public shellPs() {
            for(let process of _ResidentList) {
                _StdOut.putText(`${process.pid}: ${process.state}`);
                _StdOut.advanceLine();
            }
        }

        public shellKill(args) { // Only terminate processes that are ready or running
            if (args.length > 0) {
                let pcb = _ReadyQueue.find(element => element.pid == args[0]);

                if (pcb) {
                    _KernelInterruptQueue.enqueue(new Interrupt(TERMINATE_PROCESS_IRQ, [pcb]));
                } else {
                    _StdOut.putText("Process either doesn't exist or is terminated/resident.");
                }
            } else {
                _StdOut.putText("Usage: kill <PID> Please supply a PID.");
            }
        }

        public shellKillAll() {
            // Terminate each process in ready queue
            for(let pcb of _ReadyQueue) {
                _KernelInterruptQueue.enqueue(new Interrupt(TERMINATE_PROCESS_IRQ, [pcb]));
            }
        }

        public shellQuantum(args) {
            if (args.length > 0) {

                // Quantum cannot be 0 or negative
                if ( parseInt(args[0]) <= 0 || isNaN(args[0]) ) {
                    return _StdOut.putText(`Invalid quantum given!`);
                }

                _Scheduler.quantum = parseInt(args[0]);
                _StdOut.putText(`Quantum is now ${args[0]}`);
            } else {
                _StdOut.putText("Usage: quantum <int> Please supply an integer.");
            }
        }

        public shellStatus(args) {
            if (args.length > 0) {
                document.getElementById("status").innerHTML = args.join(" ");
            } else {
                _StdOut.putText("Usage: status <string> Please supply a string.");
            }
        }

        public shellShutdown() {
             _StdOut.putText("Shutting down...");
             // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        }

        public shellCls() {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }

        public shellDeath() {
            _Kernel.krnTrapError("Kernal death");
        }

        public shellMan(args) {
            if (args.length > 0) {
                let topic = args[0];

                // Loop through command list and return requested command information
                let found: Boolean = false;
                for (let command of _OsShell.commandList) {
                    if (topic === command.name) {
                        _StdOut.putText(`Description: ${command.description}`);
                        _StdOut.advanceLine();
                        _StdOut.putText(`Usage: ${_OsShell.promptStr}${command.usage}`);
                        found = true;
                        break;
                    }
                }

                // Command not found
                if(!found) _StdOut.putText("No manual entry for " + topic + ".");

            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }

        public shellTrace(args) {
            if (args.length > 0) {
                let setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        } else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }

        public shellRot13(args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) +"'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellPrompt(args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }

        public shellDate(){
            let date: Date = new Date();
            let days: String[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
            let months: String[] = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

            _StdOut.putText(`Today is ${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`);
        }

        public shellWhereami(){
            _StdOut.putText(`You are currently in the drive 0 simulation managed by EL-0 HIM`);
        }

        public async shellQuote() {
            // Query a public and free quote api
            let res = await fetch("https://programming-quotes-api.herokuapp.com/quotes/random/lang/en");

            if (!res.ok) {
                throw new Error(res.statusText);
            } else {
                let data = await res.json();

                // Put the quote into a text area because the async nature of this function messes up the console lines
                let inputElement = <HTMLInputElement>document.getElementById("taQuoteLog");
                inputElement.value = `${data.en} ~ ${data.author}`;
            }
        }

        public shellCreate(args) {
            if (args.length > 0) {
                // Add operation to object
                args.unshift('create');

                // Create interrupt for file operation
                _KernelInterruptQueue.enqueue( new Interrupt(FILE_SYSTEM_IRQ, args.slice(0, 2)) );
            } else {
                _StdOut.putText("Usage: create <file name> Please supply a file name.");
            }
        }

        public shellRead(args) {
            if (args.length > 0) {
                // Add operation to object
                args.unshift('read');

                // Create interrupt for file operation
                _KernelInterruptQueue.enqueue( new Interrupt(FILE_SYSTEM_IRQ, args.slice(0, 2)) );

            } else {
                _StdOut.putText("Usage: read <file name> Please supply a file name.");
            }
        }

        public shellWrite(args) {
            if (args.length > 0) {
                let file = args.shift();
                let indices = [];

                // Combine array to single string then separate on character
                args = args.join(" ").split(""); console.log(args);

                // Get indices of arguments that contain quotes
                args.filter(  (el, index) => {
                    if (el == '"') indices.push(index);
                });

                // Get text in between quotes
                let data = args.splice(indices[0]+1, indices[1]-1).join("");

                // Create interrupt for file operation
                _KernelInterruptQueue.enqueue( new Interrupt(FILE_SYSTEM_IRQ, ['write', file, data]) );

            } else {
                _StdOut.putText('Usage: write "<text>" Please supply a text.');
            }
        }

        public shellDelete(args) {
            if (args.length > 0) {
                // Add operation to object
                args.unshift('delete');

                // Create interrupt for file operation
                _KernelInterruptQueue.enqueue( new Interrupt(FILE_SYSTEM_IRQ, args.slice(0, 2)) );
            } else {
                _StdOut.putText("Usage: delete <file name> Please supply a file name.");
            }
        }

        public shellFormat(args) {
            // Get all flags if any and remove dashes
            args = args.filter( el => el[0] == '-').map(flag => flag.substring(1));

            // Create interrupt for file operation
            _KernelInterruptQueue.enqueue( new Interrupt(FILE_SYSTEM_IRQ, ['format', null, null, args]) );

        }

        public shellLs(args) {
            // Get all flags if any and remove dashes
            args = args.filter( el => el[0] == '-').map(flag => flag.substring(1));

            // Create interrupt for file operation
            _KernelInterruptQueue.enqueue( new Interrupt(FILE_SYSTEM_IRQ, ['list', null, null, args]) );

        }

        public shellSetSchedule(args) {
            if (args.length > 0) {

            } else {
                _StdOut.putText("Usage: setschedule <scheduler type (rr, fcfs, or priority)> Please supply a scheduler type.");
            }
        }

        public shellGetSchedule() {

        }

    }
}
