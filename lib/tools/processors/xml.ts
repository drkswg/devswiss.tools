import { normalizeLineEndings } from '@/lib/utils/text';
import type { FieldErrors, ValidationState } from '@/lib/validation/common';
import { getXmlFieldErrors, xmlToolSchema, type XmlTransformMode } from '@/lib/validation/xml';

export type XmlOutputKind = 'json' | 'xml';

export type XmlProcessorResult = {
  fieldErrors?: FieldErrors;
  message: string;
  outputKind?: XmlOutputKind;
  state: Exclude<ValidationState, 'idle'>;
  value?: string;
};

const xmlDeclarationPattern = /^\s*(<\?xml[\s\S]*?\?>)\s*/i;

function getXmlDeclaration(value: string) {
  return value.match(xmlDeclarationPattern)?.[1] ?? '';
}

function hasParserError(document: XMLDocument) {
  return (
    document.getElementsByTagName('parsererror').length > 0 ||
    document.getElementsByTagNameNS('*', 'parsererror').length > 0
  );
}

function escapeXmlText(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeXmlAttribute(value: string) {
  return escapeXmlText(value).replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function normalizeTextNodeValue(node: ChildNode) {
  return normalizeLineEndings(node.textContent ?? '');
}

function serializeAttributes(element: Element) {
  return Array.from(element.attributes)
    .map((attribute) => ` ${attribute.name}="${escapeXmlAttribute(attribute.value)}"`)
    .join('');
}

function shouldInlineChildren(children: ChildNode[]) {
  return children.every((child) => child.nodeType === Node.TEXT_NODE || child.nodeType === Node.CDATA_SECTION_NODE);
}

function getSerializableChildren(element: Element) {
  const children = Array.from(element.childNodes);
  const hasStructuredChildren = children.some(
    (child) =>
      child.nodeType === Node.ELEMENT_NODE ||
      child.nodeType === Node.COMMENT_NODE ||
      child.nodeType === Node.PROCESSING_INSTRUCTION_NODE
  );

  if (!hasStructuredChildren) {
    return children;
  }

  return children.filter((child) => child.nodeType !== Node.TEXT_NODE || normalizeTextNodeValue(child).trim().length > 0);
}

function serializeNode(node: ChildNode, level: number, indentSize: number): string {
  const indent = ' '.repeat(level * indentSize);

  if (node.nodeType === Node.TEXT_NODE) {
    return `${indent}${escapeXmlText(normalizeTextNodeValue(node))}`;
  }

  if (node.nodeType === Node.CDATA_SECTION_NODE) {
    return `${indent}<![CDATA[${node.textContent ?? ''}]]>`;
  }

  if (node.nodeType === Node.COMMENT_NODE) {
    return `${indent}<!--${node.textContent ?? ''}-->`;
  }

  if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
    const instruction = node as ProcessingInstruction;
    return `${indent}<?${instruction.target} ${instruction.data}?>`;
  }

  const element = node as Element;
  const attributes = serializeAttributes(element);
  const children = getSerializableChildren(element);

  if (children.length === 0) {
    return `${indent}<${element.tagName}${attributes}/>`;
  }

  if (shouldInlineChildren(children)) {
    const content = children
      .map((child) =>
        child.nodeType === Node.CDATA_SECTION_NODE
          ? `<![CDATA[${child.textContent ?? ''}]]>`
          : escapeXmlText(normalizeTextNodeValue(child))
      )
      .join('');

    return `${indent}<${element.tagName}${attributes}>${content}</${element.tagName}>`;
  }

  const nested = children.map((child) => serializeNode(child, level + 1, indentSize)).join('\n');
  return `${indent}<${element.tagName}${attributes}>\n${nested}\n${indent}</${element.tagName}>`;
}

function formatXmlDocument(document: XMLDocument, indentSize: number, declaration: string) {
  const root = document.documentElement;
  const body = serializeNode(root, 0, indentSize);

  return declaration ? `${declaration}\n${body}` : body;
}

function removeWhitespaceOnlyTextNodes(node: Node) {
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE && normalizeTextNodeValue(child).trim().length === 0) {
      node.removeChild(child);
      continue;
    }

    removeWhitespaceOnlyTextNodes(child);
  }
}

function minifyXmlDocument(document: XMLDocument, declaration: string) {
  const clonedRoot = document.documentElement.cloneNode(true);
  removeWhitespaceOnlyTextNodes(clonedRoot);

  const serializer = new XMLSerializer();
  const body = serializer.serializeToString(clonedRoot);

  return declaration ? `${declaration}${body}` : body;
}

type JsonValue = JsonObject | JsonValue[] | string;

interface JsonObject {
  [key: string]: JsonValue;
}

function appendJsonChild(target: JsonObject, key: string, value: JsonValue) {
  const existing = target[key];

  if (existing === undefined) {
    target[key] = value;
    return;
  }

  if (Array.isArray(existing)) {
    existing.push(value);
    return;
  }

  target[key] = [existing, value];
}

function elementToJson(element: Element): JsonValue {
  const attributes = Array.from(element.attributes);
  const childElements = Array.from(element.children);
  const textSegments = Array.from(element.childNodes)
    .filter((child) => child.nodeType === Node.TEXT_NODE || child.nodeType === Node.CDATA_SECTION_NODE)
    .map((child) => normalizeTextNodeValue(child).trim())
    .filter(Boolean);

  if (attributes.length === 0 && childElements.length === 0) {
    return textSegments.join(' ') || '';
  }

  const result: JsonObject = {};

  if (attributes.length > 0) {
    result['@attributes'] = Object.fromEntries(attributes.map((attribute) => [attribute.name, attribute.value]));
  }

  for (const child of childElements) {
    appendJsonChild(result, child.tagName, elementToJson(child));
  }

  if (textSegments.length > 0) {
    result['#text'] = textSegments.join(' ');
  }

  return result;
}

function convertXmlDocumentToJson(document: XMLDocument) {
  return JSON.stringify({ [document.documentElement.tagName]: elementToJson(document.documentElement) }, null, 2);
}

function parseXmlDocument(value: string) {
  const parser = new DOMParser();
  const document = parser.parseFromString(value, 'application/xml');

  if (hasParserError(document) || !document.documentElement) {
    return {
      ok: false as const,
      message: 'XML could not be parsed. Check that tags are balanced and attributes are quoted.'
    };
  }

  return {
    ok: true as const,
    document
  };
}

function buildSuccessResult(mode: XmlTransformMode, indentSize: number, value: string): XmlProcessorResult {
  if (mode === 'format') {
    return {
      state: 'valid',
      value,
      outputKind: 'xml',
      message: `XML formatted with ${indentSize}-space indentation.`
    };
  }

  if (mode === 'minify') {
    return {
      state: 'valid',
      value,
      outputKind: 'xml',
      message: 'XML minified.'
    };
  }

  return {
    state: 'valid',
    value,
    outputKind: 'json',
    message: 'XML converted to JSON.'
  };
}

export function transformXml(input: { indentSize: number; inputValue: string; mode: XmlTransformMode }): XmlProcessorResult {
  const parsed = xmlToolSchema.safeParse(input);

  if (!parsed.success) {
    return {
      state: 'invalid',
      message: 'XML input is outside the allowed limits.',
      fieldErrors: getXmlFieldErrors(parsed.error)
    };
  }

  const { indentSize, inputValue, mode } = parsed.data;
  const normalizedInput = normalizeLineEndings(inputValue);
  const trimmedInput = normalizedInput.trim();

  if (trimmedInput.length === 0) {
    return {
      state: 'invalid',
      message: 'XML input is required.',
      fieldErrors: {
        inputValue: ['XML input is required.']
      }
    };
  }

  const parsedDocument = parseXmlDocument(trimmedInput);

  if (!parsedDocument.ok) {
    return {
      state: 'invalid',
      message: parsedDocument.message,
      fieldErrors: {
        inputValue: [parsedDocument.message]
      }
    };
  }

  const declaration = getXmlDeclaration(normalizedInput);
  const value =
    mode === 'format'
      ? formatXmlDocument(parsedDocument.document, indentSize, declaration)
      : mode === 'minify'
        ? minifyXmlDocument(parsedDocument.document, declaration)
        : convertXmlDocumentToJson(parsedDocument.document);

  return buildSuccessResult(mode, indentSize, value);
}
