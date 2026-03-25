## ADDED Requirements

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

## MODIFIED Requirements

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
