# xml-formatter Specification

## Purpose
TBD - created by archiving change add-xml-formatter-tool. Update Purpose after archive.
## Requirements
### Requirement: XML formatter provides a two-pane workspace
The XML formatter SHALL present an original-input pane and a derived-output pane on the same tool page so users can compare source XML with the latest transformed result without overwriting the source content. In desktop and large-tablet two-column layouts, the source and output panes SHALL expand to use the available tool-page width and height, and the source and output editor windows SHALL remain visually aligned while filling the remaining pane space as the viewport changes. In narrow layouts, the workflows SHALL stack vertically while keeping each editor window full-width within its pane and sized to use the available viewport space more effectively than a compact default textarea.

#### Scenario: User opens the XML formatter page on a wide screen
- **WHEN** the user navigates to the XML formatter tool on a viewport that supports the two-column layout
- **THEN** the page shows a source XML input pane and a separate output pane for transformed content side by side
- **AND** the source and output editor windows begin at the same visual row within their respective panes
- **AND** each editor window stretches to fill the remaining pane height instead of stopping at a compact fixed size

#### Scenario: User opens the XML formatter page on a narrow screen
- **WHEN** the user navigates to the XML formatter tool on a viewport that does not support the two-column layout
- **THEN** the source workflow appears above the output workflow
- **AND** each editor window fills the available pane width
- **AND** each editor window still expands to use the available vertical space within the stacked layout

#### Scenario: User changes the browser size while reviewing XML
- **WHEN** the XML formatter is already open and the viewport grows or shrinks across supported screen sizes
- **THEN** the source and output panes reflow to the appropriate layout for that viewport
- **AND** the editor windows resize with the available pane space without overlapping their controls or support content

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

### Requirement: XML formatter syntax highlights XML and JSON content
The XML formatter SHALL render syntax highlighting in the source and output editor windows so users can visually distinguish document structure while keeping the existing editing, selection, copy, and review workflows available. The source editor SHALL highlight XML content, and the output editor SHALL highlight XML or JSON according to the latest valid transform result.

#### Scenario: User reviews XML in the source editor
- **WHEN** the source pane contains XML entered manually or loaded from a file
- **THEN** the source editor renders XML syntax highlighting for the visible content
- **AND** the user can continue typing, selecting, and copying in the source pane

#### Scenario: User reviews transformed XML output
- **WHEN** the user formats or minifies valid XML
- **THEN** the output editor shows the transformed XML result
- **AND** the output editor renders XML syntax highlighting for that result

#### Scenario: User reviews transformed JSON output
- **WHEN** the user converts valid XML to JSON
- **THEN** the output editor shows the JSON result
- **AND** the output editor renders JSON syntax highlighting for that result

