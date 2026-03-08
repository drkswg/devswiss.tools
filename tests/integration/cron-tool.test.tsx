import * as clipboard from '@/lib/utils/clipboard';
import { CronTool } from '@/components/tools/cron/cron-tool';
import { renderIntegration } from '@/tests/integration/test-utils';
import { within } from '@testing-library/react';

describe('Cron tool flow', () => {
  it('builds a six-field cron expression and readable summary from guided choices', async () => {
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

  it('builds a five-field cron expression when seconds are disabled', async () => {
    const { user, queryByLabelText, getAllByText, getByLabelText, getByRole, getByText } = renderIntegration(
      <CronTool />
    );

    await user.selectOptions(getByLabelText(/^Expression format/i), '5');

    expect(queryByLabelText(/^Seconds/i)).not.toBeInTheDocument();

    await user.selectOptions(getByLabelText(/^Minutes/i), '*/15');
    await user.selectOptions(getByLabelText(/^Hours/i), '*');
    await user.selectOptions(getByLabelText(/^Day of month/i), '*');
    await user.selectOptions(getByLabelText(/^Month/i), '*');
    await user.selectOptions(getByLabelText(/^Day of week/i), '*');

    await user.click(getByRole('button', { name: /Generate cron expression/i }));

    expect(getByText(/Cron expression generated/i)).toBeInTheDocument();
    expect(getByText('*/15 * * * *')).toBeInTheDocument();
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

  it('shows both the builder and explainer workflows on the cron page', () => {
    const { getByRole, getByText } = renderIntegration(<CronTool />);

    const builderWorkflow = getByRole('region', { name: /Cron builder workflow/i });
    const explainerWorkflow = getByRole('region', { name: /Cron explainer workflow/i });

    expect(within(builderWorkflow).getByRole('heading', { name: /Build a 5-field or 6-field cron expression/i })).toBeInTheDocument();
    expect(within(explainerWorkflow).getByRole('heading', { name: /Explain a 5-field or 6-field cron expression/i })).toBeInTheDocument();
    expect(getByText(/Paste an existing cron expression/i)).toBeInTheDocument();
  });

  it('explains a pasted cron expression without breaking builder output', async () => {
    const { user, getAllByText, getByLabelText, getByRole, getByText } = renderIntegration(<CronTool />);

    await user.type(getByRole('textbox', { name: /Cron expression/i }), '0 */15 * * * *');
    await user.click(getByRole('button', { name: /Explain cron expression/i }));

    expect(getByText(/Cron expression explained/i)).toBeInTheDocument();
    expect(within(getByRole('region', { name: /Normalized cron expression/i })).getByText('0 */15 * * * *')).toBeInTheDocument();
    expect(getAllByText(/Every 15 minutes/i).length).toBeGreaterThan(0);

    await user.selectOptions(getByLabelText(/^Seconds/i), '0');
    await user.selectOptions(getByLabelText(/^Minutes/i), '0');
    await user.selectOptions(getByLabelText(/^Hours/i), '9');
    await user.selectOptions(getByLabelText(/^Day of month/i), '*');
    await user.selectOptions(getByLabelText(/^Month/i), '*');
    await user.selectOptions(getByLabelText(/^Day of week/i), '1-5');
    await user.click(getByRole('button', { name: /Generate cron expression/i }));

    expect(getByText(/Cron expression generated/i)).toBeInTheDocument();
    expect(getByText('0 0 9 * * 1-5')).toBeInTheDocument();
  });

  it('shows validation feedback when the explainer input is empty', async () => {
    const { user, getAllByText, getByRole } = renderIntegration(<CronTool />);

    await user.click(getByRole('button', { name: /Explain cron expression/i }));

    expect(getAllByText(/Cron expression is required/i).length).toBeGreaterThan(0);
  });
});
