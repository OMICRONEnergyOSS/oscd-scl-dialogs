import { LitElement, PropertyValueMap } from 'lit';
import type WizardDialog from '../OscdSclDialogs.ts';
import '../oscd-scl-dialogs.ts';
import { XMLEditor } from '@openscd/oscd-editor';
import OscdTextEditor from '../OscdTextEditor.js';
declare const DemoEditorPlugin_base: typeof LitElement & import("@open-wc/scoped-elements/lit-element.js").ScopedElementsHostConstructor;
export default class DemoEditorPlugin extends DemoEditorPlugin_base {
    static scopedElements: {
        'oscd-text-editor': typeof OscdTextEditor;
        'oscd-scl-dialogs': typeof WizardDialog;
    };
    doc: XMLDocument;
    docVersion: number;
    editor: XMLEditor;
    docsState: unknown;
    editedText: string;
    editorDirty: boolean;
    newTagName: HTMLSelectElement;
    parentSelector: HTMLInputElement;
    childinput: HTMLInputElement;
    tagSelector: HTMLInputElement;
    editDialog: WizardDialog;
    textEditor: OscdTextEditor;
    protected updated(changedProps: PropertyValueMap<DemoEditorPlugin>): void;
    triggerWizardCreate(): Promise<void>;
    triggerWizardEdit(): Promise<void>;
    render(): import("lit-html").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
export {};
