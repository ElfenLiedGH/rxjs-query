import type {AuthStrategy} from "./types";
import {Inject, Injectable} from "../../../di";
import {getAuthValueBinding} from "./binding";

@Injectable()
export class TokenAuthStrategy implements AuthStrategy {

    private readonly getAuthValue: () => string | null

    constructor(@Inject(getAuthValueBinding) getAuthValue: () => string | null) {
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
