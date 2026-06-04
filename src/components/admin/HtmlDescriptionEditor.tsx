'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  Link,
  List,
  ListOrdered,
  Pilcrow,
  Redo2,
  Underline,
  Undo2,
} from 'lucide-react';

type HtmlDescriptionEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

function cleanEditorHtml(html: string) {
  return html
    .replace(/<div><br><\/div>/g, '<p><br></p>')
    .replace(/<div>/g, '<p>')
    .replace(/<\/div>/g, '</p>')
    .trim();
}

export function HtmlDescriptionEditor({
  value,
  onChange,
}: HtmlDescriptionEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [htmlMode, setHtmlMode] = useState(false);
  const [sourceValue, setSourceValue] = useState(value || '');

  useEffect(() => {
    if (!htmlMode && editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }

    if (htmlMode) {
      setSourceValue(value || '');
    }
  }, [value, htmlMode]);

  function runCommand(command: string, commandValue?: string) {
    document.execCommand(command, false, commandValue);
    syncValue();
  }

  function syncValue() {
    if (!editorRef.current) return;
    onChange(cleanEditorHtml(editorRef.current.innerHTML));
  }

  function setBlock(tag: string) {
    runCommand('formatBlock', tag);
  }

  function insertLink() {
    const url = window.prompt('Enter URL');
    if (!url) return;
    runCommand('createLink', url);
  }

  function insertImage() {
    const url = window.prompt('Enter image URL');
    if (!url) return;
    runCommand('insertImage', url);
  }

  function toggleHtmlMode() {
    if (htmlMode) {
      onChange(sourceValue);
    } else {
      setSourceValue(value || '');
    }

    setHtmlMode((prev) => !prev);
  }

  const toolbarButtonClass =
    'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50';

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-300 bg-white">
      <div className="flex items-center gap-1 overflow-x-auto border-b border-gray-200 bg-gray-50 px-3 py-2">
        <button
          type="button"
          onClick={() => setBlock('p')}
          className={toolbarButtonClass}
          title="Paragraph"
        >
          <Pilcrow size={15} />
        </button>

        <button
          type="button"
          onClick={() => setBlock('h2')}
          className={toolbarButtonClass}
          title="Heading 2"
        >
          <Heading2 size={15} />
        </button>

        <button
          type="button"
          onClick={() => setBlock('h3')}
          className={toolbarButtonClass}
          title="Heading 3"
        >
          <Heading3 size={15} />
        </button>

        <span className="mx-1 h-6 w-px bg-gray-200" />

        <button
          type="button"
          onClick={() => runCommand('bold')}
          className={toolbarButtonClass}
          title="Bold"
        >
          <Bold size={15} />
        </button>

        <button
          type="button"
          onClick={() => runCommand('italic')}
          className={toolbarButtonClass}
          title="Italic"
        >
          <Italic size={15} />
        </button>

        <button
          type="button"
          onClick={() => runCommand('underline')}
          className={toolbarButtonClass}
          title="Underline"
        >
          <Underline size={15} />
        </button>

        <span className="mx-1 h-6 w-px bg-gray-200" />

        <button
          type="button"
          onClick={() => runCommand('justifyLeft')}
          className={toolbarButtonClass}
          title="Align left"
        >
          <AlignLeft size={15} />
        </button>

        <button
          type="button"
          onClick={() => runCommand('justifyCenter')}
          className={toolbarButtonClass}
          title="Align center"
        >
          <AlignCenter size={15} />
        </button>

        <button
          type="button"
          onClick={() => runCommand('justifyRight')}
          className={toolbarButtonClass}
          title="Align right"
        >
          <AlignRight size={15} />
        </button>

        <span className="mx-1 h-6 w-px bg-gray-200" />

        <button
          type="button"
          onClick={() => runCommand('insertUnorderedList')}
          className={toolbarButtonClass}
          title="Bullet list"
        >
          <List size={15} />
        </button>

        <button
          type="button"
          onClick={() => runCommand('insertOrderedList')}
          className={toolbarButtonClass}
          title="Numbered list"
        >
          <ListOrdered size={15} />
        </button>

        <button
          type="button"
          onClick={insertLink}
          className={toolbarButtonClass}
          title="Link"
        >
          <Link size={15} />
        </button>

        <button
          type="button"
          onClick={insertImage}
          className={toolbarButtonClass}
          title="Image URL"
        >
          <ImageIcon size={15} />
        </button>

        <span className="mx-1 h-6 w-px bg-gray-200" />

        <button
          type="button"
          onClick={() => runCommand('undo')}
          className={toolbarButtonClass}
          title="Undo"
        >
          <Undo2 size={15} />
        </button>

        <button
          type="button"
          onClick={() => runCommand('redo')}
          className={toolbarButtonClass}
          title="Redo"
        >
          <Redo2 size={15} />
        </button>

        <button
          type="button"
          onClick={toggleHtmlMode}
          className="ml-auto inline-flex h-8 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          <Code2 size={15} />
          HTML
        </button>
      </div>

      {htmlMode ? (
        <textarea
          value={sourceValue}
          onChange={(e) => {
            setSourceValue(e.target.value);
            onChange(e.target.value);
          }}
          className="min-h-[320px] w-full resize-y bg-white px-4 py-3 font-mono text-sm text-gray-900 outline-none"
          placeholder="<h2>Heading</h2><p>Description...</p>"
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={syncValue}
          onBlur={syncValue}
          className="prose prose-sm max-w-none min-h-[320px] px-4 py-3 text-gray-900 outline-none"
        />
      )}
    </div>
  );
}