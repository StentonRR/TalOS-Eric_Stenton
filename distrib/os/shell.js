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
var TSOS;
(function (TSOS) {
    class Shell {
        constructor() {
            // Properties
            this.promptStr = ">";
            this.commandList = [];
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
            this.apologies = "[sorry]";
        }
        init() {
            let sc;
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
            sc = new TSOS.ShellCommand(this.shellDeath, "death", "Death is only a new beginning, except for this kernal. This ones done for.", "death");
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
            // ps  - list the running processes and their IDs
            // kill <id> - kills the specified process id.
            //
            // Display the initial prompt.
            this.putPrompt();
        }
        putPrompt() {
            _StdOut.putText(this.promptStr);
        }
        handleInput(buffer) {
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
            let index = 0;
            let found = false;
            let fn = undefined;
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
        }
        // Note: args is an option parameter, ergo the ? which allows TypeScript to understand that.
        execute(fn, args) {
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
        parseInput(buffer) {
            let retVal = new TSOS.UserCommand();
            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);
            // 2. Lower-case it.
            buffer = buffer.toLowerCase();
            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            let tempList = buffer.split(" ");
            // 4. Take the first (zeroth) element and use that as the command.
            let cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;
            // 5. Now create the args array from what's left.
            for (let i in tempList) {
                let arg = TSOS.Utils.trim(tempList[i]);
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
        shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            }
            else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }
        shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }
        shellApology() {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            }
            else {
                _StdOut.putText("For what?");
            }
        }
        shellVer() {
            _StdOut.putText(`${APP_NAME} version ${APP_VERSION} android @v${ANDROID_VERSION}`);
        }
        shellHelp() {
            _StdOut.putText("Commands:");
            for (let i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].usage + " - " + _OsShell.commandList[i].description);
            }
        }
        shellLoad() {
            let programInput = document.getElementById("taProgramInput").value;
            // Remove whitespace from string
            programInput = programInput.replace(/\s/g, "");
            // Hexidecimal must have either digits 0 through 9 or letters A through F whether lowercase or uppercase
            let regex = /^[A-Fa-f0-9]+$/;
            // Test if input passes hexidecimal requirements
            let validity = regex.test(programInput);
            // Output result for Project 1
            _StdOut.putText(`User program is ${validity ? "" : "NOT "}valid hexidecimal`);
        }
        shellStatus(args) {
            if (args.length > 0) {
                document.getElementById("status").innerHTML = args.join(" ");
            }
            else {
                _StdOut.putText("Usage: status <string> Please supply a string.");
            }
        }
        shellShutdown() {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        }
        shellCls() {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }
        shellDeath() {
            _Kernel.krnTrapError("Kernal death");
        }
        shellMan(args) {
            if (args.length > 0) {
                let topic = args[0];
                // Loop through command list and return requested command information
                let found = false;
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
                if (!found)
                    _StdOut.putText("No manual entry for " + topic + ".");
            }
            else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }
        shellTrace(args) {
            if (args.length > 0) {
                let setting = args[0];
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
        }
        shellRot13(args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            }
            else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }
        shellPrompt(args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            }
            else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }
        shellDate() {
            let date = new Date();
            let days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
            let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            _StdOut.putText(`Today is ${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`);
        }
        shellWhereami() {
            _StdOut.putText(`You are currently in the drive 0 simulation managed by EL-0 HIM`);
        }
        async shellQuote() {
            // Query a public and free quote api
            let res = await fetch("https://programming-quotes-api.herokuapp.com/quotes/random/lang/en");
            if (!res.ok) {
                throw new Error(res.statusText);
            }
            else {
                let data = await res.json();
                // Put the quote into a text area because the async nature of this function messes up the console lines
                let inputElement = document.getElementById("taQuoteLog");
                inputElement.value = `${data.en} ~ ${data.author}`;
            }
        }
    }
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=shell.js.map