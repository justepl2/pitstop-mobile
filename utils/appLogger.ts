// utils/appLogger.ts
// Remplace la version avec `events` par ce logger compatible React Native

export type LogLevel = 'info' | 'warn' | 'error';
export type AppLog = { id: string; level: LogLevel; title: string; details?: string; timestamp: number };
type LogsListener = (logs: AppLog[]) => void;

class AppLogger {
  private logs: AppLog[] = [];
  private listeners: Set<LogsListener> = new Set();

  addLog(level: LogLevel, title: string, details?: string) {
    const log: AppLog = {
      id: Math.random().toString(36).slice(2),
      level,
      title,
      details,
      timestamp: Date.now(),
    };
    this.logs.unshift(log);

    // Log console pour le dev
    const line = `[${level.toUpperCase()}] ${title}${details ? ` — ${details}` : ''}`;
    if (level === 'error') {
      // eslint-disable-next-line no-console
      console.error(line);
    } else if (level === 'warn') {
      // eslint-disable-next-line no-console
      console.warn(line);
    } else {
      // eslint-disable-next-line no-console
      console.log(line);
    }

    // Notifie les abonnés
    this.notify();
  }

  getLogs() {
    return this.logs;
  }

  subscribe(listener: LogsListener) {
    this.listeners.add(listener);
    // push immédiat l’état courant
    listener(this.logs);
    return () => this.listeners.delete(listener);
  }

  clear() {
    this.logs = [];
    this.notify();
  }

  private notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.logs);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('appLogger listener error:', e);
      }
    }
  }
}

export const appLogger = new AppLogger();
