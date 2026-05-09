import { within } from '@testing-library/react';

import HomePage from '@/app/page';
import { getAllTools } from '@/lib/tools/registry';
import { renderIntegration } from '@/tests/integration/test-utils';

describe('devswiss.tools homepage catalog', () => {
  it('renders the hero and all registered tool tiles', () => {
    const { container, getByRole } = renderIntegration(<HomePage />);

    expect(
      getByRole('heading', {
        name: /Your data stays in the browser/i
      })
    ).toBeInTheDocument();
    const catalog = container.querySelector('#tool-catalog');
    expect(catalog).toBeInTheDocument();
    expect(within(catalog as HTMLElement).getAllByRole('link', { name: /^Open /i })).toHaveLength(
      getAllTools().length
    );
    expect(getByRole('link', { name: /Open UUID Generator & Validator/i })).toHaveAttribute(
      'href',
      '/tools/uuid'
    );
    expect(getByRole('link', { name: /Open Cron Expression Generator/i })).toHaveAttribute(
      'href',
      '/tools/cron'
    );
    expect(getByRole('link', { name: /Open XML Formatter/i })).toHaveAttribute('href', '/tools/xml');

    const jsonLd = container.querySelector('script[type="application/ld+json"]');
    expect(jsonLd).toHaveAttribute('id', 'homepage-structured-data');
    expect(jsonLd?.textContent).toContain('"@type":"WebSite"');
    expect(jsonLd?.textContent).toContain('"@type":"ItemList"');
  });
});
