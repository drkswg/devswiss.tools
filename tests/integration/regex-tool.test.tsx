import RegexPage from '@/app/tools/regex/page';
import { RegexTool } from '@/components/tools/regex/regex-tool';
import { renderIntegration } from '@/tests/integration/test-utils';
import { fireEvent, within } from '@testing-library/react';

describe('Regex tool flow', () => {
  it('shows the regex workflow with separate explanation and match sections', () => {
    const { getByRole, getByText } = renderIntegration(<RegexTool />);

    expect(getByRole('region', { name: /Regex tester workflow/i })).toBeInTheDocument();
    expect(getByRole('region', { name: /Regex explanation/i })).toBeInTheDocument();
    expect(getByRole('region', { name: /Regex match details/i })).toBeInTheDocument();
    expect(getByText(/Execution stays honest about flavor limits/i)).toBeInTheDocument();
  });

  it('analyzes a Java regex and renders capture details', async () => {
    const { user, getByLabelText, getByRole, getByText } = renderIntegration(<RegexTool />);

    fireEvent.change(getByLabelText(/^Regex expression/i), {
      target: { value: '(?i)^([a-z]{3})-(\\d+)$' }
    });
    fireEvent.change(getByLabelText(/^Sample text/i), {
      target: { value: 'ABC-42' }
    });
    await user.click(getByRole('button', { name: /Analyze regex/i }));

    expect(getByText(/Pattern explained and matched against the sample text for Java/i)).toBeInTheDocument();
    expect(getByText(/Group 1:/i)).toBeInTheDocument();
    expect(getByText('ABC')).toBeInTheDocument();
    expect(getByText('42')).toBeInTheDocument();
  });

  it('analyzes a PL/SQL regex and shows translated execution details', async () => {
    const { user, getByLabelText, getByRole, getByText } = renderIntegration(<RegexTool />);

    await user.selectOptions(getByLabelText(/^Regex flavor/i), 'plsql');
    fireEvent.change(getByLabelText(/^Regex expression/i), {
      target: { value: '([[:digit:]]{2})/[[:digit:]]{2}' }
    });
    fireEvent.change(getByLabelText(/^Sample text/i), {
      target: { value: 'ID 12/34 OK' }
    });
    await user.click(getByRole('button', { name: /Analyze regex/i }));

    expect(getByText(/Pattern explained and matched against the sample text for PL\/SQL/i)).toBeInTheDocument();
    expect(getByText('([0-9]{2})/[0-9]{2}')).toBeInTheDocument();
    expect(getByText('12/34')).toBeInTheDocument();
  });

  it('replaces match details with unsupported-pattern feedback when execution is not safe', async () => {
    const { user, getByLabelText, getByRole } = renderIntegration(<RegexTool />);

    fireEvent.change(getByLabelText(/^Regex expression/i), {
      target: { value: '^([a-z]+)$' }
    });
    fireEvent.change(getByLabelText(/^Sample text/i), {
      target: { value: 'abc' }
    });
    await user.click(getByRole('button', { name: /Analyze regex/i }));
    expect(within(getByRole('region', { name: /Regex match details/i })).getByText(/Match 1/i)).toBeInTheDocument();

    fireEvent.change(getByLabelText(/^Regex expression/i), {
      target: { value: '(?<=ID-)\\d++' }
    });
    await user.click(getByRole('button', { name: /Analyze regex/i }));

    const matchRegion = getByRole('region', { name: /Regex match details/i });

    expect(within(matchRegion).getAllByText(/Lookbehind assertions are explained/i)).toHaveLength(2);
    expect(within(matchRegion).queryByText(/Match 1/i)).not.toBeInTheDocument();
  });

  it('renders the direct route with the shared tool shell navigation', () => {
    const { getByRole } = renderIntegration(<RegexPage />);

    expect(getByRole('heading', { name: /Regex Tester/i })).toBeInTheDocument();
    expect(getByRole('link', { name: /Back to catalog/i })).toHaveAttribute('href', '/');
    expect(getByRole('link', { name: /Next: XML/i })).toHaveAttribute('href', '/tools/xml');
  });
});
