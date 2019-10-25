///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */
// TODO: Write a base class / prototype for system services and let Shell inherit from it.
var TSOS;
(function (TSOS) {
    var Shell = /** @class */ (function () {
        function Shell() {
            // Properties
            this.promptStr = ">";
            this.commandList = [];
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
            this.apologies = "[sorry]";
        }
        Shell.prototype.init = function () {
            var sc;
            //
            // Load the command list.
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "Displays the current version data.", "ver");
            this.commandList.push(sc);
            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "This is the help command. Seek help.", "help");
            this.commandList.push(sc);
            // load <priority>
            sc = new TSOS.ShellCommand(this.shellLoad, "load", "Loads user program and validates hexadecimal code.", "load <priority>");
            this.commandList.push(sc);
            // run <pid>
            sc = new TSOS.ShellCommand(this.shellRun, "run", "Runs the specified process", "run <PID>");
            this.commandList.push(sc);
            // status <string>
            sc = new TSOS.ShellCommand(this.shellStatus, "status", "Updates the user's status.", "status <string>");
            this.commandList.push(sc);
            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "Shuts down the virtual OS but leaves the underlying host / hardware simulation running.", "shutdown");
            this.commandList.push(sc);
            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "Clears the screen and resets the cursor position.", "cls");
            this.commandList.push(sc);
            // death
            sc = new TSOS.ShellCommand(this.shellDeath, "death", "Death is only a new beginning, except for this kernal. This one is done for.", "death");
            this.commandList.push(sc);
            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "Displays the MANual page for <topic>.", "man <topic>");
            this.commandList.push(sc);
            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "Turns the OS trace on or off.", "trace <on | off>");
            this.commandList.push(sc);
            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "Does rot13 obfuscation on <string>.", "rot13 <string>");
            this.commandList.push(sc);
            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "Sets the prompt.", "prompt <string>");
            this.commandList.push(sc);
            // date
            sc = new TSOS.ShellCommand(this.shellDate, "date", "Displays the current date.", "date");
            this.commandList.push(sc);
            // whereami
            sc = new TSOS.ShellCommand(this.shellWhereami, "whereami", "Displays your current location", "whereami");
            this.commandList.push(sc);
            // quote
            sc = new TSOS.ShellCommand(this.shellQuote, "quote", "Displays a random programmer quote in labeled text area", "quote");
            this.commandList.push(sc);
            // ps
            sc = new TSOS.ShellCommand(this.shellPs, "ps", "List the running processes and their IDs", "ps");
            this.commandList.push(sc);
            // kill <PID>
            sc = new TSOS.ShellCommand(this.shellKill, "kill", "Kills the process with specified process ID", "kill <PID>");
            this.commandList.push(sc);
            // clearmem
            sc = new TSOS.ShellCommand(this.shellClearMem, "clearmem", "Clears all memory partitions; this will terminate all processes in memory", "clearmem");
            this.commandList.push(sc);
            // runall
            sc = new TSOS.ShellCommand(this.shellRunAll, "runall", "Run all processes with a 'resident' state", "runall");
            this.commandList.push(sc);
            // killall
            sc = new TSOS.ShellCommand(this.shellKillAll, "killall", "Kill all processes", "killall");
            this.commandList.push(sc);
            // quantum <int>
            sc = new TSOS.ShellCommand(this.shellQuantum, "quantum", "Sets the Round Robin quantum", "quantum <int>");
            this.commandList.push(sc);
            // Display the initial prompt.
            this.putPrompt();
        };
        Shell.prototype.putPrompt = function () {
            _StdOut.putText(this.promptStr);
        };
        Shell.prototype.handleInput = function (buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match.  TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].name === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                }
                else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            }
            else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) { // Check for curses.
                    this.execute(this.shellCurse);
                }
                else if (this.apologies.indexOf("[" + cmd + "]") >= 0) { // Check for apologies.
                    this.execute(this.shellApology);
                }
                else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        };
        // Note: args is an option parameter, ergo the ? which allows TypeScript to understand that.
        Shell.prototype.execute = function (fn, args) {
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
        };
        Shell.prototype.parseInput = function (buffer) {
            var retVal = new TSOS.UserCommand();
            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);
            // 2. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");
            // 3. Lower-case command.
            tempList[0] = tempList[0].toLowerCase();
            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;
            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        };
        //
        // Shell Command Functions. Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        Shell.prototype.shellInvalidCommand = function () {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            }
            else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        };
        Shell.prototype.shellCurse = function () {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        };
        Shell.prototype.shellApology = function () {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            }
            else {
                _StdOut.putText("For what?");
            }
        };
        Shell.prototype.shellVer = function () {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION + " android @v" + ANDROID_VERSION);
        };
        Shell.prototype.shellHelp = function () {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].usage + " - " + _OsShell.commandList[i].description);
            }
        };
        Shell.prototype.shellLoad = function (args) {
            var programInput = document.getElementById("taProgramInput").value;
            // Remove whitespace from string
            programInput = programInput.replace(/\s/g, "");
            // Hexadecimal must have either digits 0 through 9 or letters A through F whether lowercase or uppercase
            var regex = /^[A-Fa-f0-9]+$/;
            // Test if input passes hexadecimal requirements
            var validity = regex.test(programInput);
            // Load the program into memory if it is valid hexadecimal
            if (validity) {
                // Break program input into array of 2 characters
                var input = programInput.match(/.{2}/g);
                var pcb = _MemoryManager.load(input, args[0]);
                // Print program details if it loaded without error
                if (pcb)
                    _StdOut.putText("Program with PID " + pcb.pid + " loaded into memory segment " + pcb.memorySegment.index + ".");
            }
            else {
                _StdOut.putText("User program is not valid hexadecimal.");
            }
        };
        Shell.prototype.shellRun = function (args) {
            if (args.length > 0) {
                var pid_1 = parseInt(args[0]);
                var pcb = _ResidentList.find(function (element) { return element.pid == pid_1; });
                if (!pcb) {
                    _StdOut.putText("Process " + pid_1 + " does not exist");
                }
                else if (pcb.state === "ready") {
                    _StdOut.putText("Process " + pid_1 + " is already running");
                }
                else if (pcb.state === "terminated") {
                    _StdOut.putText("Process " + pid_1 + " has already ran and terminated");
                }
                else {
                    _StdOut.putText("Running process " + pid_1);
                    _Scheduler.addToReadyQueue(pcb);
                }
            }
            else {
                _StdOut.putText("Usage: run <pid> Please supply a process id.");
            }
        };
        Shell.prototype.shellClearMem = function () {
            // Kill all processes in memory first -- ignore already terminated ones
            for (var _i = 0, _ResidentList_1 = _ResidentList; _i < _ResidentList_1.length; _i++) {
                var pcb = _ResidentList_1[_i];
                if (pcb.state != 'terminated' && pcb.storageLocation == 'memory') {
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(TERMINATE_PROCESS_IRQ, [pcb]));
                }
            }
            _MemoryManager.clearAllMem();
        };
        Shell.prototype.shellRunAll = function (args) {
            // Get list of resident processes
            var residentList = _ResidentList.filter(function (element) { return element.state == 'resident'; });
            // Get a list of the pids of all the resident processes
            var pids = residentList.map(function (element) { return element.pid; });
            var _loop_1 = function (pid) {
                var pcb = _ResidentList.find(function (element) { return element.pid == pid; });
                _StdOut.putText("Running process " + pid);
                _StdOut.advanceLine();
                _Scheduler.addToReadyQueue(pcb);
            };
            // Run each resident process
            for (var _i = 0, pids_1 = pids; _i < pids_1.length; _i++) {
                var pid = pids_1[_i];
                _loop_1(pid);
            }
        };
        Shell.prototype.shellPs = function () {
            for (var _i = 0, _ResidentList_2 = _ResidentList; _i < _ResidentList_2.length; _i++) {
                var process = _ResidentList_2[_i];
                _StdOut.putText(process.pid + ": " + process.state);
                _StdOut.advanceLine();
            }
        };
        Shell.prototype.shellKill = function (args) {
            if (args.length > 0) {
                var pcb = _ReadyQueue.find(function (element) { return element.pid == args[0]; });
                if (pcb) {
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(TERMINATE_PROCESS_IRQ, [pcb]));
                }
                else {
                    _StdOut.putText("Process either doesn't exist or is terminated/resident.");
                }
            }
            else {
                _StdOut.putText("Usage: kill <PID> Please supply a PID.");
            }
        };
        Shell.prototype.shellKillAll = function () {
            // Terminate each process in ready queue
            for (var _i = 0, _ReadyQueue_1 = _ReadyQueue; _i < _ReadyQueue_1.length; _i++) {
                var pcb = _ReadyQueue_1[_i];
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(TERMINATE_PROCESS_IRQ, [pcb]));
            }
        };
        Shell.prototype.shellQuantum = function (args) {
            if (args.length > 0) {
                _Scheduler.quantum = parseInt(args[0]);
            }
            else {
                _StdOut.putText("Usage: quantum <int> Please supply an integer.");
            }
        };
        Shell.prototype.shellStatus = function (args) {
            if (args.length > 0) {
                document.getElementById("status").innerHTML = args.join(" ");
            }
            else {
                _StdOut.putText("Usage: status <string> Please supply a string.");
            }
        };
        Shell.prototype.shellShutdown = function () {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        };
        Shell.prototype.shellCls = function () {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        };
        Shell.prototype.shellDeath = function () {
            _Kernel.krnTrapError("Kernal death");
        };
        Shell.prototype.shellMan = function (args) {
            if (args.length > 0) {
                var topic = args[0];
                // Loop through command list and return requested command information
                var found = false;
                for (var _i = 0, _a = _OsShell.commandList; _i < _a.length; _i++) {
                    var command = _a[_i];
                    if (topic === command.name) {
                        _StdOut.putText("Description: " + command.description);
                        _StdOut.advanceLine();
                        _StdOut.putText("Usage: " + _OsShell.promptStr + command.usage);
                        found = true;
                        break;
                    }
                }
                // Command not found
                if (!found)
                    _StdOut.putText("No manual entry for " + topic + ".");
            }
            else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        };
        Shell.prototype.shellTrace = function (args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        }
                        else {
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
            }
            else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        };
        Shell.prototype.shellRot13 = function (args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            }
            else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellPrompt = function (args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            }
            else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellDate = function () {
            var date = new Date();
            var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
            var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            _StdOut.putText("Today is " + days[date.getDay()] + ", " + months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear());
        };
        Shell.prototype.shellWhereami = function () {
            _StdOut.putText("You are currently in the drive 0 simulation managed by EL-0 HIM");
        };
        Shell.prototype.shellQuote = function () {
            return __awaiter(this, void 0, void 0, function () {
                var res, data, inputElement;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, fetch("https://programming-quotes-api.herokuapp.com/quotes/random/lang/en")];
                        case 1:
                            res = _a.sent();
                            if (!!res.ok) return [3 /*break*/, 2];
                            throw new Error(res.statusText);
                        case 2: return [4 /*yield*/, res.json()];
                        case 3:
                            data = _a.sent();
                            inputElement = document.getElementById("taQuoteLog");
                            inputElement.value = data.en + " ~ " + data.author;
                            _a.label = 4;
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        return Shell;
    }());
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
