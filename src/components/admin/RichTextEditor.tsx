'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  Image,
  Italic,
  Link,
  List,
  ListOrdered,
  Redo2,
  Underline,
  Undo2,
} from 'lucide-react';

type RichTextEditorProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  minHeight?: number;
};

function decodeHtmlEntities(html: string) {
  if (typeof window === 'undefined') return html;

  const textarea = document.createElement('textarea');
  textarea.innerHTML = html;
  return textarea.value;
}

function normalizeEditorHtml(html: string) {
  if (!html) return '';

  let nextHtml = String(html);

  const looksEscaped =
    nextHtml.includes('&lt;') ||
    nextHtml.includes('&gt;') ||
    nextHtml.includes('&amp;lt;') ||
    nextHtml.includes('&amp;gt;');

  if (looksEscaped) {
    nextHtml = decodeHtmlEntities(nextHtml);
  }

  return nextHtml;
}

function removeUnwantedDivTags(html: string) {
  if (!html) return '';

  return html
    .replace(/<div><br><\/div>/gi, '')
    .replace(/<div><\/div>/gi, '')
    .replace(/<div>/gi, '<p>')
    .replace(/<\/div>/gi, '</p>')
    .replace(/<p><br><\/p>/gi, '')
    .replace(/<p>\s*<\/p>/gi, '')
    .trim();
}

function cleanHtmlSource(html: string) {
  const normalized = normalizeEditorHtml(html);
  return removeUnwantedDivTags(normalized);
}

export function RichTextEditor({
  label = 'Description',
  value,
  onChange,
  minHeight = 260,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const lastRenderedHtmlRef = useRef('');

  const [htmlMode, setHtmlMode] = useState(false);
  const [htmlValue, setHtmlValue] = useState(cleanHtmlSource(value || ''));

  useEffect(() => {
    const nextValue = cleanHtmlSource(value || '');
    setHtmlValue(nextValue);

    if (!htmlMode && editorRef.current && lastRenderedHtmlRef.current !== nextValue) {
      editorRef.current.innerHTML = nextValue;
      lastRenderedHtmlRef.current = nextValue;
    }
  }, [value, htmlMode]);

  function updateValue(nextHtml: string) {
    const cleanHtml = cleanHtmlSource(nextHtml);

    setHtmlValue(cleanHtml);
    lastRenderedHtmlRef.current = cleanHtml;
    onChange(cleanHtml);
  }

  function getCurrentEditorHtml() {
    if (!editorRef.current) return htmlValue || '';

    const currentHtml = editorRef.current.innerHTML || '';
    return cleanHtmlSource(currentHtml);
  }

  function runCommand(command: string, commandValue?: string) {
    if (htmlMode) return;

    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);

    updateValue(getCurrentEditorHtml());
  }

  function changeBlock(block: string) {
    if (htmlMode) return;

    editorRef.current?.focus();
    document.execCommand('formatBlock', false, block);

    updateValue(getCurrentEditorHtml());
  }

  function addLink() {
    if (htmlMode) return;

    const url = window.prompt('Enter link URL');
    if (!url) return;

    runCommand('createLink', url);
  }

  function addImage() {
    if (htmlMode) return;

    const url = window.prompt('Enter image URL');
    if (!url) return;

    runCommand('insertImage', url);
  }

  function handleNormalEditorInput() {
    updateValue(getCurrentEditorHtml());
  }

  function handleHtmlChange(nextHtml: string) {
    const cleanHtml = cleanHtmlSource(nextHtml);

    setHtmlValue(cleanHtml);
    lastRenderedHtmlRef.current = cleanHtml;
    onChange(cleanHtml);
  }

  function switchToHtmlMode() {
    const currentHtml = getCurrentEditorHtml();

    setHtmlValue(currentHtml);
    onChange(currentHtml);
    setHtmlMode(true);
  }

  function switchToPreviewMode() {
    const latestHtml = cleanHtmlSource(htmlValue || '');

    setHtmlMode(false);
    onChange(latestHtml);

    window.setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = latestHtml;
        lastRenderedHtmlRef.current = latestHtml;
      }
    }, 0);
  }

  function toggleHtmlMode() {
    if (htmlMode) {
      switchToPreviewMode();
    } else {
      switchToHtmlMode();
    }
  }

  const toolbarButtonClass =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <div className="block">
      {label && <span className="mb-1 block text-sm font-medium">{label}</span>}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap border-b border-gray-200 bg-gray-50 px-2 py-2">
          <select
            className="h-9 shrink-0 rounded-lg border border-gray-200 bg-white px-2 text-sm shadow-sm outline-none disabled:opacity-50"
            defaultValue="p"
            onChange={(e) => changeBlock(e.target.value)}
            disabled={htmlMode}
          >
            <option value="p">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
          </select>

          <button
            type="button"
            className={toolbarButtonClass}
            onClick={() => runCommand('bold')}
            disabled={htmlMode}
            title="Bold"
          >
            <Bold size={17} />
          </button>

          <button
            type="button"
            className={toolbarButtonClass}
            onClick={() => runCommand('italic')}
            disabled={htmlMode}
            title="Italic"
          >
            <Italic size={17} />
          </button>

          <button
            type="button"
            className={toolbarButtonClass}
            onClick={() => runCommand('underline')}
            disabled={htmlMode}
            title="Underline"
          >
            <Underline size={17} />
          </button>

          <button
            type="button"
            className={toolbarButtonClass}
            onClick={() => runCommand('justifyLeft')}
            disabled={htmlMode}
            title="Align left"
          >
            <AlignLeft size={16} />
          </button>

          <button
            type="button"
            className={toolbarButtonClass}
            onClick={() => runCommand('justifyCenter')}
            disabled={htmlMode}
            title="Align center"
          >
            <AlignCenter size={17} />
          </button>

          <button
            type="button"
            className={toolbarButtonClass}
            onClick={() => runCommand('justifyRight')}
            disabled={htmlMode}
            title="Align right"
          >
            <AlignRight size={17} />
          </button>

          <button
            type="button"
            className={toolbarButtonClass}
            onClick={() => runCommand('insertUnorderedList')}
            disabled={htmlMode}
            title="Bullet list"
          >
            <List size={17} />
          </button>

          <button
            type="button"
            className={toolbarButtonClass}
            onClick={() => runCommand('insertOrderedList')}
            disabled={htmlMode}
            title="Numbered list"
          >
            <ListOrdered size={17} />
          </button>

          <button
            type="button"
            className={toolbarButtonClass}
            onClick={addLink}
            disabled={htmlMode}
            title="Add link"
          >
            <Link size={17} />
          </button>

          <button
            type="button"
            className={toolbarButtonClass}
            onClick={addImage}
            disabled={htmlMode}
            title="Insert image URL"
          >
            <Image size={17} />
          </button>

          <button
            type="button"
            className={toolbarButtonClass}
            onClick={() => runCommand('undo')}
            disabled={htmlMode}
            title="Undo"
          >
            <Undo2 size={17} />
          </button>

          <button
            type="button"
            className={toolbarButtonClass}
            onClick={() => runCommand('redo')}
            disabled={htmlMode}
            title="Redo"
          >
            <Redo2 size={17} />
          </button>

          <button
            type="button"
            onClick={toggleHtmlMode}
            className={`flex h-9 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-semibold shadow-sm transition ${
              htmlMode
                ? 'border-black bg-black text-white'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            }`}
            title="HTML editor"
          >
            <Code2 size={17} />
            {htmlMode ? 'Preview' : 'HTML'}
          </button>
        </div>

        {htmlMode ? (
          <textarea
            className="w-full resize-y border-0 bg-white px-4 py-3 font-mono text-sm leading-6 text-gray-900 outline-none"
            style={{ minHeight }}
            value={htmlValue}
            onChange={(e) => handleHtmlChange(e.target.value)}
            placeholder="<h2>Heading</h2>&#10;<p>Paragraph content here...</p>"
            spellCheck={false}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleNormalEditorInput}
            onBlur={handleNormalEditorInput}
            className="
              max-w-none px-4 py-3 text-sm leading-6 text-gray-900 outline-none
              [&_h1]:mb-4 [&_h1]:mt-4 [&_h1]:text-3xl [&_h1]:font-bold
              [&_h2]:mb-3 [&_h2]:mt-3 [&_h2]:text-2xl [&_h2]:font-bold
              [&_h3]:mb-2 [&_h3]:mt-2 [&_h3]:text-xl [&_h3]:font-semibold
              [&_h4]:mb-2 [&_h4]:mt-2 [&_h4]:text-lg [&_h4]:font-semibold
              [&_p]:mb-3
              [&_ul]:ml-6 [&_ul]:list-disc
              [&_ol]:ml-6 [&_ol]:list-decimal
              [&_a]:text-blue-600 [&_a]:underline
              [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic
              [&_img]:my-3 [&_img]:max-w-full [&_img]:rounded-lg
            "
            style={{ minHeight }}
          />
        )}
      </div>

      <p className="mt-1 text-xs text-gray-500">
        Use Preview for normal editing, or HTML to edit clean heading and paragraph source.
      </p>
    </div>
  );
}