import { css, html, LitElement } from 'lit';
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';

import '@omicronenergy/oscd-scl-dialogs/oscd-scl-dialogs.js';
import { convertEdit } from '@openscd/oscd-api/utils.js';
import {
  emptyWizard,
  wizards,
} from '@omicronenergy/oscd-scl-dialogs/wizards.js';
import OscdTextEditor, {
  newOscdTextEditV2,
  serializeXml,
} from '@omicronenergy/oscd-scl-dialogs/OscdTextEditor.js';
import OscdSclDialogs from '@omicronenergy/oscd-scl-dialogs/OscdSclDialogs.js';

const supportedCreateTagNames = Object.entries(wizards)
  .filter(([, value]) => value.create !== emptyWizard)
  .map(([key]) => key);

const supportedEditTagNames = Object.entries(wizards)
  .filter(([, value]) => value.edit !== emptyWizard)
  .map(([key]) => key);

export default class DemoEditorPlugin extends ScopedElementsMixin(LitElement) {
  static scopedElements = {
    'oscd-text-editor': OscdTextEditor,
    'oscd-scl-dialogs': OscdSclDialogs,
  };

  static properties = {
    doc: { type: Object },
    docVersion: { type: Number },
    editor: { type: Object },
    docsState: { type: Object },
    editedText: { state: true },
    editorDirty: { state: true },
  };

  constructor() {
    super();
    this.doc = undefined;
    this.docVersion = -1;
    this.editor = undefined;
    this.docsState = undefined;
    this.editedText = '';
    this.editorDirty = false;
  }

  updated(changedProps) {
    if (
      (changedProps.has('doc') || changedProps.has('docVersion')) &&
      this.textEditor &&
      this.doc
    ) {
      this.textEditor.value = serializeXml(this.doc);
      this.editorDirty = false;
    }
  }

  get newTagName() {
    return this.renderRoot?.querySelector('#newTagName');
  }

  get parentSelector() {
    return this.renderRoot?.querySelector('#parentSelector');
  }

  get childinput() {
    return this.renderRoot?.querySelector('#childtag');
  }

  get tagSelector() {
    return this.renderRoot?.querySelector('#tagSelector');
  }

  get editDialog() {
    return this.renderRoot?.querySelector('oscd-scl-dialogs');
  }

  get textEditor() {
    return this.renderRoot?.querySelector('oscd-text-editor');
  }

  async triggerWizardCreate() {
    const parent = this.doc?.querySelector(this.parentSelector?.value);
    const tagName = this.newTagName?.value;
    if (!parent || !tagName) return;

    const wizardType = { parent, tagName };
    const edits = await this.editDialog.create(wizardType);
    this.editor.commit(convertEdit(edits));
  }

  async triggerWizardEdit() {
    const element = this.doc?.querySelector(this.tagSelector?.value);

    if (!element) {
      this.tagSelector.setCustomValidity('Terrible selector, try again.');
      this.tagSelector.reportValidity();
      return;
    } else if (!supportedEditTagNames.includes(element.tagName)) {
      this.tagSelector.setCustomValidity(
        'This tag name is not currently supported.',
      );
      this.tagSelector.reportValidity();
      return;
    } else {
      this.tagSelector.setCustomValidity('');
    }

    const wizardType = { element };
    const edits = await this.editDialog.edit(wizardType);
    this.editor.commit(edits);
  }

  render() {
    return html`
      <div class="card">
        <h2>Add Element</h2>
        <p>
          Use this section to trigger the oscd-scl-dialogs to Add/Insert the
          specified Element to the specified Parent
        </p>

        <label>Parent Selector:</label>
        <input id="parentSelector" value="LDevice[inst='LD1']" />

        <label for="newTagName">Tag Name:</label>
        <select id="newTagName">
          ${supportedCreateTagNames.map(
            tagName => html`<option value=${tagName}>${tagName}</option>`,
          )}
        </select>

        <button @click=${this.triggerWizardCreate}>Add</button>
      </div>

      <div class="card">
        <h2>Edit existing Element</h2>
        <p>
          Use this section to trigger the oscd-scl-dialogs to Edit the specified
          existing Element
        </p>

        <label>Tag Selector</label>
        <div>
          <input
            id="tagSelector"
            value="LDevice[inst='LD1']"
            aria-describedby="supportedEditElements"
          />
          <div
            style="z-index: 2;"
            role="tooltip"
            id="supportedEditElements"
            aria-label="Supported Elements for Editing"
          >
            <h3>Supported Elements for Editing</h3>
            <ul>
              ${supportedEditTagNames.map(tagName => html`<li>${tagName}</li>`)}
            </ul>
          </div>
        </div>

        <button @click=${this.triggerWizardEdit}>Edit</button>
      </div>

      <div class="card editor">
        <div class="editor-toolbar">
          <button @click=${() => this.textEditor.format()}>Format XML</button>

          <button
            ?disabled=${!this.editorDirty}
            @click=${() => {
              const value = this.editedText;
              if (!value) return;

              const edits = newOscdTextEditV2({
                element: this.doc.documentElement,
                newText: value,
              });

              if (edits) {
                this.editor.commit(edits);
                this.editorDirty = false;
              }
            }}
          >
            Apply Edit
          </button>
        </div>

        <oscd-text-editor
          @change=${e => {
            this.editedText = e.detail;
            this.editorDirty = true;
          }}
        ></oscd-text-editor>
      </div>

      <oscd-scl-dialogs></oscd-scl-dialogs>
    `;
  }

  static styles = css`
    .card {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem 2rem;
      align-items: center;
      justify-items: center;
      padding: 2rem;
      background: #fafbfc;
      border-radius: 8px;
      max-width: 500px;
      margin: 2rem auto;
    }

    .card h2,
    .card p,
    .card button {
      grid-column: 1 / -1;
      text-align: center;
      margin-block: 0;
    }

    .card label,
    .card select,
    .card input,
    .card > div,
    .card button {
      width: 100%;
    }

    .card.editor {
      padding: 0;
      margin: 0 auto;
      max-width: 560px;
    }

    .editor-toolbar {
      display: flex;
      gap: 8px;
      padding: 8px;
    }

    .card oscd-text-editor {
      grid-column: 1 / -1;
      width: 100%;
      height: 400px;
    }

    [role='tooltip'] {
      visibility: hidden;
      position: absolute;
      background: black;
      color: white;
      padding: 1rem;
      border-radius: 8px;
    }

    [aria-describedby]:hover + [role='tooltip'],
    [aria-describedby]:focus + [role='tooltip'] {
      visibility: visible;
    }
  `;
}
