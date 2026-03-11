import HomePage from '@/app/page';
import { renderIntegration } from '@/tests/integration/test-utils';

describe('devswiss.tools homepage catalog', () => {
  it('renders the hero and all registered tool tiles', () => {
    const { getByRole, getAllByRole } = renderIntegration(<HomePage />);

    expect(
      getByRole('heading', {
        name: /Your data stays in the browser/i
      })
    ).toBeInTheDocument();
    expect(
      getAllByRole('link', {
        name: /^Open (UUID Generator & Validator|Base64 Encoder & Decoder|Hash Generator|Cron Expression Generator|XML Formatter)$/i
      })
    ).toHaveLength(5);
    expect(getByRole('link', { name: /Open UUID Generator & Validator/i })).toHaveAttribute(
      'href',
      '/tools/uuid'
    );
    expect(getByRole('link', { name: /Open Cron Expression Generator/i })).toHaveAttribute(
      'href',
      '/tools/cron'
    );
    expect(getByRole('link', { name: /Open XML Formatter/i })).toHaveAttribute('href', '/tools/xml');
  });
});
