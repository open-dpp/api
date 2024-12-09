import { AuthContextInterceptor } from './auth-context.interceptor';

describe('AuthContextInterceptor', () => {
  it('should be defined', () => {
    expect(new AuthContextInterceptor()).toBeDefined();
  });
});
