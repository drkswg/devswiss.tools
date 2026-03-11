import { transformXml } from '@/lib/tools/processors/xml';

const compactXml = '<root><item id="1">alpha</item><item id="2"><name>beta</name></item></root>';

describe('XML processor', () => {
  it('formats XML using the selected indentation width', () => {
    const result = transformXml({
      mode: 'format',
      indentSize: 4,
      inputValue: compactXml
    });

    expect(result.state).toBe('valid');
    expect(result.outputKind).toBe('xml');
    expect(result.value).toBe(
      ['<root>', '    <item id="1">alpha</item>', '    <item id="2">', '        <name>beta</name>', '    </item>', '</root>'].join(
        '\n'
      )
    );
  });

  it('minifies XML into a compact single-line value', () => {
    const result = transformXml({
      mode: 'minify',
      indentSize: 2,
      inputValue: `
        <root>
          <item id="1">alpha</item>
          <item id="2">
            <name>beta</name>
          </item>
        </root>
      `
    });

    expect(result.state).toBe('valid');
    expect(result.outputKind).toBe('xml');
    expect(result.value).toBe(compactXml);
  });

  it('converts XML to JSON with deterministic attribute and array handling', () => {
    const result = transformXml({
      mode: 'convert',
      indentSize: 2,
      inputValue: compactXml
    });

    expect(result.state).toBe('valid');
    expect(result.outputKind).toBe('json');
    expect(JSON.parse(result.value ?? '')).toEqual({
      root: {
        item: [
          {
            '@attributes': {
              id: '1'
            },
            '#text': 'alpha'
          },
          {
            '@attributes': {
              id: '2'
            },
            name: 'beta'
          }
        ]
      }
    });
  });

  it('rejects malformed XML and returns an input error', () => {
    const result = transformXml({
      mode: 'format',
      indentSize: 2,
      inputValue: '<root><item></root>'
    });

    expect(result.state).toBe('invalid');
    expect(result.fieldErrors?.inputValue?.[0]).toContain('XML could not be parsed');
  });
});
