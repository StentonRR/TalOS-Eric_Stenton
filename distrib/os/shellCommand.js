var TSOS;
(function (TSOS) {
    class ShellCommand {
        constructor(func, name = "", description = "", usage = "") {
            this.func = func;
            this.name = name;
            this.description = description;
            this.usage = usage;
        }
    }
    TSOS.ShellCommand = ShellCommand;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=shellCommand.js.map