export interface LogStrategy {
  log(error: unknown): void;
  // Other error handling methods...
}
