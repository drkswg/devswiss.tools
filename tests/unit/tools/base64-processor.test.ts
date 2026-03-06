import { processBase64 } from '@/lib/tools/processors/base64';

describe('Base64 processor', () => {
  it('encodes Unicode text safely', () => {
    const result = processBase64({
      mode: 'encode',
      inputValue: 'Hello, DevTools 👋'
    });

    expect(result.state).toBe('valid');
    expect(result.value).toBe('SGVsbG8sIERldlRvb2xzIPCfkYs=');
  });

  it('decodes valid Base64 back to plain text', () => {
    const result = processBase64({
      mode: 'decode',
      inputValue: 'SGVsbG8sIERldlRvb2xzIPCfkYs='
    });

    expect(result.state).toBe('valid');
    expect(result.value).toBe('Hello, DevTools 👋');
  });

  it('rejects malformed Base64 input', () => {
    const result = processBase64({
      mode: 'decode',
      inputValue: 'not-valid-base64***'
    });

    expect(result.state).toBe('invalid');
    expect(result.fieldErrors?.inputValue?.[0]).toContain('Base64 input is malformed');
  });
});
