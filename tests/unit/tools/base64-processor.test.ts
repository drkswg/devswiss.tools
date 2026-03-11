import { processBase64 } from '@/lib/tools/processors/base64';

describe('Base64 processor', () => {
  it('encodes Unicode text safely', () => {
    const result = processBase64({
      mode: 'encode',
      inputValue: 'Hello, devswiss.tools 👋'
    });

    expect(result.state).toBe('valid');
    expect(result.value).toBe('SGVsbG8sIGRldnN3aXNzLnRvb2xzIPCfkYs=');
  });

  it('decodes valid Base64 back to plain text', () => {
    const result = processBase64({
      mode: 'decode',
      inputValue: 'SGVsbG8sIGRldnN3aXNzLnRvb2xzIPCfkYs='
    });

    expect(result.state).toBe('valid');
    expect(result.value).toBe('Hello, devswiss.tools 👋');
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
