import { ToolCatalog } from '@/components/marketing/tool-catalog';
import { createToolDefinition } from '@/lib/tools/create-tool-definition';
import { createToolRegistry, getAllTools } from '@/lib/tools/registry';
import { renderIntegration } from '@/tests/integration/test-utils';

describe('Registry-driven tool catalog', () => {
  it('renders a newly added tool fixture with the same tile and navigation pattern', () => {
    const jsonTool = createToolDefinition({
      accentToken: 'blue',
      category: 'Developer Utilities',
      description: 'Format and validate JSON documents in the browser.',
      iconKey: 'binary',
      keywords: ['json', 'formatter'],
      name: 'JSON Formatter',
      order: 4,
      slug: 'json-formatter',
      supportsCopy: true
    });
    const extendedRegistry = createToolRegistry([...getAllTools(), jsonTool]);

    const { getAllByRole, getByRole } = renderIntegration(<ToolCatalog tools={extendedRegistry} />);
    const tileLinks = getAllByRole('link', { name: /^Open /i });

    expect(tileLinks).toHaveLength(extendedRegistry.length);
    expect(getByRole('link', { name: /Open JSON Formatter/i })).toHaveAttribute(
      'href',
      '/tools/json-formatter'
    );
    expect(tileLinks.map((tile) => tile.getAttribute('href'))).toContain('/tools/json-formatter');
  });
});
