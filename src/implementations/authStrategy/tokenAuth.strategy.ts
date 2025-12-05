import { Inject, Injectable } from '@smwb/di';
import { authStrategyGetAuthTokenBinding } from '../../bindings';
import type { AuthStrategy } from '../../types/strategies/auth.strategy';

@Injectable()
export class TokenAuthStrategy implements AuthStrategy {
  private readonly getAuthValue: () => string | null;

  constructor(
    @Inject(authStrategyGetAuthTokenBinding) getAuthValue: () => string | null
  ) {
    this.getAuthValue = getAuthValue;
  }

  shouldInvalidate(_response: Response): boolean {
    return false;
  }

  refreshToken(): Promise<void> {
    return Promise.resolve();
  }

  applyAuth(headers: Headers): void {
    const token = this.getAuthValue();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }
}
