import * as clipboard from '@/lib/utils/clipboard';
import { CronTool } from '@/components/tools/cron/cron-tool';
import { renderIntegration } from '@/tests/integration/test-utils';

describe('Cron tool flow', () => {
  it('builds a cron expression and readable summary from guided choices', async () => {
    const { user, getAllByText, getByLabelText, getByRole, getByText } = renderIntegration(<CronTool />);

    await user.selectOptions(getByLabelText(/^Seconds/i), '0');
    await user.selectOptions(getByLabelText(/^Minutes/i), '*/15');
    await user.selectOptions(getByLabelText(/^Hours/i), '*');
    await user.selectOptions(getByLabelText(/^Day of month/i), '*');
    await user.selectOptions(getByLabelText(/^Month/i), '*');
    await user.selectOptions(getByLabelText(/^Day of week/i), '*');

    await user.click(getByRole('button', { name: /Generate cron expression/i }));

    expect(getByText(/Cron expression generated/i)).toBeInTheDocument();
    expect(getByText('0 */15 * * * *')).toBeInTheDocument();
    expect(getAllByText(/Every 15 minutes/i).length).toBeGreaterThan(0);
  });

  it('clarifies that wildcard seconds and minutes keep a fixed hour running continuously', async () => {
    const { user, getByLabelText, getByRole, getByText } = renderIntegration(<CronTool />);

    await user.selectOptions(getByLabelText(/^Seconds/i), '*');
    await user.selectOptions(getByLabelText(/^Minutes/i), '*');
    await user.selectOptions(getByLabelText(/^Hours/i), '12');
    await user.selectOptions(getByLabelText(/^Day of month/i), '*');
    await user.selectOptions(getByLabelText(/^Month/i), '*');
    await user.selectOptions(getByLabelText(/^Day of week/i), '*');

    await user.click(getByRole('button', { name: /Generate cron expression/i }));

    expect(getByText('* * 12 * * *')).toBeInTheDocument();
    expect(getByText('Every second during the 12:00 PM hour every day')).toBeInTheDocument();
  });

  it('shows actionable guidance for conflicting day selectors', async () => {
    const { user, getAllByText, getByLabelText, getByRole } = renderIntegration(<CronTool />);

    await user.selectOptions(getByLabelText(/^Seconds/i), '0');
    await user.selectOptions(getByLabelText(/^Minutes/i), '0');
    await user.selectOptions(getByLabelText(/^Hours/i), '9');
    await user.selectOptions(getByLabelText(/^Day of month/i), '15');
    await user.selectOptions(getByLabelText(/^Month/i), '*');
    await user.selectOptions(getByLabelText(/^Day of week/i), '1-5');

    await user.click(getByRole('button', { name: /Generate cron expression/i }));

    expect(getAllByText(/Choose either day of month or day of week/i).length).toBeGreaterThan(0);
  });

  it('copies the generated cron expression and shows success feedback', async () => {
    const copySpy = vi.spyOn(clipboard, 'copyTextToClipboard').mockResolvedValue({ ok: true });

    const { user, getByLabelText, getByRole, getByText } = renderIntegration(<CronTool />);

    await user.selectOptions(getByLabelText(/^Seconds/i), '0');
    await user.selectOptions(getByLabelText(/^Minutes/i), '*/15');
    await user.selectOptions(getByLabelText(/^Hours/i), '*');
    await user.selectOptions(getByLabelText(/^Day of month/i), '*');
    await user.selectOptions(getByLabelText(/^Month/i), '*');
    await user.selectOptions(getByLabelText(/^Day of week/i), '*');

    await user.click(getByRole('button', { name: /Generate cron expression/i }));
    await user.click(getByRole('button', { name: /Copy result/i }));

    expect(copySpy).toHaveBeenCalledWith('0 */15 * * * *');
    expect(getByText(/Copied to clipboard/i)).toBeInTheDocument();
  });
});
