import { LitElement, type PropertyValueMap } from 'lit';
import type * as AceGlobal from 'ace-builds';
import 'ace-builds/src-noconflict/ace.js';
import 'ace-builds/src-noconflict/theme-sqlserver.js';
import 'ace-builds/src-noconflict/mode-xml.js';
import 'ace-builds/src-noconflict/ext-searchbox.js';
import AceEditor from 'ace-custom-element';
import { EditV2 } from '@openscd/oscd-api';
declare global {
    interface Window {
        ace: typeof AceGlobal;
    }
}
export declare function parseXml(xml: string): XMLDocument;
export declare function serializeXml(xml: XMLDocument | Element): string;
export declare function formatXml(rawXml: string | undefined, initialIndent?: string): string;
export declare function newOscdTextEditV2({ element, newText, }: {
    element: Element;
    newText: string;
}): EditV2[] | null;
declare const BaseElement_base: typeof LitElement & import("@open-wc/scoped-elements/lit-element.js").ScopedElementsHostConstructor;
declare class BaseElement extends BaseElement_base {
}
/**
 * Intent is to keep this generic so it can be migrated to oscd-ui.
 */
export default class OscdTextEditor extends BaseElement {
    static scopedElements: {
        'ace-editor': typeof AceEditor;
    };
    value: string | undefined;
    aceEditor: AceEditor;
    format(): void;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private handleAceChange;
    protected updated(changedProps: PropertyValueMap<OscdTextEditor>): void;
    render(): import("lit-html").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
export {};
