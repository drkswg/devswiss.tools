import * as clipboard from '@/lib/utils/clipboard';
import * as fileUtils from '@/lib/utils/file';
import { XmlTool } from '@/components/tools/xml/xml-tool';
import { renderIntegration } from '@/tests/integration/test-utils';

const compactXml = '<root><item id="1">alpha</item><item id="2"><name>beta</name></item></root>';

describe('XML tool flow', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('formats XML into the output pane without overwriting the source', async () => {
    const { user, getByLabelText, getByRole, getByTestId, getByText } = renderIntegration(<XmlTool />);

    await user.type(getByLabelText(/Original XML/i), compactXml);
    await user.selectOptions(getByLabelText(/Format indentation/i), '4');
    await user.click(getByRole('button', { name: /Format XML/i }));

    expect(getByText(/XML formatted with 4-space indentation/i)).toBeInTheDocument();
    expect(getByLabelText(/Original XML/i)).toHaveValue(compactXml);
    expect(getByLabelText(/Transformed output/i)).toHaveValue(
      ['<root>', '    <item id="1">alpha</item>', '    <item id="2">', '        <name>beta</name>', '    </item>', '</root>'].join(
        '\n'
      )
    );
    expect(getByTestId('xml-source-highlight')).toHaveAttribute('data-highlight-language', 'xml');
    expect(getByTestId('xml-source-highlight').innerHTML).toContain('tokenTagName');
    expect(getByTestId('xml-output-highlight')).toHaveAttribute('data-highlight-language', 'xml');
    expect(getByTestId('xml-output-highlight').innerHTML).toContain('tokenAttributeName');
  });

  it('converts XML to JSON and hides XML download for JSON output', async () => {
    const { user, getByLabelText, getByRole, getByTestId, queryByRole } = renderIntegration(<XmlTool />);

    await user.type(getByLabelText(/Original XML/i), compactXml);
    await user.click(getByRole('button', { name: /XML to JSON/i }));

    expect(getByLabelText(/Transformed output/i)).toHaveValue(`{
  "root": {
    "item": [
      {
        "@attributes": {
          "id": "1"
        },
        "#text": "alpha"
      },
      {
        "@attributes": {
          "id": "2"
        },
        "name": "beta"
      }
    ]
  }
}`);
    expect(queryByRole('button', { name: /Download XML/i })).not.toBeInTheDocument();
    expect(getByTestId('xml-output-highlight')).toHaveAttribute('data-highlight-language', 'json');
    expect(getByTestId('xml-output-highlight').innerHTML).toContain('tokenKey');
    expect(getByTestId('xml-output-highlight').innerHTML).toContain('tokenString');
  });

  it('copies source and transformed output with feedback', async () => {
    const copySpy = vi.spyOn(clipboard, 'copyTextToClipboard').mockResolvedValue({ ok: true });
    const { user, getByLabelText, getByRole, getByText } = renderIntegration(<XmlTool />);

    await user.type(getByLabelText(/Original XML/i), compactXml);
    await user.click(getByRole('button', { name: /Copy source/i }));
    await user.click(getByRole('button', { name: /Format XML/i }));
    await user.click(getByRole('button', { name: /Copy output/i }));

    expect(copySpy).toHaveBeenNthCalledWith(1, compactXml);
    expect(copySpy).toHaveBeenNthCalledWith(
      2,
      ['<root>', '  <item id="1">alpha</item>', '  <item id="2">', '    <name>beta</name>', '  </item>', '</root>'].join('\n')
    );
    expect(getByText(/Copied source XML/i)).toBeInTheDocument();
    expect(getByText(/Copied transformed output/i)).toBeInTheDocument();
  });

  it('loads XML from a file and downloads formatted output', async () => {
    vi.spyOn(fileUtils, 'readTextFile').mockResolvedValue(compactXml);
    const downloadSpy = vi.spyOn(fileUtils, 'downloadTextFile').mockReturnValue({ ok: true });

    const { container, user, getByRole, getByText } = renderIntegration(<XmlTool />);
    const input = container.querySelector('input[type="file"]');

    expect(input).not.toBeNull();

    await user.upload(input as HTMLInputElement, new File(['ignored'], 'example.xml', { type: 'application/xml' }));
    await user.click(getByRole('button', { name: /Format XML/i }));
    await user.click(getByRole('button', { name: /Download XML/i }));

    expect(getByText(/XML file loaded/i)).toBeInTheDocument();
    expect(downloadSpy).toHaveBeenCalledWith(
      'formatted.xml',
      ['<root>', '  <item id="1">alpha</item>', '  <item id="2">', '    <name>beta</name>', '  </item>', '</root>'].join('\n')
    );
    expect(getByText(/Downloaded XML result/i)).toBeInTheDocument();
  });

  it('shows validation feedback for malformed XML without removing the last valid output', async () => {
    const { user, getAllByText, getByLabelText, getByRole } = renderIntegration(<XmlTool />);

    await user.type(getByLabelText(/Original XML/i), compactXml);
    await user.click(getByRole('button', { name: /Format XML/i }));

    expect(getByLabelText(/Transformed output/i)).toHaveValue(
      ['<root>', '  <item id="1">alpha</item>', '  <item id="2">', '    <name>beta</name>', '  </item>', '</root>'].join('\n')
    );

    await user.clear(getByLabelText(/Original XML/i));
    await user.type(getByLabelText(/Original XML/i), '<root><item></root>');
    await user.click(getByRole('button', { name: /Format XML/i }));

    expect(getAllByText(/XML could not be parsed/i).length).toBeGreaterThan(0);
    expect(getByLabelText(/Transformed output/i)).toHaveValue(
      ['<root>', '  <item id="1">alpha</item>', '  <item id="2">', '    <name>beta</name>', '  </item>', '</root>'].join('\n')
    );
  });
});
