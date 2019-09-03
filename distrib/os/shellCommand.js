var TSOS;
(function (TSOS) {
    var ShellCommand = /** @class */ (function () {
        function ShellCommand(func, name, description, usage) {
            if (name === void 0) { name = ""; }
            if (description === void 0) { description = ""; }
            if (usage === void 0) { usage = ""; }
            this.func = func;
            this.name = name;
            this.description = description;
            this.usage = usage;
        }
        return ShellCommand;
    }());
    TSOS.ShellCommand = ShellCommand;
})(TSOS || (TSOS = {}));
