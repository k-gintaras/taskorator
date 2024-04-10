export interface ErrorHandlingStrategy {
  handleError(error: unknown): void;
  log(error: unknown): void;
  // Other error handling methods...
}
