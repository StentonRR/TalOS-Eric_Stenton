///<reference path="../globals.ts" />
/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */
var TSOS;
(function (TSOS) {
    class Console {
        constructor(currentFont = _DefaultFontFamily, currentFontSize = _DefaultFontSize, currentXPosition = 0, currentYPosition = _DefaultFontSize, buffer = "") {
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
        }
        init() {
            this.clearScreen();
            this.resetXY();
        }
        // Optional parameter to increase or decrease height of erasure
        clearScreen(h) {
            _DrawingContext.clearRect(0, 0, _Canvas.width, h ? h : _Canvas.height);
        }
        resetXY() {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }
        handleInput() {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                let chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { // Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    this.buffer = "";
                }
                else if (chr === String.fromCharCode(8)) { // Back space
                    // If there are characters in the buffer, delete the last character
                    if (this.buffer) {
                        this.deleteText(this.buffer.charAt(this.buffer.length - 1), this.buffer.length - 1);
                        this.buffer = this.buffer.slice(0, -1);
                    }
                }
                else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Write a case for Ctrl-C.
            }
        }
        putText(text) {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            //
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            //         Consider fixing that.
            if (text !== "") {
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                // Move the current X position.
                let offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
            }
        }
        deleteText(text, bufferLength) {
            // Remove the text or characters from console; called when back space is pressed
            // Go up a line if command is wrapped
            if (bufferLength > 0 && this.currentXPosition <= 0)
                this.withdrawLine();
            // Get x start point for blank rectangle
            let xOffset = this.currentXPosition - _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
            // Get y start point for blank rectangle
            let yOffset = this.currentYPosition - _DefaultFontSize;
            // Draw blank rectangle over text
            _DrawingContext.eraseText(_DrawingContext, xOffset, yOffset, this.currentXPosition, this.currentYPosition + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize));
            // Set the x coordinate back
            this.currentXPosition -= _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
        }
        advanceLine() {
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
            if (this.currentYPosition > _Canvas.height) {
                // Grab snapshot of text on console and clear it
                let consoleSnapshot = _DrawingContext.getImageData(0, 0, _Canvas.width, this.currentYPosition);
                this.clearScreen(this.currentYPosition);
                this.resetXY();
                // Place snapshot higher on canvas
                // Keep the last few lines of text on screen to make it clear the screen was scrolled
                _DrawingContext.putImageData(consoleSnapshot, 0, -(_Canvas.height - (advanceValue * 2))); // Show 2 lines from previous command
                this.currentYPosition = advanceValue * 3; // Move cursor down 3 lines
            }
        }
        withdrawLine() {
            // Opposite of advanceLine function; The cursor will return to the previous line
        }
        death() {
            // Color the console blue, but also make it see through for the message
            _DrawingContext.fillStyle = "rgba(0, 0, 255, 0.5)";
            _DrawingContext.fillRect(0, 0, _Canvas.width, _Canvas.height);
        }
    }
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=console.js.map