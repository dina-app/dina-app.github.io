const toolNav = document.getElementById('toolNav');
const toolSearch = document.getElementById('toolSearch');
const toolTitle = document.getElementById('toolTitle');
const toolGroup = document.getElementById('toolGroup');
const toolSummary = document.getElementById('toolSummary');
const exampleBar = document.getElementById('exampleBar');
const toolContent = document.getElementById('toolContent');
const statusLine = document.getElementById('statusLine');

const sandboxHandlers = new Map();

window.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || !data.channel) return;
  const handler = sandboxHandlers.get(data.channel);
  if (handler) handler(data);
});

function setStatus(message) {
  statusLine.textContent = message || '';
}

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (value === false || value === null || value === undefined) return;
    if (key === 'className') {
      node.className = value;
    } else if (key === 'text') {
      node.textContent = value;
    } else if (key === 'html') {
      node.innerHTML = value;
    } else if (key === 'value') {
      node.value = value;
    } else if (key === 'checked') {
      node.checked = Boolean(value);
    } else if (key === 'dataset') {
      Object.assign(node.dataset, value);
    } else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      node.setAttribute(key, value === true ? '' : value);
    }
  });

  children.flat().forEach((child) => {
    if (child === null || child === undefined) return;
    node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  });
  return node;
}

function button(label, onClick, variant = '') {
  return el('button', { type: 'button', className: `btn ${variant}`.trim(), onClick }, label);
}

function field(label, input) {
  return el('label', { className: 'field-row' }, el('span', { className: 'field-label' }, label), input);
}

function textArea(value = '', rows = 12) {
  return el('textarea', { className: 'mono', rows, value });
}

function select(options, value) {
  const node = el('select');
  options.forEach((option) => {
    const item = typeof option === 'string' ? { value: option, label: option } : option;
    node.appendChild(el('option', { value: item.value, selected: item.value === value }, item.label));
  });
  return node;
}

function check(label, checked = false) {
  const input = el('input', { type: 'checkbox', checked });
  return {
    input,
    node: el('label', { className: 'check-row' }, input, el('span', {}, label)),
  };
}

function pane(title, body, actions = []) {
  return el('section', { className: 'pane' },
    el('div', { className: 'pane-head' },
      el('h3', { className: 'pane-title' }, title),
      el('div', { className: 'actions' }, actions),
    ),
    el('div', { className: 'pane-body' }, body),
  );
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function copyText(text) {
  const value = String(text || '');
  if (!value) {
    setStatus('Nothing to copy.');
    return;
  }

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
    } else {
      const temp = el('textarea', { value });
      temp.style.position = 'fixed';
      temp.style.opacity = '0';
      document.body.appendChild(temp);
      temp.focus();
      temp.select();
      document.execCommand('copy');
      temp.remove();
    }
    setStatus('Copied output.');
  } catch (error) {
    setStatus(`Copy failed: ${error.message}`);
  }
}

function downloadText(filename, text, type = 'text/plain') {
  const blob = new Blob([String(text || '')], { type });
  const url = URL.createObjectURL(blob);
  const link = el('a', { href: url, download: filename });
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
  setStatus(`Downloaded ${filename}.`);
}

function safeFileName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'output';
}

function normalizeDelimiter(value) {
  return value.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
}

function stringifyValue(value) {
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch (error) {
    return String(value);
  }
}

function createExampleButtons(tool, loadExample) {
  exampleBar.replaceChildren();
  tool.examples.forEach((example) => {
    exampleBar.appendChild(button(example.label, () => loadExample(example)));
  });
}

function renderTools(filter = '') {
  const query = filter.trim().toLowerCase();
  const groups = new Map();
  tools.forEach((tool) => {
    const haystack = `${tool.name} ${tool.group} ${tool.summary}`.toLowerCase();
    if (query && !haystack.includes(query)) return;
    if (!groups.has(tool.group)) groups.set(tool.group, []);
    groups.get(tool.group).push(tool);
  });

  toolNav.replaceChildren();
  groups.forEach((items, group) => {
    toolNav.appendChild(el('div', { className: 'nav-group' }, group));
    items.forEach((tool) => {
      const tab = el('button', {
        type: 'button',
        className: `tool-tab ${tool.id === activeToolId ? 'active' : ''}`.trim(),
        onClick: () => openTool(tool.id),
      }, el('strong', {}, tool.name), el('span', {}, tool.short));
      toolNav.appendChild(tab);
    });
  });
}

let activeToolId = '';

function openTool(id) {
  const tool = tools.find((item) => item.id === id) || tools[0];
  activeToolId = tool.id;
  location.hash = tool.id;
  toolTitle.textContent = tool.name;
  toolGroup.textContent = tool.group;
  toolSummary.textContent = tool.summary;
  toolContent.replaceChildren();
  setStatus('');
  renderTools(toolSearch.value);

  const rendered = tool.render(tool);
  toolContent.appendChild(rendered.root);
  createExampleButtons(tool, rendered.loadExample);
  if (tool.autoLoadExample !== false) {
    rendered.loadExample(tool.examples[0]);
  }
}

toolSearch.addEventListener('input', () => renderTools(toolSearch.value));

function sortKeysDeep(value) {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (!value || typeof value !== 'object') return value;
  return Object.keys(value).sort().reduce((acc, key) => {
    acc[key] = sortKeysDeep(value[key]);
    return acc;
  }, {});
}

function flattenJson(value, path = '$', rows = []) {
  if (Array.isArray(value)) {
    if (!value.length) rows.push([path, '[]']);
    value.forEach((item, index) => flattenJson(item, `${path}[${index}]`, rows));
    return rows;
  }
  if (value && typeof value === 'object') {
    const keys = Object.keys(value);
    if (!keys.length) rows.push([path, '{}']);
    keys.forEach((key) => flattenJson(value[key], `${path}.${key}`, rows));
    return rows;
  }
  rows.push([path, stringifyValue(value)]);
  return rows;
}

function typeName(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) {
    if (!value.length) return 'unknown[]';
    const types = [...new Set(value.map(typeName))];
    return `${types.length === 1 ? types[0] : `(${types.join(' | ')})`}[]`;
  }
  if (typeof value === 'object') return 'Record<string, unknown>';
  return typeof value;
}

function toPascalIdentifier(value) {
  const name = String(value)
    .replace(/[^A-Za-z0-9_$]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join('');
  return /^[A-Za-z_$]/.test(name) ? name : `Value${name || ''}`;
}

function jsonToTypes(value, name = 'Root') {
  const interfaces = [];

  function toInterface(item, interfaceName) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return typeName(item);
    const lines = [`interface ${interfaceName} {`];
    Object.entries(item).forEach(([key, child]) => {
      const safeKey = /^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key);
      let childType;
      if (Array.isArray(child)) {
        const objectChild = child.find((entry) => entry && typeof entry === 'object' && !Array.isArray(entry));
        if (objectChild) {
          const childName = `${interfaceName}${toPascalIdentifier(key)}`;
          childType = `${childName}[]`;
          toInterface(objectChild, childName);
        } else {
          childType = typeName(child);
        }
      } else if (child && typeof child === 'object') {
        const childName = `${interfaceName}${toPascalIdentifier(key)}`;
        childType = childName;
        toInterface(child, childName);
      } else {
        childType = typeName(child);
      }
      lines.push(`  ${safeKey}: ${childType};`);
    });
    lines.push('}');
    interfaces.unshift(lines.join('\n'));
    return interfaceName;
  }

  toInterface(value, name);
  return interfaces.join('\n\n');
}

function createJsonTool(tool) {
  const input = textArea('', 16);
  const output = el('pre', { className: 'output' });
  const paths = el('div', { className: 'light-output' });
  const types = el('pre', { className: 'output' });
  const pathSearch = el('input', { type: 'search', placeholder: '$.items[0].name' });
  let currentJson = '';
  let currentTypes = '';

  function renderPaths(data) {
    const query = pathSearch.value.trim().toLowerCase();
    const rows = flattenJson(data).filter(([path, value]) => {
      const text = `${path} ${value}`.toLowerCase();
      return !query || text.includes(query);
    }).slice(0, 80);
    paths.replaceChildren();
    if (!rows.length) {
      paths.textContent = 'No paths found.';
      return;
    }
    const table = el('table', { className: 'data-table' },
      el('thead', {}, el('tr', {}, el('th', {}, 'Path'), el('th', {}, 'Value'))),
      el('tbody'),
    );
    const tbody = table.querySelector('tbody');
    rows.forEach(([path, value]) => {
      tbody.appendChild(el('tr', {},
        el('td', {}, button(path, () => copyText(path))),
        el('td', {}, value),
      ));
    });
    paths.appendChild(table);
  }

  function process(mode = 'format') {
    try {
      const parsed = JSON.parse(input.value);
      const data = mode === 'sort' ? sortKeysDeep(parsed) : parsed;
      currentJson = mode === 'minify' ? JSON.stringify(data) : JSON.stringify(data, null, 2);
      currentTypes = jsonToTypes(data);
      output.textContent = currentJson;
      types.textContent = currentTypes;
      renderPaths(data);
      setStatus('JSON is valid.');
    } catch (error) {
      output.textContent = error.message;
      types.textContent = '';
      paths.textContent = '';
      currentJson = '';
      currentTypes = '';
      setStatus('JSON validation failed.');
    }
  }

  input.addEventListener('input', () => process('format'));
  pathSearch.addEventListener('input', () => {
    try {
      renderPaths(JSON.parse(output.textContent || input.value));
    } catch (error) {
      paths.textContent = '';
    }
  });

  const root = el('div', { className: 'tool-content' },
    pane('Input', field('JSON', input), [
      button('Format', () => process('format'), 'primary'),
      button('Minify', () => process('minify')),
      button('Sort Keys', () => process('sort')),
      button('Reset', () => { input.value = ''; process('format'); }, 'warn'),
    ]),
    el('div', { className: 'grid-2' },
      pane('Output', output, [
        button('Copy', () => copyText(currentJson)),
        button('Download', () => downloadText('formatted.json', currentJson, 'application/json')),
      ]),
      pane('TypeScript Interface', types, [
        button('Copy', () => copyText(currentTypes)),
        button('Download', () => downloadText('types.ts', currentTypes, 'text/typescript')),
      ]),
    ),
    pane('Paths', el('div', { className: 'tool-content' }, field('Search paths', pathSearch), paths)),
  );

  return {
    root,
    loadExample(example) {
      input.value = example.input;
      pathSearch.value = '';
      process('format');
    },
  };
}

function transformCase(value, mode) {
  if (mode === 'upper') return value.toUpperCase();
  if (mode === 'lower') return value.toLowerCase();
  if (mode === 'title') {
    return value.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
  if (mode === 'camel') {
    return value.toLowerCase().replace(/[^a-z0-9]+([a-z0-9])/g, (_, letter) => letter.toUpperCase());
  }
  return value;
}

function createTextTool(tool) {
  const input = textArea('', 14);
  const output = el('pre', { className: 'output' });
  const caseMode = select([
    { value: 'none', label: 'No case change' },
    { value: 'upper', label: 'Uppercase' },
    { value: 'lower', label: 'Lowercase' },
    { value: 'title', label: 'Title Case' },
    { value: 'camel', label: 'camelCase' },
  ], 'none');
  const splitBy = el('input', { type: 'text', placeholder: '\\n' });
  const joinBy = el('input', { type: 'text', placeholder: '\\n' });
  const prefix = el('input', { type: 'text' });
  const suffix = el('input', { type: 'text' });
  const findValue = el('input', { type: 'text' });
  const replaceValue = el('input', { type: 'text' });
  const trim = check('Trim', true);
  const removeEmpty = check('Remove empty lines', true);
  const dedupe = check('Dedupe', false);
  const sortRows = check('Sort', false);
  let currentOutput = '';

  function apply() {
    const splitter = normalizeDelimiter(splitBy.value || '\n');
    const joiner = normalizeDelimiter(joinBy.value || '\n');
    let rows = input.value.split(splitter);
    rows = rows.map((row) => {
      let next = row;
      if (trim.input.checked) next = next.trim();
      if (findValue.value) next = next.split(findValue.value).join(replaceValue.value);
      next = transformCase(next, caseMode.value);
      return `${prefix.value}${next}${suffix.value}`;
    });
    if (removeEmpty.input.checked) rows = rows.filter((row) => row.trim() !== '');
    if (dedupe.input.checked) rows = [...new Set(rows)];
    if (sortRows.input.checked) rows = rows.slice().sort((a, b) => a.localeCompare(b));
    currentOutput = rows.join(joiner);
    output.textContent = currentOutput;
    setStatus(`${rows.length} rows transformed.`);
  }

  [
    input, caseMode, splitBy, joinBy, prefix, suffix, findValue, replaceValue,
    trim.input, removeEmpty.input, dedupe.input, sortRows.input,
  ].forEach((node) => node.addEventListener('input', apply));

  const root = el('div', { className: 'tool-content' },
    pane('Input', field('Text', input), [
      button('Transform', apply, 'primary'),
      button('Reset', () => { input.value = ''; currentOutput = ''; output.textContent = ''; setStatus('Reset text transformer.'); }, 'warn'),
    ]),
    pane('Options', el('div', { className: 'grid-auto' },
      field('Case', caseMode),
      field('Split by', splitBy),
      field('Join with', joinBy),
      field('Prefix', prefix),
      field('Suffix', suffix),
      field('Find', findValue),
      field('Replace', replaceValue),
      trim.node,
      removeEmpty.node,
      dedupe.node,
      sortRows.node,
    )),
    pane('Output', output, [
      button('Copy', () => copyText(currentOutput)),
      button('Download', () => downloadText('transformed.txt', currentOutput)),
    ]),
  );

  return {
    root,
    loadExample(example) {
      input.value = example.input;
      caseMode.value = example.caseMode || 'none';
      splitBy.value = example.splitBy || '';
      joinBy.value = example.joinBy || '';
      prefix.value = example.prefix || '';
      suffix.value = example.suffix || '';
      findValue.value = example.find || '';
      replaceValue.value = example.replace || '';
      trim.input.checked = example.trim ?? true;
      removeEmpty.input.checked = example.removeEmpty ?? true;
      dedupe.input.checked = Boolean(example.dedupe);
      sortRows.input.checked = Boolean(example.sort);
      apply();
    },
  };
}

function splitLines(text) {
  return text.replace(/\r\n/g, '\n').split('\n');
}

function getDiffOps(leftText, rightText, ignoreWhitespace) {
  const left = splitLines(leftText);
  const right = splitLines(rightText);
  const normalize = (line) => ignoreWhitespace ? line.trim().replace(/\s+/g, ' ') : line;
  const m = left.length;
  const n = right.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = m - 1; i >= 0; i -= 1) {
    for (let j = n - 1; j >= 0; j -= 1) {
      dp[i][j] = normalize(left[i]) === normalize(right[j])
        ? dp[i + 1][j + 1] + 1
        : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const ops = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (normalize(left[i]) === normalize(right[j])) {
      ops.push({ type: 'equal', left: left[i], right: right[j] });
      i += 1;
      j += 1;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ type: 'remove', left: left[i], right: '' });
      i += 1;
    } else {
      ops.push({ type: 'add', left: '', right: right[j] });
      j += 1;
    }
  }
  while (i < m) {
    ops.push({ type: 'remove', left: left[i], right: '' });
    i += 1;
  }
  while (j < n) {
    ops.push({ type: 'add', left: '', right: right[j] });
    j += 1;
  }
  return ops;
}

function unifiedPatch(ops) {
  return ['--- Original', '+++ Changed', '@@'].concat(ops.map((op) => {
    if (op.type === 'add') return `+${op.right}`;
    if (op.type === 'remove') return `-${op.left}`;
    return ` ${op.left}`;
  })).join('\n');
}

function renderDiffTable(ops) {
  const table = el('table', { className: 'diff-table' },
    el('thead', {}, el('tr', {}, el('th', {}, 'Original'), el('th', {}, 'Changed'))),
    el('tbody'),
  );
  const tbody = table.querySelector('tbody');
  let index = 0;
  while (index < ops.length) {
    const op = ops[index];
    if (op.type === 'remove') {
      const removes = [];
      const adds = [];
      while (ops[index] && ops[index].type === 'remove') {
        removes.push(ops[index].left);
        index += 1;
      }
      while (ops[index] && ops[index].type === 'add') {
        adds.push(ops[index].right);
        index += 1;
      }
      const rows = Math.max(removes.length, adds.length);
      for (let i = 0; i < rows; i += 1) {
        tbody.appendChild(el('tr', {},
          el('td', { className: removes[i] !== undefined ? 'line-remove' : '' }, removes[i] || ''),
          el('td', { className: adds[i] !== undefined ? 'line-add' : '' }, adds[i] || ''),
        ));
      }
      continue;
    }
    if (op.type === 'add') {
      tbody.appendChild(el('tr', {}, el('td', {}, ''), el('td', { className: 'line-add' }, op.right)));
    } else {
      tbody.appendChild(el('tr', {}, el('td', { className: 'line-equal' }, op.left), el('td', { className: 'line-equal' }, op.right)));
    }
    index += 1;
  }
  return table;
}

function createDiffTool(tool) {
  const left = textArea('', 14);
  const right = textArea('', 14);
  const mode = select(['Side by side', 'Unified diff', 'Inline diff'], 'Side by side');
  const ignore = check('Ignore whitespace', false);
  const output = el('div', { className: 'light-output' });
  let patch = '';

  function compare() {
    const ops = getDiffOps(left.value, right.value, ignore.input.checked);
    const additions = ops.filter((op) => op.type === 'add').length;
    const removals = ops.filter((op) => op.type === 'remove').length;
    patch = unifiedPatch(ops);
    output.replaceChildren();
    if (mode.value === 'Unified diff') {
      output.appendChild(el('pre', {}, patch));
    } else if (mode.value === 'Inline diff') {
      output.appendChild(el('pre', {}, ops.map((op) => {
        if (op.type === 'add') return `+ ${op.right}`;
        if (op.type === 'remove') return `- ${op.left}`;
        return `  ${op.left}`;
      }).join('\n')));
    } else {
      output.appendChild(renderDiffTable(ops));
    }
    setStatus(`${additions} additions, ${removals} removals.`);
  }

  [left, right, mode, ignore.input].forEach((node) => node.addEventListener('input', compare));

  const root = el('div', { className: 'tool-content' },
    pane('Compare', el('div', { className: 'grid-2' }, field('Original', left), field('Changed', right)), [
      button('Compare', compare, 'primary'),
      button('Reset', () => { left.value = ''; right.value = ''; compare(); }, 'warn'),
    ]),
    pane('Options', el('div', { className: 'grid-auto' }, field('View', mode), ignore.node)),
    pane('Diff Output', output, [
      button('Copy Patch', () => copyText(patch)),
      button('Download Patch', () => downloadText('changes.patch', patch)),
    ]),
  );

  return {
    root,
    loadExample(example) {
      left.value = example.left;
      right.value = example.right;
      mode.value = example.mode || 'Side by side';
      ignore.input.checked = Boolean(example.ignore);
      compare();
    },
  };
}

function createRegexTool(tool) {
  const pattern = el('input', { type: 'text' });
  const flags = el('input', { type: 'text', value: 'gmi' });
  const sample = textArea('', 12);
  const replacement = el('input', { type: 'text' });
  const highlighted = el('div', { className: 'light-output' });
  const groups = el('div', { className: 'light-output' });
  const replaced = el('pre', { className: 'output' });
  let replacementOutput = '';

  function testRegex() {
    try {
      const rawFlags = [...new Set(flags.value.split(''))].join('');
      const scanFlags = rawFlags.includes('g') ? rawFlags : `${rawFlags}g`;
      const regex = new RegExp(pattern.value, scanFlags);
      const replaceRegex = new RegExp(pattern.value, rawFlags);
      const text = sample.value;
      let cursor = 0;
      let html = '';
      const rows = [];
      let match;
      while ((match = regex.exec(text)) !== null) {
        html += escapeHtml(text.slice(cursor, match.index));
        html += `<mark class="match">${escapeHtml(match[0] || '(empty)')}</mark>`;
        rows.push({
          index: match.index,
          match: match[0],
          groups: match.slice(1),
        });
        cursor = match.index + match[0].length;
        if (match[0] === '') regex.lastIndex += 1;
      }
      html += escapeHtml(text.slice(cursor));
      highlighted.innerHTML = html || 'No matches.';
      groups.replaceChildren(renderRegexRows(rows));
      replacementOutput = replacement.value ? text.replace(replaceRegex, replacement.value) : '';
      replaced.textContent = replacementOutput;
      setStatus(`${rows.length} matches.`);
    } catch (error) {
      highlighted.textContent = error.message;
      groups.textContent = '';
      replaced.textContent = '';
      replacementOutput = '';
      setStatus('Regex failed.');
    }
  }

  [pattern, flags, sample, replacement].forEach((node) => node.addEventListener('input', testRegex));

  const root = el('div', { className: 'tool-content' },
    pane('Pattern', el('div', { className: 'grid-auto' }, field('Regex', pattern), field('Flags', flags), field('Replacement', replacement)), [
      button('Test', testRegex, 'primary'),
      button('Reset', () => { pattern.value = ''; sample.value = ''; replacement.value = ''; testRegex(); }, 'warn'),
    ]),
    pane('Sample Text', field('Text', sample)),
    el('div', { className: 'grid-2' },
      pane('Matches', highlighted),
      pane('Groups', groups),
    ),
    pane('Replacement Preview', replaced, [
      button('Copy', () => copyText(replacementOutput)),
      button('Download', () => downloadText('replacement.txt', replacementOutput)),
    ]),
  );

  return {
    root,
    loadExample(example) {
      pattern.value = example.pattern;
      flags.value = example.flags || 'gmi';
      sample.value = example.sample;
      replacement.value = example.replacement || '';
      testRegex();
    },
  };
}

function renderRegexRows(rows) {
  if (!rows.length) return el('p', {}, 'No capture groups.');
  const table = el('table', { className: 'data-table' },
    el('thead', {}, el('tr', {}, el('th', {}, 'Index'), el('th', {}, 'Match'), el('th', {}, 'Groups'))),
    el('tbody'),
  );
  const tbody = table.querySelector('tbody');
  rows.forEach((row) => {
    tbody.appendChild(el('tr', {},
      el('td', {}, String(row.index)),
      el('td', {}, row.match),
      el('td', {}, row.groups.map((group, index) => `${index + 1}: ${group ?? ''}`).join('\n')),
    ));
  });
  return table;
}

function buildHtmlDocument(html, css, js, channel) {
  const safeJs = js.replace(/<\/script/gi, '<\\/script');
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>${css}</style>
</head>
<body>
${html}
<script>
(function () {
  var channel = ${JSON.stringify(channel)};
  function send(type, value) {
    if (!channel || !parent) return;
    parent.postMessage({ channel: channel, type: type, value: String(value) }, '*');
  }
  ['log', 'warn', 'error'].forEach(function (level) {
    var original = console[level];
    console[level] = function () {
      var value = Array.prototype.slice.call(arguments).map(function (item) {
        try { return typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item); }
        catch (error) { return String(item); }
      }).join(' ');
      send(level, value);
      original.apply(console, arguments);
    };
  });
  window.onerror = function (message, source, line, column) {
    send('error', message + ' at ' + line + ':' + column);
  };
  try {
${safeJs}
  } catch (error) {
    send('error', error.stack || error.message || error);
  }
})();
<\/script>
</body>
</html>`;
}

function createHtmlTool(tool) {
  const html = textArea('', 10);
  const css = textArea('', 10);
  const js = textArea('', 10);
  const size = select([
    { value: '100%', label: 'Responsive' },
    { value: '390px', label: 'Mobile 390' },
    { value: '768px', label: 'Tablet 768' },
    { value: '1120px', label: 'Desktop 1120' },
  ], '100%');
  const frame = el('iframe', { className: 'preview-frame', sandbox: 'allow-scripts', title: 'HTML preview' });
  const consoleOutput = el('pre', { className: 'output' });
  let lastDoc = '';

  function run() {
    const channel = `html-${Date.now()}-${Math.random()}`;
    consoleOutput.textContent = '';
    sandboxHandlers.set(channel, (message) => {
      consoleOutput.textContent += `[${message.type}] ${message.value}\n`;
    });
    lastDoc = buildHtmlDocument(html.value, css.value, js.value, channel);
    frame.style.maxWidth = size.value;
    frame.srcdoc = lastDoc;
    setStatus('Preview refreshed.');
  }

  [html, css, js, size].forEach((node) => node.addEventListener('input', run));

  const root = el('div', { className: 'tool-content' },
    pane('Editors', el('div', { className: 'grid-3' }, field('HTML', html), field('CSS', css), field('JavaScript', js)), [
      button('Run', run, 'primary'),
      button('Reset', () => { html.value = ''; css.value = ''; js.value = ''; run(); }, 'warn'),
    ]),
    pane('Preview', el('div', { className: 'tool-content' },
      field('Device size', size),
      el('div', { className: 'preview-frame-wrap' }, frame),
    ), [
      button('Open Tab', () => {
        const url = URL.createObjectURL(new Blob([lastDoc], { type: 'text/html' }));
        window.open(url, '_blank', 'noopener');
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }),
      button('Download HTML', () => downloadText('playground.html', lastDoc, 'text/html')),
    ]),
    pane('Console', consoleOutput, [
      button('Copy', () => copyText(consoleOutput.textContent)),
      button('Download', () => downloadText('console.txt', consoleOutput.textContent)),
    ]),
  );

  return {
    root,
    loadExample(example) {
      html.value = example.html;
      css.value = example.css;
      js.value = example.js;
      size.value = example.size || '100%';
      run();
    },
  };
}

function runSandboxedJs(code, logOutput, resultOutput) {
  const channel = `js-${Date.now()}-${Math.random()}`;
  const safeCode = JSON.stringify(code).replace(/<\/script/gi, '<\\/script');
  logOutput.textContent = '';
  resultOutput.textContent = '';
  const frame = el('iframe', { className: 'hidden-frame', sandbox: 'allow-scripts' });
  document.body.appendChild(frame);
  sandboxHandlers.set(channel, (message) => {
    if (message.type === 'result') resultOutput.textContent = message.value;
    else if (message.type === 'time') setStatus(`Execution time: ${message.value} ms.`);
    else logOutput.textContent += `[${message.type}] ${message.value}\n`;
  });

  const html = `<!doctype html><script>
(function () {
  var channel = ${JSON.stringify(channel)};
  function send(type, value) {
    parent.postMessage({ channel: channel, type: type, value: String(value) }, '*');
  }
  function format(value) {
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return value;
    try { return JSON.stringify(value, null, 2); }
    catch (error) { return String(value); }
  }
  ['log', 'warn', 'error'].forEach(function (level) {
    var original = console[level];
    console[level] = function () {
      var value = Array.prototype.slice.call(arguments).map(format).join(' ');
      send(level, value);
      original.apply(console, arguments);
    };
  });
  var start = performance.now();
  function finish() {
    send('time', (performance.now() - start).toFixed(2));
  }
  try {
    var result = new Function(${safeCode})();
    if (result && typeof result.then === 'function') {
      result.then(function (value) {
        send('result', format(value));
        finish();
      }).catch(function (error) {
        send('error', error.stack || error.message || error);
        finish();
      });
    } else {
      send('result', format(result));
      finish();
    }
  } catch (error) {
    send('error', error.stack || error.message || error);
    finish();
  }
})();
<\/script>`;

  frame.srcdoc = html;
  setTimeout(() => {
    sandboxHandlers.delete(channel);
    frame.remove();
  }, 5000);
}

function createJavaScriptTool(tool) {
  const input = textArea('', 14);
  const logs = el('pre', { className: 'output' });
  const result = el('pre', { className: 'output' });

  function run() {
    runSandboxedJs(input.value, logs, result);
  }

  const root = el('div', { className: 'tool-content' },
    pane('Script', field('JavaScript', input), [
      button('Run', run, 'primary'),
      button('Reset', () => { input.value = ''; logs.textContent = ''; result.textContent = ''; setStatus('Reset JavaScript playground.'); }, 'warn'),
    ]),
    el('div', { className: 'grid-2' },
      pane('Console', logs, [
        button('Copy', () => copyText(logs.textContent)),
        button('Download', () => downloadText('console.txt', logs.textContent)),
      ]),
      pane('Result', result, [
        button('Copy', () => copyText(result.textContent)),
        button('Download', () => downloadText('result.txt', result.textContent)),
      ]),
    ),
  );

  return {
    root,
    loadExample(example) {
      input.value = example.code;
      run();
    },
  };
}

function compileTypeScript(source, strict) {
  const diagnostics = [];
  const pairs = [['(', ')'], ['[', ']'], ['{', '}']];
  pairs.forEach(([open, close]) => {
    const opens = (source.match(new RegExp(`\\${open}`, 'g')) || []).length;
    const closes = (source.match(new RegExp(`\\${close}`, 'g')) || []).length;
    if (opens !== closes) diagnostics.push(`Unbalanced ${open}${close} pairs.`);
  });
  if (/const\s+\w+\s*:\s*number\s*=\s*["'`]/.test(source)) {
    diagnostics.push('Possible type error: string assigned to number.');
  }
  if (/const\s+\w+\s*:\s*string\s*=\s*\d/.test(source)) {
    diagnostics.push('Possible type error: number assigned to string.');
  }
  if (strict && /:\s*any\b/.test(source)) {
    diagnostics.push('Strict mode warning: explicit any found.');
  }

  let output = source
    .replace(/^\s*interface\s+\w+\s*{[\s\S]*?^\s*}\s*$/gm, '')
    .replace(/^\s*type\s+\w+\s*=\s*[^;]+;?\s*$/gm, '')
    .replace(/function\s+([A-Za-z_$][\w$]*)<[^>(]+>\s*\(/g, 'function $1(')
    .replace(/([A-Za-z_$][\w$]*)<[^>\n]+>\s*\(/g, '$1(')
    .replace(/:\s*[A-Za-z_$][\w$]*(?:\[\])?(?:\s*\|\s*[A-Za-z_$][\w$]*(?:\[\])?)*/g, '')
    .replace(/\s+as\s+[A-Za-z_$][\w$]*(?:\[\])?/g, '')
    .replace(/<([A-Za-z_$][\w$]*)>\s*([A-Za-z_$][\w$]*)/g, '$2');

  output = output.split('\n').filter((line) => line.trim() !== '').join('\n');
  return { output, diagnostics };
}

function createTypeScriptTool(tool) {
  const input = textArea('', 14);
  const strict = check('Strict diagnostics', true);
  const target = select(['ES2020', 'ES2017', 'ES2015'], 'ES2020');
  const output = el('pre', { className: 'output' });
  const diagnostics = el('pre', { className: 'output' });
  const logs = el('pre', { className: 'output' });
  const result = el('pre', { className: 'output' });
  let compiled = '';

  function compile() {
    const resultValue = compileTypeScript(input.value, strict.input.checked);
    compiled = `// Target: ${target.value}\n${resultValue.output}`;
    output.textContent = compiled;
    diagnostics.textContent = resultValue.diagnostics.length ? resultValue.diagnostics.join('\n') : 'No lightweight diagnostics.';
    setStatus('TypeScript compiled to JavaScript.');
  }

  function run() {
    compile();
    runSandboxedJs(compiled, logs, result);
  }

  [input, strict.input, target].forEach((node) => node.addEventListener('input', compile));

  const root = el('div', { className: 'tool-content' },
    pane('TypeScript', el('div', { className: 'tool-content' }, field('Code', input), el('div', { className: 'grid-auto' }, strict.node, field('Target', target))), [
      button('Compile', compile, 'primary'),
      button('Run JS', run),
      button('Reset', () => { input.value = ''; compile(); logs.textContent = ''; result.textContent = ''; }, 'warn'),
    ]),
    el('div', { className: 'grid-2' },
      pane('Compiled JavaScript', output, [
        button('Copy', () => copyText(compiled)),
        button('Download', () => downloadText('compiled.js', compiled, 'text/javascript')),
      ]),
      pane('Diagnostics', diagnostics),
    ),
    el('div', { className: 'grid-2' },
      pane('Console', logs, [button('Copy', () => copyText(logs.textContent))]),
      pane('Result', result, [button('Copy', () => copyText(result.textContent))]),
    ),
  );

  return {
    root,
    loadExample(example) {
      input.value = example.code;
      strict.input.checked = example.strict ?? true;
      target.value = example.target || 'ES2020';
      compile();
    },
  };
}

function detectDelimiter(line) {
  const candidates = [',', '\t', ';', '|'];
  return candidates
    .map((delimiter) => ({ delimiter, count: line.split(delimiter).length }))
    .sort((a, b) => b.count - a.count)[0].delimiter;
}

function parseCsv(text, delimiter) {
  const rows = [];
  const errors = [];
  let row = [];
  let fieldValue = '';
  let quoted = false;
  let line = 1;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"') {
      if (quoted && next === '"') {
        fieldValue += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === delimiter && !quoted) {
      row.push(fieldValue);
      fieldValue = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(fieldValue);
      rows.push(row);
      row = [];
      fieldValue = '';
      line += 1;
    } else {
      fieldValue += char;
    }
  }
  if (fieldValue || row.length) {
    row.push(fieldValue);
    rows.push(row);
  }
  if (quoted) errors.push(`Unclosed quote near line ${line}.`);
  return { rows, errors };
}

function toCsvValue(value) {
  const text = String(value ?? '');
  return /[",\n\r\t;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function rowsToCsv(rows, delimiter) {
  return rows.map((row) => row.map(toCsvValue).join(delimiter)).join('\n');
}

function createCsvTool(tool) {
  const input = textArea('', 14);
  const delimiter = select([
    { value: 'auto', label: 'Auto' },
    { value: ',', label: 'Comma' },
    { value: '\\t', label: 'Tab' },
    { value: ';', label: 'Semicolon' },
    { value: '|', label: 'Pipe' },
  ], 'auto');
  const hasHeader = check('First row is header', true);
  const trimValues = check('Trim values', true);
  const issues = el('div', { className: 'light-output' });
  const preview = el('div', { className: 'light-output' });
  const csvOutput = el('pre', { className: 'output' });
  const jsonOutput = el('pre', { className: 'output' });
  let cleanCsv = '';
  let cleanJson = '';

  function clean() {
    const firstLine = input.value.split(/\r?\n/)[0] || '';
    const actualDelimiter = delimiter.value === 'auto' ? detectDelimiter(firstLine) : normalizeDelimiter(delimiter.value);
    const parsed = parseCsv(input.value, actualDelimiter);
    let rows = parsed.rows.filter((row) => row.some((cell) => cell.trim() !== ''));
    if (trimValues.input.checked) rows = rows.map((row) => row.map((cell) => cell.trim()));
    const expected = rows[0] ? rows[0].length : 0;
    const issueRows = [...parsed.errors];
    rows.forEach((row, index) => {
      if (row.length !== expected) issueRows.push(`Row ${index + 1} has ${row.length} columns; expected ${expected}.`);
    });
    if (hasHeader.input.checked && rows.length) {
      const header = rows[0];
      const duplicates = header.filter((name, index) => name && header.indexOf(name) !== index);
      if (duplicates.length) issueRows.push(`Duplicate headers: ${[...new Set(duplicates)].join(', ')}.`);
      header.forEach((name, columnIndex) => {
        const empty = rows.slice(1).every((row) => !row[columnIndex]);
        if (empty) issueRows.push(`Column "${name || columnIndex + 1}" is empty.`);
      });
    }

    cleanCsv = rowsToCsv(rows, actualDelimiter);
    cleanJson = JSON.stringify(csvRowsToJson(rows, hasHeader.input.checked), null, 2);
    csvOutput.textContent = cleanCsv;
    jsonOutput.textContent = cleanJson;
    renderIssues(issues, issueRows);
    renderTable(preview, rows.slice(0, 20));
    setStatus(`${rows.length} rows parsed with ${issueRows.length} issues.`);
  }

  [input, delimiter, hasHeader.input, trimValues.input].forEach((node) => node.addEventListener('input', clean));

  const root = el('div', { className: 'tool-content' },
    pane('CSV Input', field('CSV', input), [
      button('Clean', clean, 'primary'),
      button('Reset', () => { input.value = ''; clean(); }, 'warn'),
    ]),
    pane('Options', el('div', { className: 'grid-auto' }, field('Delimiter', delimiter), hasHeader.node, trimValues.node)),
    el('div', { className: 'grid-2' },
      pane('Issues', issues),
      pane('Preview', preview),
    ),
    el('div', { className: 'grid-2' },
      pane('Clean CSV', csvOutput, [
        button('Copy', () => copyText(cleanCsv)),
        button('Download', () => downloadText('clean.csv', cleanCsv, 'text/csv')),
      ]),
      pane('JSON', jsonOutput, [
        button('Copy', () => copyText(cleanJson)),
        button('Download', () => downloadText('rows.json', cleanJson, 'application/json')),
      ]),
    ),
  );

  return {
    root,
    loadExample(example) {
      input.value = example.input;
      delimiter.value = example.delimiter || 'auto';
      hasHeader.input.checked = example.hasHeader ?? true;
      trimValues.input.checked = example.trim ?? true;
      clean();
    },
  };
}

function csvRowsToJson(rows, hasHeader) {
  if (!hasHeader) return rows;
  const headers = rows[0] || [];
  return rows.slice(1).map((row) => headers.reduce((acc, header, index) => {
    acc[header || `column_${index + 1}`] = row[index] ?? '';
    return acc;
  }, {}));
}

function renderIssues(target, issues) {
  target.replaceChildren();
  if (!issues.length) {
    target.textContent = 'No issues found.';
    return;
  }
  const list = el('ul', { className: 'issue-list' });
  issues.forEach((issue) => list.appendChild(el('li', {}, issue)));
  target.appendChild(list);
}

function renderTable(target, rows) {
  target.replaceChildren();
  if (!rows.length) {
    target.textContent = 'No rows.';
    return;
  }
  const table = el('table', { className: 'data-table' }, el('tbody'));
  const tbody = table.querySelector('tbody');
  rows.forEach((row, rowIndex) => {
    const tr = el('tr');
    row.forEach((cell) => tr.appendChild(el(rowIndex === 0 ? 'th' : 'td', {}, cell)));
    tbody.appendChild(tr);
  });
  target.appendChild(table);
}

function formatInZone(date, timeZone) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'long',
    timeZone,
  }).format(date);
}

function parseDateValue(value) {
  const text = value.trim();
  if (!text) return null;
  if (/^-?\d+$/.test(text)) {
    const number = Number(text);
    return new Date(text.length <= 10 ? number * 1000 : number);
  }
  const parsed = Date.parse(text);
  return Number.isNaN(parsed) ? null : new Date(parsed);
}

function createDateTool(tool) {
  const input = textArea('', 10);
  const zone = select([
    'UTC',
    'Asia/Tokyo',
    'America/Los_Angeles',
    'America/New_York',
    'Europe/London',
    'Australia/Sydney',
  ], Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
  const tableOutput = el('div', { className: 'light-output' });
  const textOutput = el('pre', { className: 'output' });
  let outputText = '';

  function convert() {
    const rows = input.value.split(/\r?\n/).map(parseDateValue).map((date, index) => {
      const source = input.value.split(/\r?\n/)[index] || '';
      if (!date || Number.isNaN(date.getTime())) {
        return { source, error: 'Invalid date' };
      }
      return {
        source,
        iso: date.toISOString(),
        unixSeconds: Math.floor(date.getTime() / 1000),
        unixMs: date.getTime(),
        zone: formatInZone(date, zone.value),
      };
    }).filter((row) => row.source.trim());

    tableOutput.replaceChildren();
    if (!rows.length) {
      tableOutput.textContent = 'No dates.';
      outputText = '';
      textOutput.textContent = '';
      return;
    }
    const table = el('table', { className: 'data-table' },
      el('thead', {}, el('tr', {},
        el('th', {}, 'Input'),
        el('th', {}, 'ISO'),
        el('th', {}, 'Unix s'),
        el('th', {}, 'Unix ms'),
        el('th', {}, zone.value),
      )),
      el('tbody'),
    );
    const tbody = table.querySelector('tbody');
    rows.forEach((row) => {
      tbody.appendChild(el('tr', {},
        el('td', {}, row.source),
        el('td', {}, row.error || row.iso),
        el('td', {}, row.error || String(row.unixSeconds)),
        el('td', {}, row.error || String(row.unixMs)),
        el('td', {}, row.error || row.zone),
      ));
    });
    tableOutput.appendChild(table);
    outputText = rows.map((row) => row.error
      ? `${row.source}\t${row.error}`
      : `${row.source}\t${row.iso}\t${row.unixSeconds}\t${row.unixMs}\t${row.zone}`).join('\n');
    textOutput.textContent = outputText;
    setStatus(`${rows.length} dates converted.`);
  }

  [input, zone].forEach((node) => node.addEventListener('input', convert));

  const root = el('div', { className: 'tool-content' },
    pane('Input', field('Dates and timestamps', input), [
      button('Convert', convert, 'primary'),
      button('Now', () => { input.value = new Date().toISOString(); convert(); }),
      button('Reset', () => { input.value = ''; convert(); }, 'warn'),
    ]),
    pane('Options', field('Timezone', zone)),
    pane('Converted Table', tableOutput),
    pane('Export Text', textOutput, [
      button('Copy', () => copyText(outputText)),
      button('Download', () => downloadText('dates.tsv', outputText, 'text/tab-separated-values')),
    ]),
  );

  return {
    root,
    loadExample(example) {
      input.value = example.input;
      zone.value = example.zone || zone.value;
      convert();
    },
  };
}

function parseChecklist(text) {
  return text.split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const match = line.match(/^-?\s*\[(x| )\]\s*(.+)$/i);
      return {
        id: `${Date.now()}-${index}-${Math.random()}`,
        text: match ? match[2] : line.replace(/^[-*]\s*/, ''),
        done: match ? match[1].toLowerCase() === 'x' : false,
      };
    });
}

function checklistToMarkdown(items) {
  return items.map((item) => `- [${item.done ? 'x' : ' '}] ${item.text}`).join('\n');
}

function createChecklistTool(tool) {
  const storageKey = 'common-tools-checklist';
  const source = textArea('', 10);
  const newItem = el('input', { type: 'text' });
  const list = el('ul', { className: 'checklist' });
  const progressBar = el('span');
  const progressText = el('p', { className: 'status-line' });
  const markdown = el('pre', { className: 'output' });
  let items = [];

  function save() {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }

  function render() {
    list.replaceChildren();
    items.forEach((item) => {
      const checkbox = el('input', { type: 'checkbox', checked: item.done, onInput: () => {
        item.done = checkbox.checked;
        render();
      } });
      const textInput = el('input', { type: 'text', value: item.text, onInput: () => {
        item.text = textInput.value;
        renderOutput();
      } });
      list.appendChild(el('li', {},
        checkbox,
        textInput,
        button('Remove', () => {
          items = items.filter((entry) => entry.id !== item.id);
          render();
        }, 'warn'),
      ));
    });
    renderOutput();
  }

  function renderOutput() {
    const done = items.filter((item) => item.done).length;
    const percent = items.length ? Math.round((done / items.length) * 100) : 0;
    progressBar.style.width = `${percent}%`;
    progressText.textContent = `${done}/${items.length} complete (${percent}%).`;
    markdown.textContent = checklistToMarkdown(items);
    save();
    setStatus(`${items.length} checklist items.`);
  }

  function loadFromSource() {
    items = parseChecklist(source.value);
    render();
  }

  function addItem() {
    if (!newItem.value.trim()) return;
    items.push({ id: `${Date.now()}-${Math.random()}`, text: newItem.value.trim(), done: false });
    newItem.value = '';
    render();
  }

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (Array.isArray(saved)) items = saved;
  } catch (error) {
    items = [];
  }

  const root = el('div', { className: 'tool-content' },
    pane('Import Items', field('Lines or Markdown checklist', source), [
      button('Load Lines', loadFromSource, 'primary'),
      button('Reset', () => { source.value = ''; items = []; render(); }, 'warn'),
    ]),
    pane('Checklist', el('div', { className: 'tool-content' },
      el('div', { className: 'grid-auto' }, field('New item', newItem), el('div', { className: 'field-row' }, el('span', { className: 'field-label' }, 'Progress'), el('div', { className: 'progress' }, progressBar), progressText)),
      list,
    ), [
      button('Add', addItem, 'primary'),
      button('Clear Done', () => { items = items.filter((item) => !item.done); render(); }),
    ]),
    pane('Markdown', markdown, [
      button('Copy', () => copyText(markdown.textContent)),
      button('Download MD', () => downloadText('checklist.md', markdown.textContent, 'text/markdown')),
      button('Download JSON', () => downloadText('checklist.json', JSON.stringify(items, null, 2), 'application/json')),
    ]),
  );

  render();
  newItem.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') addItem();
  });

  return {
    root,
    loadExample(example) {
      source.value = example.input;
      items = parseChecklist(example.input);
      render();
    },
  };
}

const tools = [
  {
    id: 'json',
    name: 'JSON Formatter and Validator',
    short: 'Format, validate, paths, types',
    group: 'Data',
    summary: 'Format, minify, sort keys, inspect paths, and generate TypeScript interfaces.',
    render: createJsonTool,
    examples: [
      { label: 'API Response', input: '{"user":{"id":42,"name":"Ada Lovelace","roles":["admin","editor"]},"active":true,"lastLogin":"2026-06-25T09:20:00Z"}' },
      { label: 'Package Config', input: '{"name":"rondina-tools","version":"1.0.0","scripts":{"build":"vite build","test":"node --test"},"private":true}' },
      { label: 'Nested Rows', input: '{"rows":[{"id":"A-1","amount":1200,"tags":["new","paid"]},{"id":"A-2","amount":0,"tags":[]}],"total":2}' },
    ],
  },
  {
    id: 'diff',
    name: 'Code Diff Viewer',
    short: 'Side-by-side and patch output',
    group: 'Code',
    summary: 'Compare two text inputs, switch diff views, ignore whitespace, and copy patch output.',
    render: createDiffTool,
    examples: [
      { label: 'Function Change', left: 'function total(items) {\n  return items.length;\n}\n', right: 'function total(items) {\n  return items.reduce((sum, item) => sum + item.amount, 0);\n}\n' },
      { label: 'Config Update', left: 'timeout=30\nretries=2\nmode=dev', right: 'timeout=45\nretries=3\nmode=prod\nregion=ap-northeast-1' },
      { label: 'Whitespace', left: 'const value = 1;\nconsole.log(value);', right: 'const   value = 1;\nconsole.log(value);', ignore: true },
    ],
  },
  {
    id: 'html',
    name: 'HTML Playground',
    short: 'HTML, CSS, JS preview',
    group: 'Code',
    summary: 'Edit HTML, CSS, and JavaScript with sandboxed preview, console output, and HTML export.',
    render: createHtmlTool,
    examples: [
      { label: 'Dashboard Tile', html: '<main class="tile"><strong>Open Cases</strong><span>18</span></main>', css: 'body { font-family: system-ui; padding: 32px; background: #f3f7f4; }\n.tile { display: grid; gap: 8px; width: 220px; padding: 20px; border: 1px solid #bfd0c3; border-radius: 8px; background: white; }\n.tile span { font-size: 42px; color: #1f6b54; }', js: 'console.log("Preview loaded");' },
      { label: 'Form', html: '<label>Name <input id="name"></label><button id="save">Save</button><p id="out"></p>', css: 'body { font-family: system-ui; display: grid; gap: 12px; padding: 24px; }\ninput, button { padding: 8px; }', js: 'document.getElementById("save").onclick = () => {\n  document.getElementById("out").textContent = `Saved ${document.getElementById("name").value}`;\n};' },
      { label: 'Responsive List', html: '<ul><li>Plan</li><li>Build</li><li>Verify</li></ul>', css: 'body { font-family: system-ui; padding: 24px; }\nul { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; padding: 0; }\nli { list-style: none; border: 1px solid #ccd8d0; border-radius: 8px; padding: 14px; }', js: 'console.log(document.querySelectorAll("li").length, "items");' },
    ],
  },
  {
    id: 'javascript',
    name: 'JavaScript Playground',
    short: 'Run snippets safely',
    group: 'Code',
    summary: 'Run browser JavaScript snippets in a sandbox and capture logs, errors, result, and timing.',
    render: createJavaScriptTool,
    examples: [
      { label: 'Arrays', code: 'const amounts = [12, 18, 4, 31];\nconsole.log("max", Math.max(...amounts));\nreturn amounts.filter((n) => n > 10).map((n) => n * 2);' },
      { label: 'Dates', code: 'const dates = ["2026-06-25", "2026-07-01"];\nreturn dates.map((value) => new Date(value).toISOString());' },
      { label: 'Fetch Mock', code: 'const fetch = async () => ({ json: async () => ({ status: "ok", count: 3 }) });\nreturn fetch("/api/items").then((response) => response.json());' },
    ],
  },
  {
    id: 'typescript',
    name: 'TypeScript Playground',
    short: 'Compile and run JS output',
    group: 'Code',
    summary: 'Compile common TypeScript snippets to JavaScript, show lightweight diagnostics, and run the output.',
    render: createTypeScriptTool,
    examples: [
      { label: 'Typed Function', code: 'interface Account {\n  id: string;\n  name: string;\n  amount: number;\n}\n\nfunction labelAccount(account: Account): string {\n  return `${account.name} (${account.amount})`;\n}\n\nconst account: Account = { id: "001", name: "Acme", amount: 4200 };\nreturn labelAccount(account);' },
      { label: 'Generic Helper', code: 'function first<T>(items: T[]): T {\n  return items[0];\n}\n\nconst names: string[] = ["Ada", "Grace"];\nreturn first<string>(names);' },
      { label: 'Diagnostic', code: 'const total: number = "100";\nreturn total;', strict: true },
    ],
  },
  {
    id: 'regex',
    name: 'Regex Tester',
    short: 'Matches, groups, replacement',
    group: 'Code',
    summary: 'Test JavaScript regex patterns, inspect capture groups, and preview replacements.',
    render: createRegexTool,
    examples: [
      { label: 'Emails', pattern: '[\\w.-]+@[\\w.-]+\\.\\w+', flags: 'gim', sample: 'ada@example.com\nnot an email\ngrace.hopper@navy.mil', replacement: '[email]' },
      { label: 'IDs', pattern: '\\b[A-Z]{3}-\\d{4}\\b', flags: 'g', sample: 'Tickets: OPS-1024, BAD-1, CRM-2048', replacement: 'ID:$&' },
      { label: 'Named Parts', pattern: '(\\w+):\\s*(\\d+)', flags: 'g', sample: 'apples: 12\noranges: 7', replacement: '$1=$2' },
    ],
  },
  {
    id: 'csv',
    name: 'CSV Cleaner and Validator',
    short: 'Clean rows and export JSON',
    group: 'Admin',
    summary: 'Parse CSV, detect row/header issues, trim values, preview rows, and export cleaned data.',
    render: createCsvTool,
    examples: [
      { label: 'Contacts', input: 'Name,Email,Role\n Ada Lovelace , ada@example.com , Admin\n Grace Hopper,grace@example.com,Developer\nAlan Turing,,Analyst' },
      { label: 'Duplicate Header', input: 'Id,Name,Name\n1,Acme,Acme Inc\n2,Global,Global LLC' },
      { label: 'Semicolon', input: 'Key;Value;Owner\nfeature_a;true;Ops\nfeature_b;false;Admin', delimiter: ';' },
    ],
  },
  {
    id: 'text',
    name: 'Bulk Text Transformer',
    short: 'Trim, case, sort, dedupe',
    group: 'Text',
    summary: 'Transform line-based text with trimming, case conversion, replacement, sorting, dedupe, and wrappers.',
    render: createTextTool,
    examples: [
      { label: 'Emails', input: ' Ada@Example.com \nGRACE@example.com\nada@example.com\n', caseMode: 'lower', dedupe: true, sort: true },
      { label: 'API Names', input: 'Account Name\nClose Date\nOwner Email', caseMode: 'camel', suffix: '__c' },
      { label: 'CSV to Lines', input: '001,002,003,004', splitBy: ',', joinBy: '\\n', prefix: 'Id: ' },
    ],
  },
  {
    id: 'date',
    name: 'Date and Time Converter',
    short: 'ISO, Unix, timezones',
    group: 'Utility',
    summary: 'Convert ISO strings, Unix timestamps, and common date strings across useful timezones.',
    render: createDateTool,
    examples: [
      { label: 'Mixed', input: '2026-06-25T09:20:00Z\n1782360000\n1782360000000', zone: 'Asia/Tokyo' },
      { label: 'US Release', input: '2026-07-01T09:00:00-04:00\n2026-07-01T13:00:00Z', zone: 'America/New_York' },
      { label: 'UTC Batch', input: '2026-01-01\n2026-12-31T23:59:59Z', zone: 'UTC' },
    ],
  },
  {
    id: 'checklist',
    name: 'Checklist Builder',
    short: 'Markdown and JSON export',
    group: 'Admin',
    summary: 'Create reusable checklists with progress state, Markdown copy, and JSON export.',
    render: createChecklistTool,
    autoLoadExample: false,
    examples: [
      { label: 'Deploy', input: '- [ ] Confirm target org\n- [ ] Run tests\n- [ ] Deploy metadata\n- [ ] Verify login path\n- [ ] Share release note' },
      { label: 'Audit', input: '- [x] Export users\n- [ ] Review inactive users\n- [ ] Check admin profiles\n- [ ] Save evidence' },
      { label: 'Onboarding', input: 'Create user\nAssign permission set\nSend welcome email\nSchedule walkthrough' },
    ],
  },
];

renderTools();
openTool((location.hash || '').replace('#', '') || 'json');
