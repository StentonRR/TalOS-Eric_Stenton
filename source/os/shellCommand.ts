module TSOS {
    export class ShellCommand {
        constructor(public func: any,
                    public name = "",
                    public description = "",
                    public usage = "") {
        }
    }
}
