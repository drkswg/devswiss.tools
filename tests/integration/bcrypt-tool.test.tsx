import * as clipboard from '@/lib/utils/clipboard';
import BcryptPage from '@/app/tools/bcrypt/page';
import { BcryptTool } from '@/components/tools/bcrypt/bcrypt-tool';
import { renderIntegration } from '@/tests/integration/test-utils';

const bcryptHashPattern = /^\$2[aby]\$04\$[./A-Za-z0-9]{53}$/;

describe('Bcrypt tool flow', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('generates a bcrypt hash with the selected rounds and keeps salted-output guidance visible', async () => {
    const { user, findByText, getByLabelText, getByRole, getByText } = renderIntegration(<BcryptTool />);

    await user.type(getByLabelText(/Plain text/i), 'correct horse battery staple');
    await user.clear(getByLabelText(/Rounds/i));
    await user.type(getByLabelText(/Rounds/i), '4');
    await user.click(getByRole('button', { name: /Generate bcrypt hash/i }));

    expect(await findByText(/Bcrypt hash generated with 4 rounds/i)).toBeInTheDocument();
    expect(getByText(/Fresh salts change the output/i)).toBeInTheDocument();
    expect(getByText((content) => bcryptHashPattern.test(content))).toBeInTheDocument();
    expect(getByRole('button', { name: /Copy result/i })).toBeInTheDocument();
  });

  it('shows field validation errors without producing a new hash', async () => {
    const { user, getByLabelText, getByRole, getByText, queryByText } = renderIntegration(<BcryptTool />);

    await user.type(getByLabelText(/Plain text/i), '   ');
    await user.clear(getByLabelText(/Rounds/i));
    await user.type(getByLabelText(/Rounds/i), '21');
    await user.click(getByRole('button', { name: /Generate bcrypt hash/i }));

    expect(getByText(/Plain text is required/i)).toBeInTheDocument();
    expect(getByText(/Rounds must be between 1 and 20/i)).toBeInTheDocument();
    expect(queryByText((content) => content.startsWith('$2'))).not.toBeInTheDocument();
  });

  it('copies the latest bcrypt hash and shows success feedback', async () => {
    const copySpy = vi.spyOn(clipboard, 'copyTextToClipboard').mockResolvedValue({ ok: true });
    const { user, getByLabelText, getByRole, getByText } = renderIntegration(<BcryptTool />);

    await user.type(getByLabelText(/Plain text/i), 'correct horse battery staple');
    await user.clear(getByLabelText(/Rounds/i));
    await user.type(getByLabelText(/Rounds/i), '4');
    await user.click(getByRole('button', { name: /Generate bcrypt hash/i }));
    await user.click(getByRole('button', { name: /Copy result/i }));

    expect(copySpy).toHaveBeenCalledWith(expect.stringMatching(bcryptHashPattern));
    expect(getByText(/Copied to clipboard/i)).toBeInTheDocument();
  });

  it('renders the direct route with the shared tool shell navigation', () => {
    const { getByRole } = renderIntegration(<BcryptPage />);

    expect(getByRole('heading', { name: /Bcrypt Hash Generator/i })).toBeInTheDocument();
    expect(getByRole('link', { name: /Back to catalog/i })).toHaveAttribute('href', '/');
    expect(getByRole('link', { name: /Next: Cron/i })).toHaveAttribute('href', '/tools/cron');
  });
});
