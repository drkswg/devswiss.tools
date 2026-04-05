import * as clipboard from '@/lib/utils/clipboard';
import TimestampPage from '@/app/tools/timestamp/page';
import { TimestampTool } from '@/components/tools/timestamp/timestamp-tool';
import { renderIntegration } from '@/tests/integration/test-utils';
import { fireEvent } from '@testing-library/react';
import { within } from '@testing-library/react';

describe('Timestamp tool flow', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows both explain and generate workflows together', () => {
    const { getByRole, getByText } = renderIntegration(<TimestampTool />);

    const explainWorkflow = getByRole('region', { name: /Timestamp explainer workflow/i });
    const generateWorkflow = getByRole('region', { name: /Timestamp generator workflow/i });

    expect(within(explainWorkflow).getByRole('heading', { name: /Resolve Unix timestamps into UTC date and time/i })).toBeInTheDocument();
    expect(within(generateWorkflow).getByRole('heading', { name: /Convert date and time values back into Unix timestamps/i })).toBeInTheDocument();
    expect(getByText(/Auto-detect stays visible/i)).toBeInTheDocument();
  });

  it('explains a seconds timestamp and keeps the resolved UTC details visible', async () => {
    const { user, getByLabelText, getByRole, getByText } = renderIntegration(<TimestampTool />);

    await user.type(getByLabelText(/^Unix timestamp/i), '1712297105');
    await user.click(getByRole('button', { name: /Explain timestamp/i }));

    expect(getByText(/Timestamp explained as seconds/i)).toBeInTheDocument();
    expect(within(getByRole('region', { name: /Normalized timestamp/i })).getByText('1712297105')).toBeInTheDocument();
    expect(getByText('2024-04-05 06:05:05 UTC')).toBeInTheDocument();
    expect(getByText('2024-04-05T06:05:05.000Z')).toBeInTheDocument();
  });

  it('generates a UTC seconds timestamp and copies the latest valid result', async () => {
    const copySpy = vi.spyOn(clipboard, 'copyTextToClipboard').mockResolvedValue({ ok: true });
    const { user, getByLabelText, getByRole, getByText } = renderIntegration(<TimestampTool />);

    fireEvent.change(getByLabelText(/^Date and time/i), {
      target: { value: '2024-04-05T10:05' }
    });
    await user.selectOptions(getByLabelText(/^Timezone/i), 'utc');
    await user.selectOptions(getByLabelText(/^Output unit/i), 'seconds');
    await user.click(getByRole('button', { name: /Generate timestamp/i }));
    await user.click(getByRole('button', { name: /Copy result/i }));

    const generatedResult = getByRole('region', { name: /^Generated timestamp$/i });

    expect(getByText(/Timestamp generated in seconds/i)).toBeInTheDocument();
    expect(within(generatedResult).getByText('1712311500')).toBeInTheDocument();
    expect(copySpy).toHaveBeenCalledWith('1712311500');
    expect(getByText(/Copied to clipboard/i)).toBeInTheDocument();
  });

  it('shows validation feedback without producing a new explanation result', async () => {
    const { user, getByRole, getByText, queryByText } = renderIntegration(<TimestampTool />);

    await user.click(getByRole('button', { name: /Explain timestamp/i }));

    expect(getByText(/Timestamp is required/i)).toBeInTheDocument();
    expect(queryByText(/^1712297105$/)).not.toBeInTheDocument();
  });

  it('renders the direct route with the shared tool shell navigation', () => {
    const { getByRole } = renderIntegration(<TimestampPage />);

    expect(getByRole('heading', { name: /Timestamp Converter/i })).toBeInTheDocument();
    expect(getByRole('link', { name: /Back to catalog/i })).toHaveAttribute('href', '/');
    expect(getByRole('link', { name: /Next: XML/i })).toHaveAttribute('href', '/tools/xml');
  });
});
