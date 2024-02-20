export interface ErrorHandlingStrategy {
  handleError(error: unknown): void;
  // Other error handling methods...
}
