# xml-formatter Specification

## Purpose
TBD - created by archiving change add-xml-formatter-tool. Update Purpose after archive.
## Requirements
### Requirement: XML formatter provides a two-pane workspace
The XML formatter SHALL present an original-input pane and a derived-output pane on the same tool page so users can compare source XML with the latest transformed result without overwriting the source content.

#### Scenario: User opens the XML formatter page
- **WHEN** the user navigates to the XML formatter tool
- **THEN** the page shows a source XML input pane and a separate output pane for transformed content

#### Scenario: Transform keeps the original source visible
- **WHEN** the user formats, minifies, or converts valid XML
- **THEN** the source pane keeps the original XML content
- **AND** the output pane shows only the transformed result for the selected action

### Requirement: XML formatter supports beautify, minify, and XML-to-JSON actions
The XML formatter SHALL allow users to beautify XML with 2-space, 3-space, or 4-space indentation, minify valid XML, and convert valid XML into a deterministic JSON representation that preserves element names, attributes, text nodes, and repeated sibling elements.

#### Scenario: User reviews indentation options
- **WHEN** the user views the XML formatter controls
- **THEN** the tool offers indentation widths of 2 spaces, 3 spaces, and 4 spaces for beautified XML output

#### Scenario: User beautifies XML with selected indentation
- **WHEN** the user selects an indentation width and runs the format action on valid XML
- **THEN** the output pane shows formatted XML using the selected indentation width

#### Scenario: User minifies valid XML
- **WHEN** the user runs the minify action on valid XML
- **THEN** the output pane shows compact XML with non-essential formatting whitespace removed

#### Scenario: User converts valid XML to JSON
- **WHEN** the user runs the XML-to-JSON action on valid XML
- **THEN** the output pane shows JSON text that preserves the XML document structure according to the tool's documented conversion rules

### Requirement: XML formatter supports import, copy, and XML export workflows
The XML formatter SHALL let users upload an XML file into the source pane, copy content from either pane, and download the current XML output as an `.xml` file when the latest result is formatted or minified XML.

#### Scenario: User uploads an XML file
- **WHEN** the user selects a local XML file for import
- **THEN** the tool loads that file's contents into the source XML pane

#### Scenario: User copies source XML
- **WHEN** the user activates copy for the source pane while it contains XML content
- **THEN** the tool copies the source pane content to the clipboard or shows that clipboard access is unavailable

#### Scenario: User copies transformed output
- **WHEN** the user activates copy for the output pane while it contains transformed content
- **THEN** the tool copies the output pane content to the clipboard or shows that clipboard access is unavailable

#### Scenario: User downloads formatted XML output
- **WHEN** the current output is formatted XML or minified XML and the user activates download
- **THEN** the tool downloads the output as an `.xml` file

### Requirement: XML formatter rejects invalid XML input with actionable feedback
The XML formatter SHALL reject empty or malformed XML input for formatting, minifying, and XML-to-JSON conversion, and it SHALL show validation feedback instead of producing misleading output.

#### Scenario: User submits an empty source pane
- **WHEN** the user triggers a transform action without entering XML
- **THEN** the tool shows a validation error that XML input is required

#### Scenario: User submits malformed XML
- **WHEN** the user triggers a transform action with malformed XML
- **THEN** the tool shows a validation error that the XML could not be parsed
- **AND** the output pane does not replace the last valid result with a misleading new value

