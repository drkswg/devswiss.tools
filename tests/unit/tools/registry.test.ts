import { createToolDefinition } from '@/lib/tools/create-tool-definition';
import { buildToolMetadata } from '@/lib/tools/metadata';
import { createToolRegistry, getRequiredToolBySlug } from '@/lib/tools/registry';

describe('Tool registry invariants', () => {
  function createFixture(overrides: Partial<ReturnType<typeof createToolDefinition>> = {}) {
    return createToolDefinition({
      accentToken: 'blue',
      category: 'Fixture',
      description: 'Fixture tool for registry tests.',
      iconKey: 'wrench',
      name: 'Fixture Tool',
      order: 0,
      slug: 'fixture-tool',
      supportsCopy: false,
      ...overrides
    });
  }

  it('sorts registry entries by order', () => {
    const definitions = [
      createFixture({ id: 'second-tool', slug: 'second-tool', order: 2 }),
      createFixture({ id: 'first-tool', slug: 'first-tool', order: 1 })
    ];

    const registry = createToolRegistry(definitions);

    expect(registry.map((tool) => tool.slug)).toEqual(['first-tool', 'second-tool']);
  });

  it('throws when tool ids collide', () => {
    const definitions = [
      createFixture({ id: 'same-id', slug: 'same-id', order: 1 }),
      createFixture({ id: 'same-id', slug: 'different-slug', order: 2 })
    ];

    expect(() => createToolRegistry(definitions)).toThrowError(/Duplicate tool id: same-id/);
  });

  it('throws when tool slugs collide', () => {
    const definitions = [
      createFixture({ id: 'first-id', slug: 'same-slug', order: 1 }),
      createFixture({ id: 'second-id', slug: 'same-slug', order: 2 })
    ];

    expect(() => createToolRegistry(definitions)).toThrowError(/Duplicate tool slug: same-slug/);
  });

  it('throws when tool route paths collide', () => {
    const definitions = [
      createFixture({ id: 'first-route', slug: 'first-route', order: 1, routePath: '/tools/shared-path' }),
      createFixture({ id: 'second-route', slug: 'second-route', order: 2, routePath: '/tools/shared-path' })
    ];

    expect(() => createToolRegistry(definitions)).toThrowError(
      /Duplicate tool route path: \/tools\/shared-path/
    );
  });

  it('includes the bcrypt tool in the registry with the expected route and copy support', () => {
    const bcryptTool = getRequiredToolBySlug('bcrypt');

    expect(bcryptTool.routePath).toBe('/tools/bcrypt');
    expect(bcryptTool.supportsCopy).toBe(true);
    expect(bcryptTool.order).toBe(3);
  });

  it('includes the timestamp tool in the registry with the expected route and copy support', () => {
    const timestampTool = getRequiredToolBySlug('timestamp');

    expect(timestampTool.routePath).toBe('/tools/timestamp');
    expect(timestampTool.supportsCopy).toBe(true);
    expect(timestampTool.order).toBe(5);
  });

  it('includes the regex tool in the registry with the expected route and order', () => {
    const regexTool = getRequiredToolBySlug('regex');

    expect(regexTool.routePath).toBe('/tools/regex');
    expect(regexTool.supportsCopy).toBe(false);
    expect(regexTool.order).toBe(6);
  });
});

describe('Tool metadata derivation', () => {
  it('normalizes missing leading slash and trailing slash route paths', () => {
    const metadata = buildToolMetadata({
      name: 'JWT Decoder',
      description: 'Decode JWT payloads quickly.',
      routePath: 'tools/jwt-decoder/',
      slug: 'jwt-decoder'
    });

    expect(metadata.alternates?.canonical).toBe('/tools/jwt-decoder');
    expect(metadata.openGraph?.url).toBe('/tools/jwt-decoder');
  });

  it('falls back to a slug-based tool route when route path is not under /tools/', () => {
    const metadata = buildToolMetadata({
      name: 'JWT Decoder',
      description: 'Decode JWT payloads quickly.',
      routePath: '/labs/jwt-decoder',
      slug: 'jwt-decoder'
    });

    expect(metadata.alternates?.canonical).toBe('/tools/jwt-decoder');
    expect(metadata.openGraph?.url).toBe('/tools/jwt-decoder');
  });
});
