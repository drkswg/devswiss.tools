## MODIFIED Requirements

### Requirement: XML formatter provides a two-pane workspace
The XML formatter SHALL present an original-input pane and a derived-output pane on the same tool page so users can compare source XML with the latest transformed result without overwriting the source content. In desktop and large-tablet two-column layouts, the source and output text windows SHALL remain visually aligned and use the available viewport space for a larger editing surface. In narrow layouts, the workflows SHALL stack vertically while keeping each text window full-width within its pane.

#### Scenario: User opens the XML formatter page on a wide screen
- **WHEN** the user navigates to the XML formatter tool on a viewport that supports the two-column layout
- **THEN** the page shows a source XML input pane and a separate output pane for transformed content side by side
- **AND** the source and output text windows begin at the same visual row within their respective panes
- **AND** each text window expands beyond the minimum compact size to use the available tool-page space

#### Scenario: User opens the XML formatter page on a narrow screen
- **WHEN** the user navigates to the XML formatter tool on a viewport that does not support the two-column layout
- **THEN** the source workflow appears above the output workflow
- **AND** each text window fills the available pane width

#### Scenario: Transform keeps the original source visible
- **WHEN** the user formats, minifies, or converts valid XML
- **THEN** the source pane keeps the original XML content
- **AND** the output pane shows only the transformed result for the selected action
