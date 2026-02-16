import { LitElement, html, css, type PropertyValueMap } from 'lit';
import { property, query } from 'lit/decorators.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import type * as AceGlobal from 'ace-builds';
import 'ace-builds/src-noconflict/ace.js';
import 'ace-builds/src-noconflict/theme-sqlserver.js';
import 'ace-builds/src-noconflict/mode-xml.js';
import 'ace-builds/src-noconflict/ext-searchbox.js';
import type AceEditor from 'ace-custom-element';

import { EditV2 } from '@openscd/oscd-api';

declare global {
  interface Window {
    ace: typeof AceGlobal;
  }
}

const serializer = new XMLSerializer();
const parser = new DOMParser();

const ACE_DEFAULT_OPTIONS = {
  fontSize: '14',
  theme: 'ace/theme/sqlserver',
  mode: 'ace/mode/xml',
};
const storageKey = 'oscd:ace-options';

const getStoredAceOptions = (): Omit<
  Partial<AceGlobal.Ace.EditorOptions>,
  'theme' | 'mode'
> &
  Pick<AceGlobal.Ace.EditorOptions, 'theme' | 'mode'> => {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      return {
        ...ACE_DEFAULT_OPTIONS,
        ...JSON.parse(stored),
      };
    }
  } catch (error) {
    console.warn('Failed to retrieve Ace options from storage:', error);
  }
  return ACE_DEFAULT_OPTIONS;
};

let aceOptions = getStoredAceOptions();

function manageAceOptionChange(editor: AceGlobal.Ace.Editor) {
  editor.setOptions(aceOptions);

  const originalSetOption = editor.setOption.bind(editor);
  const originalSetOptions = editor.setOptions.bind(editor);
  const persistOptions = () => {
    try {
      aceOptions = {
        ...ACE_DEFAULT_OPTIONS,
        ...editor.getOptions(),
      };
      localStorage.setItem(storageKey, JSON.stringify(aceOptions));
    } catch (error) {
      console.warn('Failed to store Ace options:', error);
    }
  };

  editor.setOption = (name: string, value: unknown) => {
    originalSetOption(
      name as keyof AceGlobal.Ace.EditorOptions,
      value as never,
    );
    persistOptions();
  };

  editor.setOptions = (options: Partial<AceGlobal.Ace.EditorOptions>) => {
    originalSetOptions(options);
    persistOptions();
  };
}

export function parseXml(xml: string): XMLDocument {
  const parsed = parser.parseFromString(xml, 'application/xml');
  const parseError = parsed.querySelector('parsererror');
  if (parseError) {
    const error = new Error(parseError.textContent ?? 'Invalid XML');
    console.error('XML Parsing Error:', error);
  }
  return parsed;
}

export function serializeXml(xml: XMLDocument | Element): string {
  return serializer.serializeToString(xml);
}

export function formatXml(
  rawXml: string | undefined,
  initialIndent: string = '',
): string {
  if (!rawXml) {
    return '';
  }

  // Trim leading and trailing whitespace to avoid injecting extra < or >
  const xml = rawXml.trim();

  let formatted = '';
  let indent = '';

  const tab = '\t';
  const nodes = xml.split(/>\s*</);
  nodes.forEach(function (node, index) {
    // Remove leading < from first node and trailing > from last node. Allow for selection leading or trailing whitespace.
    if (index === 0) {
      node = node.replace(/^\s*</, '');
    }
    if (index === nodes.length - 1) {
      node = node.replace(/>\s*$/, '');
    }

    if (node.match(/^\/\w/)) {
      indent = indent.substring(tab!.length);
    }
    formatted += initialIndent + indent + '<' + node + '>\r\n';
    if (node.match(/^<?\w[^>]*[^/]$/)) {
      indent += tab;
    }
  });

  return formatted.trim();
}

export function newOscdTextEditV2({
  element,
  newText,
}: {
  element: Element;
  newText: string;
}): EditV2[] | null {
  let newDoc: XMLDocument | null = null;
  try {
    newDoc = newText ? parseXml(newText) : null;
  } catch (error) {
    console.error('Failed to parse XML:', error);
    return null;
  }
  if (element) {
    // get the parent and if we don't have a parent, use the documentElement
    const parent = element.parentElement ?? element.ownerDocument;
    const nextSibling = element.nextSibling ?? null;
    const newElement = newDoc
      ? element.ownerDocument.importNode(newDoc?.documentElement, true)
      : null;

    return [
      { node: element },
      ...(newElement
        ? [
            {
              node: newElement,
              parent,
              reference: nextSibling,
            },
          ]
        : []),
    ] as EditV2[];
  }
  return null;
}

class BaseElement extends ScopedElementsMixin(LitElement) {}

/**
 * Intent is to keep this generic so it can be migrated to oscd-ui.
 */
export default class OscdTextEditor extends BaseElement {
  static scopedElements = {
    // Left here for clarity sake. We need to dyn-import this so we have a chance of overriding the customElements.define to prevent
    // ace-editor from being registered globally and causing issues with other instances of ace-editor in the same document.
    //'ace-editor': AceEditor,
  };

  constructor() {
    super();
    // Special handling to prevent ace-editor from being registered globally, which would cause issues with multiple instances in the same document.
    // This will all go away once the oscd-ui version is implemented and this project is migrated to oscd-ui
    const customElementsDefineFn = window.customElements.define;
    window.customElements.define = (name, constructor) => {
      if (name !== 'ace-editor') {
        return customElementsDefineFn(name, constructor);
      }
    };
    import('ace-custom-element').then(AceEditor => {
      if (!this.registry?.get('ace-editor')) {
        this.registry?.define('ace-editor', AceEditor.default);
      }
    });
  }

  @property()
  value: string | undefined;

  @query('ace-editor')
  aceEditor!: AceEditor;

  public format() {
    const rawXml =
      this.aceEditor?.editor?.getSelectedText() || this.aceEditor.value;

    let initialIndent = '';
    if (this.aceEditor?.editor?.getSelectedText()) {
      const range = this.aceEditor.editor.getSelectionRange();
      // Get the starting line of the selection and detect its leading whitespace
      const startLine = range.start.row;
      const lineContent = this.aceEditor.editor.session.getLine(startLine);
      initialIndent = lineContent.match(/^(\s*)/)?.[1] || '';
    }

    const formatted = formatXml(rawXml, initialIndent);
    if (this.aceEditor?.editor?.getSelectedText()) {
      const range = this.aceEditor.editor.getSelectionRange();
      // Remove the trailing \r\n
      this.aceEditor.editor.session.replace(
        range,
        formatted.substring(0, formatted.length - 2),
      );
    } else {
      this.value = formatted;
    }
  }

  connectedCallback(): void {
    super.connectedCallback();
    window.ace?.config?.addEventListener?.('editor', manageAceOptionChange);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.ace?.config?.removeEventListener?.('editor', manageAceOptionChange);
  }

  private handleAceChange(e: CustomEvent<string>): void {
    if (typeof e.detail !== 'string') {
      return;
    }

    if (this.value !== e.detail) {
      this.dispatchEvent(
        new CustomEvent('change', {
          detail: e.detail,
        }),
      );
    }
  }

  protected updated(changedProps: PropertyValueMap<OscdTextEditor>): void {
    if (changedProps.has('value')) {
      // Clear selection when content updates
      setTimeout(() => {
        if (this.aceEditor?.editor) {
          /* For reasons unknown the ace editor initially selects all code, so we need to clear that*/
          this.aceEditor.editor.selection.clearSelection();
          this.aceEditor.editor.moveCursorTo(0, 0);
        }
      }, 10);
    }
  }

  render() {
    return html`
      <ace-editor
        .value=${this.value}
        mode=${aceOptions.mode}
        theme=${aceOptions.theme}
        @change=${(e: CustomEvent<string>) => {
          this.handleAceChange(e);
        }}
      >
      </ace-editor>
    `;
  }

  static styles = css`
    :host {
      height: 100%;
      width: 100%;
      overflow: auto;
    }

    ace-editor {
      height: 100%;
      width: 100%;
    }
  `;
}
