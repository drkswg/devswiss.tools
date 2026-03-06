import * as clipboard from '@/lib/utils/clipboard';
import { Base64Tool } from '@/components/tools/base64/base64-tool';
import { HashTool } from '@/components/tools/hash/hash-tool';
import { UuidTool } from '@/components/tools/uuid/uuid-tool';
import { renderIntegration } from '@/tests/integration/test-utils';

describe('Core tool journeys', () => {
  it('generates a UUID value from the UUID tool', async () => {
    const { user, getByRole, getByText } = renderIntegration(<UuidTool />);

    await user.click(getByRole('button', { name: /Generate UUID/i }));

    expect(getByText(/Generated a V4 UUID/i)).toBeInTheDocument();
    expect(getByRole('button', { name: /Copy result/i })).toBeInTheDocument();
  });

  it('encodes text in the Base64 tool', async () => {
    const { user, getByLabelText, getByRole, getByText } = renderIntegration(<Base64Tool />);

    await user.type(getByLabelText(/Plain text/i), 'Hello, DevTools 👋');
    await user.click(getByRole('button', { name: /Encode text/i }));

    expect(getByText(/Encoded the text as Base64/i)).toBeInTheDocument();
    expect(getByText('SGVsbG8sIERldlRvb2xzIPCfkYs=')).toBeInTheDocument();
  });

  it('hashes text and reports copy feedback', async () => {
    const copySpy = vi.spyOn(clipboard, 'copyTextToClipboard').mockResolvedValue({ ok: true });

    const { user, getByLabelText, getByRole, getByText } = renderIntegration(<HashTool />);

    await user.type(getByLabelText(/Plain text/i), 'hello');
    await user.click(getByRole('button', { name: /Generate hash/i }));
    await user.click(getByRole('button', { name: /Copy result/i }));

    expect(copySpy).toHaveBeenCalled();
    expect(getByText(/Copied to clipboard/i)).toBeInTheDocument();
  });
});
