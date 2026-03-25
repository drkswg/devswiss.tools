export type HighlightLanguage = 'json' | 'xml';

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function wrapToken(className: string, value: string) {
  return `<span class="${className}">${escapeHtml(value)}</span>`;
}

function highlightXml(value: string) {
  const tokenPattern =
    /<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<!\[CDATA\[[\s\S]*?\]\]>|<!DOCTYPE[\s\S]*?>|<\/?[^>]+?>/g;
  let lastIndex = 0;
  let html = '';

  for (const match of value.matchAll(tokenPattern)) {
    const token = match[0];
    const start = match.index ?? 0;

    if (start > lastIndex) {
      html += wrapToken('tokenText', value.slice(lastIndex, start));
    }

    if (token.startsWith('<!--')) {
      html += wrapToken('tokenComment', token);
    } else if (token.startsWith('<?') || token.startsWith('<!')) {
      html += wrapToken('tokenMeta', token);
    } else {
      html += highlightXmlTag(token);
    }

    lastIndex = start + token.length;
  }

  if (lastIndex < value.length) {
    html += wrapToken('tokenText', value.slice(lastIndex));
  }

  return html;
}

function highlightXmlTag(tag: string) {
  const nameMatch = tag.match(/^<\s*(\/?)\s*([^\s/>]+)/);
  const closingPrefix = nameMatch?.[1] ? '</' : '<';
  const elementName = nameMatch?.[2] ?? '';
  const selfClosing = /\/\s*>$/.test(tag);
  const attributesStart = nameMatch?.[0].length ?? 1;
  const attributesEnd = tag.length - (selfClosing ? 2 : 1);
  const attributes = attributesStart < attributesEnd ? tag.slice(attributesStart, attributesEnd) : '';

  let html = wrapToken('tokenPunctuation', closingPrefix);

  if (elementName) {
    html += wrapToken('tokenTagName', elementName);
  }

  html += highlightXmlAttributes(attributes);

  if (selfClosing) {
    html += wrapToken('tokenPunctuation', '/>');
  } else {
    html += wrapToken('tokenPunctuation', '>');
  }

  return html;
}

function highlightXmlAttributes(attributes: string) {
  const attributePattern = /(\s+)([^\s=/>]+)(\s*=\s*)("[^"]*"|'[^']*')?/g;
  let lastIndex = 0;
  let html = '';

  for (const match of attributes.matchAll(attributePattern)) {
    const [fullMatch, leadingSpace, name, equals = '', rawValue = ''] = match;
    const start = match.index ?? 0;

    if (start > lastIndex) {
      html += escapeHtml(attributes.slice(lastIndex, start));
    }

    html += escapeHtml(leadingSpace);
    html += wrapToken('tokenAttributeName', name);

    if (equals) {
      html += wrapToken('tokenPunctuation', equals);
    }

    if (rawValue) {
      html += wrapToken('tokenAttributeValue', rawValue);
    }

    lastIndex = start + fullMatch.length;
  }

  if (lastIndex < attributes.length) {
    html += escapeHtml(attributes.slice(lastIndex));
  }

  return html;
}

function highlightJson(value: string) {
  const tokenPattern =
    /"(?:\\.|[^"\\])*"(?=\s*:)|"(?:\\.|[^"\\])*"|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?|\btrue\b|\bfalse\b|\bnull\b|[{}\[\],:]/g;
  let lastIndex = 0;
  let html = '';

  for (const match of value.matchAll(tokenPattern)) {
    const token = match[0];
    const start = match.index ?? 0;

    if (start > lastIndex) {
      html += escapeHtml(value.slice(lastIndex, start));
    }

    if (token === 'true' || token === 'false') {
      html += wrapToken('tokenBoolean', token);
    } else if (token === 'null') {
      html += wrapToken('tokenNull', token);
    } else if (/^[{}\[\],:]$/.test(token)) {
      html += wrapToken('tokenPunctuation', token);
    } else if (token.startsWith('"')) {
      const remainder = value.slice(start + token.length);
      const isKey = /^\s*:/.test(remainder);
      html += wrapToken(isKey ? 'tokenKey' : 'tokenString', token);
    } else {
      html += wrapToken('tokenNumber', token);
    }

    lastIndex = start + token.length;
  }

  if (lastIndex < value.length) {
    html += escapeHtml(value.slice(lastIndex));
  }

  return html;
}

function ensureRenderableTrailingLine(value: string, html: string) {
  if (!html) {
    return '&nbsp;';
  }

  return value.endsWith('\n') ? `${html}\n&nbsp;` : html;
}

export function renderHighlightedMarkup(value: string, language: HighlightLanguage) {
  const html = language === 'json' ? highlightJson(value) : highlightXml(value);
  return ensureRenderableTrailingLine(value, html);
}
