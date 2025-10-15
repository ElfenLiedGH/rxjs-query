// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Logger {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static log: (...data: any[]) => void = () => {
    // empty function
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static setLogger(logger: (...data: any[]) => void) {
    Logger.log = logger;
  }
}
