import { base64, capitalize, currentTimestamp, timeLeft } from './helpers';
import { Token } from './interface';

export abstract class BaseToken {
  constructor(protected attributes: Token) {}

  get access_token() {
    return this.attributes.access_token;
  }

  get refresh_token() {
    return this.attributes.refresh_token;
  }

  get token_type() {
    return this.attributes.token_type ?? 'bearer';
  }

  get exp() {
    return this.attributes.exp;
  }

  valid(): boolean {
    return this.hasAccessToken() && !this.isExpired();
  }

  getBearerToken(): string {
    return this.access_token
      ? [capitalize(this.token_type), this.access_token].join(' ').trim()
      : '';
  }

  needRefresh(): boolean {
    return this.exp !== undefined && this.exp >= 0;
  }

  getRefreshTime(): number {
    return timeLeft((this.exp ?? 0) - 5);
  }

  private hasAccessToken(): boolean {
    return !!this.access_token;
  }

  protected isExpired(): boolean {
    const exp = this.exp;
    if (!exp) return true;
    return exp - currentTimestamp() <= 0;
  }
}

export class SimpleToken extends BaseToken {}

export class JwtToken extends SimpleToken {
  private _payload?: { exp?: number };

  static is(accessToken: string): boolean {
    try {
      const [header] = accessToken.split('.');
      const json = base64.decode(header);
      const parsed = JSON.parse(json);
      return parsed.typ?.toUpperCase().includes('JWT');
    } catch {
      return false;
    }
  }

  get exp(): number | undefined {
    return this.payload?.exp;
  }

  private get payload(): { exp?: number } {
    if (!this.access_token) return {};
    if (this._payload) return this._payload;

    try {
      const [, payload] = this.access_token.split('.');
      const data = JSON.parse(base64.decode(payload));
      if (!data.exp) {
        data.exp = this.attributes.exp;
      }
      return (this._payload = data);
    } catch {
      return {};
    }
  }
}
