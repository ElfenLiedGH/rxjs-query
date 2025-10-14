export class Logger {
    public static log: (...data: any[]) => void = () => {
    }

    public static setLogger(logger: (...data: any[]) => void) {
        Logger.log = logger;
    }
}