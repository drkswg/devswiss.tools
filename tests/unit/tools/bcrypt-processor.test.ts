import { compare, getRounds } from 'bcryptjs';

import { hashWithBcrypt } from '@/lib/tools/processors/bcrypt';

describe('Bcrypt processor', () => {
  it('hashes text locally and encodes the selected rounds', async () => {
    const inputValue = 'correct horse battery staple';
    const result = await hashWithBcrypt({
      inputValue,
      rounds: '4'
    });

    expect(result.state).toBe('valid');
    expect(result.rounds).toBe(4);
    expect(result.value).toMatch(/^\$2[aby]\$04\$/);
    expect(await compare(inputValue, result.value ?? '')).toBe(true);
    expect(getRounds(result.value ?? '')).toBe(4);
  });

  it('rejects empty input before hashing', async () => {
    const result = await hashWithBcrypt({
      inputValue: '',
      rounds: '10'
    });

    expect(result.state).toBe('invalid');
    expect(result.fieldErrors?.inputValue?.[0]).toContain('Plain text is required');
  });

  it('rejects unsupported rounds values', async () => {
    const result = await hashWithBcrypt({
      inputValue: 'local-only password',
      rounds: '0'
    });

    expect(result.state).toBe('invalid');
    expect(result.fieldErrors?.rounds?.[0]).toContain('Rounds must be between 1 and 20');
  });
});
