import HomePage from '@/app/page';
import { renderIntegration } from '@/tests/integration/test-utils';

describe('DevTools homepage catalog', () => {
  it('renders the hero and all registered tool tiles', () => {
    const { getByRole, getAllByRole } = renderIntegration(<HomePage />);

    expect(
      getByRole('heading', {
        name: /DevTools keeps common developer utilities fast, local, and readable/i
      })
    ).toBeInTheDocument();
    expect(
      getAllByRole('link', {
        name: /^Open (UUID Generator & Validator|Base64 Encoder & Decoder|Hash Generator|Cron Expression Generator)$/i
      })
    ).toHaveLength(4);
    expect(getByRole('link', { name: /Open UUID Generator & Validator/i })).toHaveAttribute(
      'href',
      '/tools/uuid'
    );
    expect(getByRole('link', { name: /Open Cron Expression Generator/i })).toHaveAttribute(
      'href',
      '/tools/cron'
    );
  });
});
