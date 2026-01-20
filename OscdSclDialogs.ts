import { css, html, LitElement, TemplateResult } from 'lit';
import { property, query, queryAll } from 'lit/decorators.js';

import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';

import { EditV2 } from '@openscd/oscd-api';
import { SclCheckbox } from '@openenergytools/scl-checkbox';
import { SclSelect } from '@openenergytools/scl-select';
import { SclTextField } from '@openenergytools/scl-text-field';

import { ActionList } from '@openenergytools/filterable-lists/dist/ActionList.js';
import { SelectionList } from '@openenergytools/filterable-lists/dist/SelectionList.js';

import { MdDialog } from '@scopedelement/material-web/dialog/MdDialog.js';
import { MdFilledSelect } from '@scopedelement/material-web/select/MdFilledSelect.js';
import { MdFilledTextField } from '@scopedelement/material-web/textfield/MdFilledTextField.js';
import { MdIcon } from '@scopedelement/material-web/icon/MdIcon.js';
import { MdIconButton } from '@scopedelement/material-web/iconbutton/MdIconButton.js';
import { MdFilledButton } from '@scopedelement/material-web/button/MdFilledButton.js';
import { MdList } from '@scopedelement/material-web/list/MdList.js';
import { MdListItem } from '@scopedelement/material-web/list/MdListItem.js';
import { MdSelectOption } from '@scopedelement/material-web/select/MdSelectOption.js';
import { MdTextButton } from '@scopedelement/material-web/button/MdTextButton.js';

import { wizards } from './wizards/wizards.js';

import { Wizard, WizardActor, WizardInputElement } from './foundation.js';

export type EditWizard = {
  element: Element;
};

export type CreateWizard = {
  parent: Element;
  tagName: string;
};

export type WizardType = EditWizard | CreateWizard;

function isCreateWizard(wizardType: unknown): wizardType is CreateWizard {
  return (
    'parent' in (wizardType as CreateWizard) &&
    'tagName' in (wizardType as CreateWizard)
  );
}

function isEditWizard(wizardType: unknown): wizardType is EditWizard {
  return (
    'element' in (wizardType as EditWizard) &&
    (wizardType as EditWizard).element instanceof Element
  );
}

function getWizard(wizardType: WizardType): Wizard | undefined {
  if (isCreateWizard(wizardType)) {
    const { parent, tagName } = wizardType;
    const wizard = wizards[tagName].create(parent);
    return wizard;
  }

  if (isEditWizard(wizardType)) {
    const { element } = wizardType;
    const wizard = wizards[element.tagName].edit(element);

    return wizard;
  }

  return undefined;
}

function wizardContent(wizardType: WizardType | null): TemplateResult[] {
  return (
    (wizardType && getWizard(wizardType)?.content) || [
      html`<div>Invalid wizard type definition</div>`,
    ]
  );
}

function wizardTitle(wizardType: WizardType | null): string {
  return (
    (wizardType && getWizard(wizardType)?.title) ||
    'Invalid wizard type definition'
  );
}

function wizardAction(wizardType: WizardType): WizardActor | undefined {
  if (!wizardType) {
    return undefined;
  }
  return getWizard(wizardType)?.primary?.action;
}

export default class OscdSclDialogs extends ScopedElementsMixin(LitElement) {
  @property({ type: Object })
  wizardType: EditWizard | CreateWizard | null = null;

  private dialogClosePromise: {
    resolve: (value: EditV2[]) => void;
    reject: () => void;
  } | null = null;

  static scopedElements = {
    'md-dialog': MdDialog,
    'md-text-button': MdTextButton,
    'md-filled-button': MdFilledButton,
    'scl-checkbox': SclCheckbox,
    'scl-text-field': SclTextField,
    'scl-select': SclSelect,
    'md-filled-textfield': MdFilledTextField,
    'md-filled-select': MdFilledSelect,
    'md-select-option': MdSelectOption,
    'md-icon-button': MdIconButton,
    'md-icon': MdIcon,
    'selection-list': SelectionList,
    'action-list': ActionList,
    'md-list': MdList,
    'md-list-item': MdListItem,
  };

  @query('md-dialog') dialog!: MdDialog;

  @queryAll(
    'scl-text-field, scl-select, scl-checkbox, md-filled-textfield, md-filled-select',
  )
  inputs!: WizardInputElement[];

  private checkValidity(): boolean {
    return Array.from(this.inputs).every(input => input.checkValidity());
  }

  private reportValidity(): void {
    this.inputs.forEach(input => {
      input.reportValidity();
    });
  }

  async create(wizardType: CreateWizard): Promise<EditV2[]> {
    this.wizardType = wizardType;
    let edits: EditV2[] = [];
    try {
      edits = await new Promise<EditV2[]>((resolve, reject) => {
        this.dialogClosePromise = { resolve, reject };

        this.dialog.show();
      });
    } catch {
      // ignore
    }
    this.close();
    return edits;
  }

  async edit(wizardType: EditWizard): Promise<EditV2[]> {
    this.wizardType = wizardType;
    let edits: EditV2[] = [];
    try {
      edits = await new Promise<EditV2[]>((resolve, reject) => {
        this.dialogClosePromise = { resolve, reject };

        this.dialog.show();
      });
      this.close();
    } catch {
      // ignore
    }
    return edits;
  }

  close(): void {
    this.dialog.close();
  }

  reset(): void {
    this.wizardType = null;
    this.inputs.forEach(input => {
      input.value = '';
      if ('setCustomValidity' in input) {
        input.setCustomValidity('');
      }
      input.reportValidity();
    });
  }

  private async act(action?: WizardActor): Promise<boolean> {
    if (action === undefined) {
      return false;
    }

    if (!this.checkValidity()) {
      this.reportValidity();
      return false;
    }

    const edits = action(Array.from(this.inputs), this.dialog);
    this.dialogClosePromise?.resolve(edits);
    return true;
  }

  render(): TemplateResult {
    return html`<div>
      <md-dialog
        @closed="${() => {
          this.reset();
        }}"
        @cancel="${() => {
          this.dialogClosePromise?.reject();
        }}"
      >
        <div slot="headline">${wizardTitle(this.wizardType)}</div>
        <form slot="content" method="dialog">
          <div id="wizard-content">${wizardContent(this.wizardType)}</div>
        </form>
        <div slot="actions">
          <md-text-button
            id="close-button"
            form="add-data-object"
            @click="${(event: Event) => {
              event.stopImmediatePropagation();
              this.close();
            }}"
            >Cancel</md-text-button
          >
          <md-filled-button
            form="add-data-object"
            @click=${() => this.act(wizardAction(this.wizardType!))}
            >Save</md-filled-button
          >
        </div>
      </md-dialog>
    </div>`;
  }

  static styles = css`
    *,
    md-filled-button * {
      --md-dialog-container-color: var(
        --wizard-dialog-background-color,
        var(--oscd-base3)
      );
      --md-dialog-headline-color: var(
        --wizard-dialog-text-color,
        var(--oscd-base00)
      );
      --md-dialog-headline-font: var(
        --wizard-dialog-text-font,
        var(--oscd-text-font)
      );
      --md-dialog-supporting-text-color: var(
        --wizard-dialog-text-color,
        var(--oscd-base00)
      );
      --md-dialog-supporting-text-font: var(
        --wizard-dialog-text-font,
        var(--oscd-text-font)
      );

      --md-sys-color-primary: var(--wizard-dialog-primary, var(--oscd-primary));
      --md-sys-color-secondary: var(
        --wizard-dialog-secondary,
        var(--oscd-secondary)
      );
      --md-sys-typescale-body-large-font: var(
        --wizard-dialog-text-font,
        var(--oscd-text-font)
      );

      --md-sys-color-surface-container-highest: var(
        --wizard-dailog-input-background-color,
        var(--oscd-base3)
      );
      --md-outlined-text-field-input-text-color: var(
        --wizard-dialog-text-color,
        var(--oscd-base00)
      );
      --md-sys-color-on-surface: var(
        --wizard-dialog-text-color,
        var(--oscd-base00)
      );
      --md-sys-color-on-primary: var(
        --wizard-dialog-background-color,
        var(--oscd-base3)
      );

      --md-sys-color-surface: var(--wizard-dialog-surface, var(--oscd-base3));
      --md-sys-color-on-surface-variant: var(
        --wizard-dialog-text-color,
        var(--oscd-base00)
      );

      --md-menu-container-color: var(
        --wizard-dialog-background-color,
        var(--oscd-base3)
      );

      --md-menu-item-selected-container-color: rgb(
        from var(--wizard-dialog-primary, var(--oscd-primary)) r g b / 0.38
      );
    }

    md-dialog {
      --md-dialog-container-max-height: 100%;
      --md-dialog-container-max-width: 100%;
    }

    #wizard-content {
      display: flex;
      flex-direction: column;
    }

    #wizard-content > * {
      display: block;
      margin-top: 16px;
    }
  `;
}
