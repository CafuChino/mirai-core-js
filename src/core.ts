import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import path from 'path';

const ansiRegex = /(\u001b\[\S+m)/g;
const newLineRegex = /\n/g;

export interface MclOptions {
  javaPath: string;
  mclPath: string;
  restartMaxTimes?: number
  onOutput?: (data: any) => void,
  onStatusChange?: (status: string) => void,
  autoStart?: boolean
}

export type MclStatus = 'starting' | 'running' | 'stopped' | 'restarting' | 'restarting_error' | 'unStarted' | 'stopping';

class MclClient {

  status: MclStatus = 'unStarted';

  java_path: string;
  mcl_path: string;
  private args: Array<string>;

  process: ChildProcessWithoutNullStreams | null = null;
  restartTimes = 0;
  restartMaxTimes = 3;
  restartTimesInterval = 1000;
  autoStart = true;

  customStdoutHandler: Function | null = null;
  statusChangeHandler: Function | null = null;


  constructor(options: MclOptions) {
    if (!options.javaPath) {
      throw new Error('javaPath is required');
    }
    if (!options.mclPath) {
      throw new Error('mclPath is required');
    }
    this.java_path = options.javaPath;
    this.mcl_path = options.mclPath;
    this.restartMaxTimes = options.restartMaxTimes || 3;
    this.autoStart = options.autoStart || true;
    this.customStdoutHandler = options.onOutput || null;
    this.statusChangeHandler = options.onStatusChange || null;
    this.args = ['-jar', path.join(this.mcl_path, 'mcl.jar')];
    if (this.autoStart) {
      this.start();
    }
  }

  public start() {
    this.process = spawn(this.java_path, this.args, { cwd: this.mcl_path });
    this.status = 'starting';
    this.statusChangeHandler?.(this.status);

    this.process.on('close', (code) => {
      if (this.status !== 'stopping') {
        this.restart();
      } else {
        this.status = 'stopped';
        this.statusChangeHandler?.(this.status);
      }
    });

    this.process.stdout.on('data', (data: any) => {
      this.handleStdout(data);
    });
  }

  public restart() {
    if (this.restartTimes <= this.restartMaxTimes) {
      this.restartTimes++;
      this.status = 'restarting';
      this.statusChangeHandler?.(this.status);
      this.start();
    } else {
      this.status = 'restarting_error';
      this.statusChangeHandler?.(this.status);
    }
  }

  public exec(command: string) {
    if (!this.process) {
      throw new Error('mcl client is not started');
    }
    this.process?.stdin.write(`${command}\n`);
  }

  public stop() {
    this.status = 'stopping';
    this.statusChangeHandler?.(this.status);
    this.exec('/stop');
  }

  handleStdout(data: any) {
    if (data.toString('utf8').replace(ansiRegex, '').replace(newLineRegex, '').trim() === ">") {
      if (this.status === 'starting' || this.status === 'restarting') {
        this.status = 'running';
        this.statusChangeHandler?.(this.status);
        this.restartTimes = 0;
        return;
      }
      if (this.customStdoutHandler) {
        this.customStdoutHandler(data.toString('utf8').replace(newLineRegex, '\r\n'));
      }
    }
  }
}
export default MclClient;
