import Base64Page from '@/app/tools/base64/page';
import BcryptPage from '@/app/tools/bcrypt/page';
import CronPage from '@/app/tools/cron/page';
import HashPage from '@/app/tools/hash/page';
import UuidPage from '@/app/tools/uuid/page';
import XmlPage from '@/app/tools/xml/page';
import { getRequiredToolBySlug } from '@/lib/tools/registry';
import { renderIntegration } from '@/tests/integration/test-utils';

const toolPages = [
  {
    helperText:
      'Generate fresh UUIDs or validate pasted values, including versions 1, 3, 4, 5, and 7.',
    nextHref: '/tools/base64',
    nextLabel: 'Next: Base64',
    page: UuidPage,
    tool: getRequiredToolBySlug('uuid')
  },
  {
    helperText:
      'Encode or decode text safely, including Unicode input. Invalid Base64 stays visible and returns clear guidance.',
    nextHref: '/tools/hash',
    nextLabel: 'Next: Hash',
    page: Base64Page,
    tool: getRequiredToolBySlug('base64')
  },
  {
    helperText: 'Generate lowercase hexadecimal hashes locally. MD5 and SHA-1 remain visible as legacy options.',
    nextHref: '/tools/bcrypt',
    nextLabel: 'Next: Bcrypt',
    page: HashPage,
    tool: getRequiredToolBySlug('hash')
  },
  {
    helperText:
      'Bcrypt adds a fresh salt each time, so repeated runs can produce different valid hashes.',
    nextHref: '/tools/cron',
    nextLabel: 'Next: Cron',
    page: BcryptPage,
    tool: getRequiredToolBySlug('bcrypt')
  },
  {
    helperText:
      'Generate either a 5-field cron expression or a 6-field expression with seconds. A fixed hour with "*" minutes, and "*" seconds in 6-field mode, means the whole hour. Single daily runs need explicit time values such as "0 0 * * *" or "0 0 0 * * *".',
    nextHref: '/tools/xml',
    nextLabel: 'Next: XML',
    page: CronPage,
    tool: getRequiredToolBySlug('cron')
  },
  {
    helperText:
      'Beautify XML with configurable indentation, minify it, convert it to JSON, and move XML in or out with local file actions.',
    nextHref: '/tools/uuid',
    nextLabel: 'Next: UUID',
    page: XmlPage,
    tool: getRequiredToolBySlug('xml')
  }
] as const;

describe('Tool page header', () => {
  it.each(toolPages)(
    'shows a compact summary header for $tool.name',
    ({ helperText, nextHref, nextLabel, page: Page, tool }) => {
      const { getByRole, queryByText } = renderIntegration(<Page />);

      expect(getByRole('heading', { name: tool.name })).toBeInTheDocument();
      expect(getByRole('link', { name: /Back to catalog/i })).toHaveAttribute('href', '/');
      expect(getByRole('link', { name: nextLabel })).toHaveAttribute('href', nextHref);
      expect(queryByText(helperText)).not.toBeInTheDocument();
      expect(queryByText(tool.description)).toBeInTheDocument();
    }
  );
});
