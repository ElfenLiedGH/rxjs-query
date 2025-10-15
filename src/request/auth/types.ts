export interface AuthStrategy {
  applyAuth(headers: Headers): void;

  // Метод для проверки, нужно ли обновлять токен по ответу
  shouldInvalidate(response: Response): boolean;

  // Метод для обновления токена, возвращает Observable, который завершится после обновления
  refreshToken(): Promise<void>;
}
