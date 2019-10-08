///<reference path="../globals.ts" />

/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module TSOS {

    export class Console {

        constructor(public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize,
                    public buffer = "",
                    public commandHistory = [],
                    public commandIndex = 0,
                    public tabList = [],
                    public tabIndex = 0,
                    public tabRegex = null) {
        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        // Optional parameter to increase or decrease height of erasure
        private clearScreen(h?: number): void {
            _DrawingContext.clearRect(0, 0, _Canvas.width, h ? h : _Canvas.height);
        }

        private resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }

        public handleInput(): void {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                let chr = _KernelInputQueue.dequeue();

                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === "ctrl-c"){ // Control + C -- Use interrupt to terminate current process
                    _KernelInterruptQueue.enqueue( new Interrupt(TERMINATE_CURRENT_PROCESS_IRQ) );
                    this.buffer = ""; // Clear buffer since display shows an empty, new line
                } else if (chr === String.fromCharCode(13)) { // Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);

                    // Add command to history if not empty
                    if (this.buffer) this.commandHistory.push(this.buffer);

                    // ... and reset our buffer
                    this.buffer = "";

                    // ... and reset the command index
                    this.commandIndex = this.commandHistory.length;

                    // ... and reset the tab index and list
                    this.tabIndex = 0;
                    this.tabList = [];

                } else if (chr === String.fromCharCode(8)) { // Back space
                    // If there are characters in the buffer, delete the last character
                    if (this.buffer) {
                        this.deleteText(this.buffer.charAt(this.buffer.length - 1), this.buffer.length - 1);
                        this.buffer = this.buffer.slice(0, -1);
                    }

                    // Reset the tab index and list
                    this.tabIndex = 0;
                    this.tabList = [];

                } else if (chr === String.fromCharCode(9) && this.buffer) {
                    // Not currently accessing command autocomplete
                    if (this.tabList.length == 0) {
                        // Create test for first letters of commands
                        this.tabRegex = new RegExp(`^${this.buffer}`);

                        // Add initial buffer to list
                        this.tabList.push(this.buffer);

                        // Find the commands that begin with current letters
                        for (let cmd of _OsShell.commandList) {
                            if (this.tabRegex.test(cmd.name)) this.tabList.push(cmd.name);
                        }
                    }

                    // Go to next index if available, else reset
                    if (this.tabList[this.tabIndex + 1] == undefined) {
                        this.tabIndex = 0;

                        // Replace original user buffer and clear list
                        this.deleteLine();
                        this.putText(this.tabList[this.tabIndex]);
                        this.buffer = this.tabList[this.tabIndex];
                        this.tabList = [];
                    } else {
                        this.tabIndex++;

                        // Cycle through options
                        this.deleteLine();
                        this.putText(this.tabList[this.tabIndex]);
                        this.buffer = this.tabList[this.tabIndex];
                    }

                } else if (chr === 'up_arrow') { // Go back in command history
                    // Check if there are any past commands
                    if(this.commandIndex != 0) {
                        // Clear the line
                        this.deleteLine();

                        // Update the command index
                        this.commandIndex--;

                        // Output past command to console
                        this.putText(this.commandHistory[this.commandIndex]);

                        // Put command into buffer
                        this.buffer = this.commandHistory[this.commandIndex];
                    }

                } else if (chr === 'down_arrow') { // Go forward in command history
                    // Check if there are any next commands
                    if(this.commandIndex < (this.commandHistory.length - 1)) {
                        // Clear the line
                        this.deleteLine();

                        // Update the command index
                        this.commandIndex++;

                        // Output next command to console
                        this.putText(this.commandHistory[this.commandIndex]);

                        // Put command into buffer
                        this.buffer = this.commandHistory[this.commandIndex];
                    } else {
                        // Exit command history
                        this.deleteLine();
                        this.commandIndex = this.commandHistory.length;
                    }

                } else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Write a case for Ctrl-C.
            }
        }

        public putText(text): void {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            //
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            //         Consider fixing that.
            if (text !== "") {
                for(let character of text){
                    this.putChar(character);
                }
            }
         }

         public putChar(character): void {
             // Draw the text at the current X and Y coordinates.
             _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, character);

             // Move the current X position.
             let offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, character);
             this.currentXPosition = this.currentXPosition + offset;

             // Wrap text if exceeds the width of canvas plus a small margin
             if(this.currentXPosition > (_Canvas.width - 12)){
                 this.advanceLine();
             }
         }

        public deleteText(text, bufferLength): void {
            // Remove the text or characters from console; called when back space is pressed

            // Go up a line if command is wrapped
            if (bufferLength > 0 && this.currentXPosition <= 0) this.withdrawLine();

            // Get x start point for blank rectangle
            let xOffset = this.currentXPosition - _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);

            // Get y start point for blank rectangle
            let yOffset = this.currentYPosition - _DefaultFontSize;

            // Draw blank rectangle over text
            _DrawingContext.eraseText(_DrawingContext, xOffset, yOffset, this.currentXPosition, this.currentYPosition + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize));

            // Set the x coordinate back
            this.currentXPosition -= _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
        }

        public deleteLine(): void {
            // Delete the line of text the user has typed and not submitted; clear the buffer when done

            for(let i = this.buffer.length - 1; i > -1; i-- ){
                this.deleteText(this.buffer.charAt(i), this.buffer.length);
            }

            this.buffer = "";
        }

        public advanceLine(): void {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            let advanceValue = _DefaultFontSize +
                               _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                               _FontHeightMargin;

            this.currentYPosition += advanceValue;

            // Check if the console needs to be scrolled upward
            if (this.currentYPosition > _Canvas.height){
                // Grab snapshot of text on console and clear it
                let consoleSnapshot = _DrawingContext.getImageData(0, 0, _Canvas.width, this.currentYPosition + _FontHeightMargin);
                this.clearScreen(this.currentYPosition);

                // Get how much the y position must change
                let yDifference = this.currentYPosition - _Canvas.height + _FontHeightMargin;

                // Place snapshot higher on canvas to show next user input line
                _DrawingContext.putImageData(consoleSnapshot, 0, -(yDifference));

                // Reset X position
                this.currentXPosition = 0;

                // Move Y position to correct location
                this.currentYPosition -= yDifference;
            }
        }

        public withdrawLine(): void {
            this.currentXPosition = _DrawingContext.measureText(this.currentFont, this.currentFontSize, this.buffer);
            this.currentXPosition += _DrawingContext.measureText(this.currentFont, this.currentFontSize, _OsShell.promptStr);

            let advanceValue = _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;

            this.currentYPosition -= advanceValue;
        }

        public death(): void {
            // Color the console blue to denote blue screen of death
            document.getElementById("display").style.backgroundColor = "blue";
        }
    }
 }
