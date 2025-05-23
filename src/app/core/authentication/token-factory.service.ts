import { Injectable } from '@angular/core';
import { Token } from './interface';
import { JwtToken, SimpleToken, BaseToken } from './token';

@Injectable({ providedIn: 'root' })
export class TokenFactory {
  create(token?: Token | null): BaseToken {
    if (!token?.access_token) return new SimpleToken({ access_token: '' });

    if (JwtToken.is(token.access_token)) {
      return new JwtToken(token);
    }

    return new SimpleToken(token);
  }
}
