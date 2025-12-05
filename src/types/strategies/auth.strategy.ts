export interface AuthStrategy {
  applyAuth(headers: Headers): void;

  shouldInvalidate(response: Response): boolean;

  refreshToken(): Promise<void>;
}
