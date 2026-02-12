import { css, html, LitElement, PropertyValueMap } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import type WizardDialog from '../OscdSclDialogs.ts';

import '../oscd-scl-dialogs.ts';
import { XMLEditor } from '@openscd/oscd-editor';
import { convertEdit } from '@openscd/oscd-api/utils.js';
import { Edit } from '@openscd/oscd-api';
import { emptyWizard, wizards } from '../wizards/wizards.js';
import OscdTextEditor, {
  newOscdTextEditV2,
  serializeXml,
} from '../OscdTextEditor.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import OscdSclDialogs from '../OscdSclDialogs.js';

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

  @property()
  doc!: XMLDocument;

  @property()
  docVersion = -1;

  @property()
  editor!: XMLEditor;

  @property()
  docsState!: unknown;

  @state()
  editedText = '';

  @state()
  editorDirty = false;

  @query('#newTagName') newTagName!: HTMLSelectElement;

  @query('#parentSelector') parentSelector!: HTMLInputElement;

  @query('#childtag') childinput!: HTMLInputElement;

  @query('#tagSelector') tagSelector!: HTMLInputElement;

  @query('oscd-scl-dialogs') editDialog!: WizardDialog;

  @query('oscd-text-editor') textEditor!: OscdTextEditor;

  protected updated(changedProps: PropertyValueMap<DemoEditorPlugin>): void {
    if (changedProps.has('doc') || changedProps.has('docVersion')) {
      this.textEditor.value = serializeXml(this.doc);
    }
  }

  async triggerWizardCreate(): Promise<void> {
    const parent = this.doc.querySelector(this.parentSelector.value);
    const tagName = this.newTagName.value;
    if (!parent || !tagName) {
      return;
    }

    const wizardType = {
      parent,
      tagName,
    };
    const edits = await this.editDialog.create(wizardType);
    this.editor.commit(convertEdit(edits as Edit[]));
  }

  async triggerWizardEdit(): Promise<void> {
    const element = this.doc.querySelector(this.tagSelector.value);

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

    const wizardType = {
      element,
    };
    const edits = await this.editDialog.edit(wizardType);
    this.editor.commit(edits);
  }

  render() {
    return html` <div class="card">
        <h2>Add Element</h2>
        <p>
          Use this section to trigger the oscd-scl-dialogs to Add/Insert the
          specified Element to the specified Parent
        </p>
        <label>Parent Selector:</label
        ><input id="parentSelector" value="LDevice[inst='LD1']" />
        <label for="newTagName">Tag Name:</label
        ><select id="newTagName">
          ${supportedCreateTagNames.map(
            tagName => html`<option value=${tagName}>${tagName}</option>`,
          )}
        </select>
        <button @click="${this.triggerWizardCreate}">Add</button>
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
        <button @click="${this.triggerWizardEdit}">Edit</button>
      </div>

      <div class="card editor">
        <div class="editor-toolbar">
          <button @click="${() => this.textEditor.format()}">Format XML</button>
          <button
            ?disabled="${!this.editorDirty}"
            @click="${() => {
              const value = this.editedText;
              if (value === undefined) {
                return;
              }
              const edits = newOscdTextEditV2({
                element: this.doc.documentElement,
                newText: value,
              });
              if (edits) {
                this.editor.commit(edits);
              }
            }}"
          >
            Apply Edit
          </button>
        </div>
        <oscd-text-editor
          @change=${(e: CustomEvent<string>) => {
            this.editedText = e.detail;
            this.editorDirty = true;
          }}
        ></oscd-text-editor>
      </div>

      <oscd-scl-dialogs></oscd-scl-dialogs>`;
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

    .card button {
      text-align: center;
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

    [role='tooltip'],
    .hide-tooltip.hide-tooltip.hide-tooltip + [role='tooltip'] {
      visibility: hidden;
      position: absolute;
      background: black;
      color: white;
      padding: 1rem;
      border-radius: 8px;
    }
    [aria-describedby]:hover,
    [aria-describedby]:focus {
      position: relative;
    }
    [aria-describedby]:hover + [role='tooltip'],
    [aria-describedby]:focus + [role='tooltip'] {
      visibility: visible;
    }
  `;
}
