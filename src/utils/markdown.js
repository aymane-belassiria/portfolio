// Minimal markdown renderer for the FileViewer.
// Handles: # / ## / ### headings, bold **x**, italic *x*, inline code `x`,
// links [label](url), bare URLs, unordered lists `- x`, blockquotes `> x`,
// horizontal rules `---`, and GitHub-flavored pipe tables.
// Block elements split on blank lines.

import React from 'react';

const URL_REGEX = /(https?:\/\/[^\s)]+)/g;

function renderInline(text, keyPrefix = 'i') {
  // Order matters: bold before italic; links before bare URLs; code last so it can override.
  const tokens = [];
  let remaining = text;
  let cursor = 0;
  const inline = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let match;
  let lastIndex = 0;
  while ((match = inline.exec(remaining)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(remaining.slice(lastIndex, match.index));
    }
    if (match[1]) {
      tokens.push(<strong key={`${keyPrefix}-b-${cursor++}`}>{match[2]}</strong>);
    } else if (match[3]) {
      tokens.push(<em key={`${keyPrefix}-i-${cursor++}`}>{match[4]}</em>);
    } else if (match[5]) {
      tokens.push(<code key={`${keyPrefix}-c-${cursor++}`}>{match[6]}</code>);
    } else if (match[7]) {
      tokens.push(
        <a
          key={`${keyPrefix}-a-${cursor++}`}
          href={match[9]}
          target="_blank"
          rel="noopener noreferrer"
        >
          {match[8]}
        </a>
      );
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < remaining.length) {
    tokens.push(remaining.slice(lastIndex));
  }
  // Linkify bare URLs in text-only tokens.
  return tokens.flatMap((tok, ti) => {
    if (typeof tok !== 'string') return [tok];
    const parts = tok.split(URL_REGEX);
    return parts.map((part, pi) => {
      if (URL_REGEX.test(part)) {
        URL_REGEX.lastIndex = 0;
        return (
          <a
            key={`${keyPrefix}-u-${ti}-${pi}`}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
          >
            {part}
          </a>
        );
      }
      URL_REGEX.lastIndex = 0;
      return part;
    });
  });
}

function parseTable(lines, keyPrefix) {
  const splitCells = (line) =>
    line
      .trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((c) => c.trim());
  const header = splitCells(lines[0]);
  const rows = lines.slice(2).map(splitCells);
  return (
    <table key={keyPrefix} className="md-table">
      <thead>
        <tr>
          {header.map((h, i) => (
            <th key={i}>{renderInline(h, `${keyPrefix}-h-${i}`)}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri}>
            {row.map((cell, ci) => (
              <td key={ci}>{renderInline(cell, `${keyPrefix}-r-${ri}-${ci}`)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function renderMarkdown(text) {
  const lines = text.split('\n');
  const blocks = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (/^\s*$/.test(line)) {
      i++;
      continue;
    }

    if (/^###\s+/.test(line)) {
      blocks.push(<h3 key={key++}>{renderInline(line.replace(/^###\s+/, ''), `k${key}`)}</h3>);
      i++;
      continue;
    }
    if (/^##\s+/.test(line)) {
      blocks.push(<h2 key={key++}>{renderInline(line.replace(/^##\s+/, ''), `k${key}`)}</h2>);
      i++;
      continue;
    }
    if (/^#\s+/.test(line)) {
      blocks.push(<h1 key={key++}>{renderInline(line.replace(/^#\s+/, ''), `k${key}`)}</h1>);
      i++;
      continue;
    }

    if (/^---+\s*$/.test(line)) {
      blocks.push(<hr key={key++} />);
      i++;
      continue;
    }

    // table: header | row | --- | data rows
    if (line.includes('|') && i + 1 < lines.length && /^\s*\|?[-:|\s]+\|?\s*$/.test(lines[i + 1])) {
      const tableLines = [line, lines[i + 1]];
      let j = i + 2;
      while (j < lines.length && lines[j].includes('|') && !/^\s*$/.test(lines[j])) {
        tableLines.push(lines[j]);
        j++;
      }
      blocks.push(parseTable(tableLines, `t${key++}`));
      i = j;
      continue;
    }

    if (/^>\s/.test(line)) {
      const quoteLines = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      blocks.push(
        <blockquote key={key++}>{renderInline(quoteLines.join(' '), `q${key}`)}</blockquote>
      );
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ''));
        i++;
      }
      const ulKey = key++;
      blocks.push(
        <ul key={ulKey}>
          {items.map((it, idx) => (
            <li key={idx}>{renderInline(it, `l${ulKey}-${idx}`)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // paragraph: gather consecutive non-empty, non-special lines
    const paraLines = [line];
    let j = i + 1;
    while (
      j < lines.length &&
      lines[j].trim() &&
      !/^#{1,3}\s/.test(lines[j]) &&
      !/^[-*]\s+/.test(lines[j]) &&
      !/^>\s/.test(lines[j]) &&
      !/^---+\s*$/.test(lines[j])
    ) {
      paraLines.push(lines[j]);
      j++;
    }
    blocks.push(
      <p key={key++}>{renderInline(paraLines.join(' '), `p${key}`)}</p>
    );
    i = j;
  }

  return blocks;
}
