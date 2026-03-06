import { hashText } from '@/lib/tools/processors/hash';

describe('Hash processor', () => {
  it('hashes text with SHA-256', async () => {
    const result = await hashText({
      algorithm: 'sha256',
      inputValue: 'hello'
    });

    expect(result.state).toBe('valid');
    expect(result.value).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
    expect(result.legacy).toBe(false);
  });

  it('marks MD5 as legacy and returns the expected digest', async () => {
    const result = await hashText({
      algorithm: 'md5',
      inputValue: 'hello'
    });

    expect(result.state).toBe('valid');
    expect(result.value).toBe('5d41402abc4b2a76b9719d911017c592');
    expect(result.legacy).toBe(true);
  });

  it('requires input before hashing', async () => {
    const result = await hashText({
      algorithm: 'sha1',
      inputValue: ''
    });

    expect(result.state).toBe('invalid');
    expect(result.fieldErrors?.inputValue?.[0]).toContain('Input is required');
  });
});
