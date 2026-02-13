import { LitElement, TemplateResult } from 'lit';
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
import { WizardInputElement } from './foundation.js';
import OscdTextEditor from './OscdTextEditor.js';
export type EditWizard = {
    element: Element;
};
export type CreateWizard = {
    parent: Element;
    tagName: string;
};
export type WizardType = EditWizard | CreateWizard;
declare const BaseElement_base: typeof LitElement & import("@open-wc/scoped-elements/lit-element.js").ScopedElementsHostConstructor;
declare class BaseElement extends BaseElement_base {
}
export default class OscdSclDialogs extends BaseElement {
    wizardType: EditWizard | CreateWizard | null;
    private dialogClosePromise;
    static scopedElements: {
        'md-dialog': typeof MdDialog;
        'md-text-button': typeof MdTextButton;
        'md-filled-button': typeof MdFilledButton;
        'scl-checkbox': typeof SclCheckbox;
        'scl-text-field': typeof SclTextField;
        'scl-select': typeof SclSelect;
        'md-filled-textfield': typeof MdFilledTextField;
        'md-filled-select': typeof MdFilledSelect;
        'md-select-option': typeof MdSelectOption;
        'md-icon-button': typeof MdIconButton;
        'md-icon': typeof MdIcon;
        'selection-list': typeof SelectionList;
        'action-list': typeof ActionList;
        'md-list': typeof MdList;
        'md-list-item': typeof MdListItem;
        'oscd-text-editor': typeof OscdTextEditor;
    };
    private editorMode;
    dialog: MdDialog;
    textEditor: OscdTextEditor;
    inputs: WizardInputElement[];
    private initialEditorText;
    private currentEditorText;
    private checkValidity;
    private reportValidity;
    create(wizardType: CreateWizard): Promise<EditV2[]>;
    edit(wizardType: EditWizard): Promise<EditV2[]>;
    /**
     * Close triggers the dialog to close, which in turn triggers the `closed` event that resets the state of the dialog.
     * Why? Because click-away will also close the dialog - no matter how it closes, we want to reset.
     */
    close(): void;
    /**
     * No need to call this directly as the `closed` event will trigger a reset of the dialog's state, but this can be
     * used to manually reset the dialog if needed.
     */
    reset(): void;
    private applyTextEdits;
    private applyFormValues;
    private handleToggleEditorMode;
    render(): TemplateResult;
    static styles: import("lit").CSSResult;
}
export {};
