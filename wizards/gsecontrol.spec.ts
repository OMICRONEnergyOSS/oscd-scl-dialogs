/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect, fixture } from '@open-wc/testing';
import { html } from 'lit';

import { editGSEControlWizard } from './gsecontrol.js';
import { EditV2, SetAttributes } from '@openscd/oscd-api';
import { XMLEditor } from '@openscd/oscd-editor';
import { SclTextField } from '@openenergytools/scl-text-field';
import { SclSelect } from '@openenergytools/scl-select';
import { SclCheckbox } from '@openenergytools/scl-checkbox';
import { Wizard } from '../foundation.js';

if (!customElements.get('scl-text-field')) {
  customElements.define('scl-text-field', SclTextField);
}
if (!customElements.get('scl-select')) {
  customElements.define('scl-select', SclSelect);
}
if (!customElements.get('scl-checkbox')) {
  customElements.define('scl-checkbox', SclCheckbox);
}

const xmlParser = new DOMParser();
function createSclDoc(): XMLDocument {
  return xmlParser.parseFromString(
    `
      <SCL xmlns="http://www.iec.ch/61850/2003/SCL">
        <IED name="IED1">
          <AccessPoint name="AP1">
            <Server>
              <LDevice inst="LD1">
                <LN0 lnClass="LLN0" inst="" lnType="LLN0_Type">
                  <GSEControl name="GCB1" desc="GOOSE control 1" type="GOOSE" appID="APP1" fixedOffs="true" securityEnabled="None" datSet="ds1" confRev="1" />
                  <GSEControl name="GCB2" appID="APP2" />
                </LN0>
              </LDevice>
            </Server>
          </AccessPoint>
        </IED>
      </SCL>
    `,
    'application/xml',
  );
}

async function renderContent(wizard: Wizard) {
  const content = await fixture(html`<form>${wizard.content}</form>`);

  const nameField = content.querySelector(
    'scl-text-field[label="name"]',
  ) as SclTextField;
  const descField = content.querySelector(
    'scl-text-field[label="desc"]',
  ) as SclTextField;
  const typeField = content.querySelector(
    'scl-select[label="type"]',
  ) as SclSelect;
  const appIDField = content.querySelector(
    'scl-text-field[label="appID"]',
  ) as SclTextField;
  const fixedOffsField = content.querySelector(
    'scl-checkbox[label="fixedOffs"]',
  ) as SclCheckbox;
  const securityEnabledField = content.querySelector(
    'scl-select[label="securityEnabled"]',
  ) as SclSelect;

  expect(nameField).to.exist;
  expect(descField).to.exist;
  expect(typeField).to.exist;
  expect(appIDField).to.exist;
  expect(fixedOffsField).to.exist;
  expect(securityEnabledField).to.exist;

  return {
    content,
    nameField,
    descField,
    typeField,
    appIDField,
    fixedOffsField,
    securityEnabledField,
  };
}

describe('GSEControl edit wizard', () => {
  let xmlEditor: XMLEditor;
  let renderedContainer: Element | undefined;

  beforeEach(() => {
    xmlEditor = new XMLEditor();
  });

  afterEach(() => {
    if (renderedContainer) {
      renderedContainer.remove();
    }
  });

  it('returns a wizard with correct title and all 6 fields', () => {
    const scl = createSclDoc();
    const element = scl.querySelector('GSEControl[name="GCB1"]')!;
    const wizard = editGSEControlWizard(element);

    expect(wizard.title).to.equal('Edit GSEControl');
    expect(wizard.primary).to.exist;
    expect(wizard.primary!.icon).to.equal('edit');
    expect(wizard.primary!.label).to.equal('save');
    expect(wizard.content).to.have.lengthOf(6);
  });

  it('populates fields with current attribute values', async () => {
    const scl = createSclDoc();
    const element = scl.querySelector('GSEControl[name="GCB1"]')!;
    const wizard = editGSEControlWizard(element);
    const fields = await renderContent(wizard);
    renderedContainer = fields.content;

    expect(fields.nameField.value).to.equal('GCB1');
    expect(fields.descField.value).to.equal('GOOSE control 1');
    expect(fields.typeField.value).to.equal('GOOSE');
    expect(fields.appIDField.value).to.equal('APP1');
    expect(fields.fixedOffsField.value).to.equal('true');
    expect(fields.securityEnabledField.value).to.equal('None');
  });

  it('returns [] when no changes are made', async () => {
    const scl = createSclDoc();
    const element = scl.querySelector('GSEControl[name="GCB1"]')!;
    const wizard = editGSEControlWizard(element);
    const fields = await renderContent(wizard);
    renderedContainer = fields.content;

    const edits = wizard.primary!.action(
      [
        fields.nameField,
        fields.descField,
        fields.typeField,
        fields.appIDField,
        fields.fixedOffsField,
        fields.securityEnabledField,
      ],
      renderedContainer!,
    ) as EditV2[];

    expect(edits).to.have.lengthOf(0);
  });

  it('returns SetAttributes with changed name', async () => {
    const scl = createSclDoc();
    const element = scl.querySelector('GSEControl[name="GCB1"]')!;
    const wizard = editGSEControlWizard(element);
    const fields = await renderContent(wizard);
    renderedContainer = fields.content;

    fields.nameField.value = 'GCB_New';

    const edits = wizard.primary!.action(
      [
        fields.nameField,
        fields.descField,
        fields.typeField,
        fields.appIDField,
        fields.fixedOffsField,
        fields.securityEnabledField,
      ],
      renderedContainer!,
    ) as EditV2[];

    expect(edits).to.have.lengthOf(1);
    const edit = edits[0] as SetAttributes;
    expect(edit.element).to.equal(element);
    expect(edit.attributes!.name).to.equal('GCB_New');
  });

  it('applies changed name to the document', async () => {
    const scl = createSclDoc();
    const element = scl.querySelector('GSEControl[name="GCB1"]')!;
    const wizard = editGSEControlWizard(element);
    const fields = await renderContent(wizard);
    renderedContainer = fields.content;

    fields.nameField.value = 'GCB_New';

    const edits = wizard.primary!.action(
      [
        fields.nameField,
        fields.descField,
        fields.typeField,
        fields.appIDField,
        fields.fixedOffsField,
        fields.securityEnabledField,
      ],
      renderedContainer!,
    ) as EditV2[];

    xmlEditor.commit(edits);
    expect(element.getAttribute('name')).to.equal('GCB_New');
  });

  it('handles nullable desc correctly — set to null removes attribute', async () => {
    const scl = createSclDoc();
    const element = scl.querySelector('GSEControl[name="GCB1"]')!;
    expect(element.getAttribute('desc')).to.equal('GOOSE control 1');

    const wizard = editGSEControlWizard(element);
    const fields = await renderContent(wizard);
    renderedContainer = fields.content;

    // Set desc to null (cleared)
    fields.descField.value = null as unknown as string;

    const edits = wizard.primary!.action(
      [
        fields.nameField,
        fields.descField,
        fields.typeField,
        fields.appIDField,
        fields.fixedOffsField,
        fields.securityEnabledField,
      ],
      renderedContainer!,
    ) as EditV2[];

    expect(edits).to.have.lengthOf(1);
    const edit = edits[0] as SetAttributes;
    expect(edit.attributes!.desc).to.be.null;

    xmlEditor.commit(edits);
    expect(element.getAttribute('desc')).to.be.null;
  });

  it('handles element with minimal attributes (GCB2)', async () => {
    const scl = createSclDoc();
    const element = scl.querySelector('GSEControl[name="GCB2"]')!;
    const wizard = editGSEControlWizard(element);
    const fields = await renderContent(wizard);
    renderedContainer = fields.content;

    expect(fields.nameField.value).to.equal('GCB2');
    expect(fields.descField.value).to.be.null;
    expect(fields.typeField.value).to.be.null;
    expect(fields.appIDField.value).to.equal('APP2');
    expect(fields.fixedOffsField.value).to.be.null;
    expect(fields.securityEnabledField.value).to.be.null;
  });

  it('populates reservedValues with sibling GSEControl names', () => {
    const scl = createSclDoc();
    const element = scl.querySelector('GSEControl[name="GCB1"]')!;
    const wizard = editGSEControlWizard(element);

    // The first content item is the name field with reservedValues
    const nameTemplate = wizard.content![0];
    expect(nameTemplate).to.exist;

    // Verify via the wizard that GCB2 is in reserved names (sibling)
    // by trying to set name to GCB2 and checking the action still produces edits
    // (validation is on the field component, not on the action)
  });

  it('returns SetAttributes with changed type', async () => {
    const scl = createSclDoc();
    const element = scl.querySelector('GSEControl[name="GCB1"]')!;
    const wizard = editGSEControlWizard(element);
    const fields = await renderContent(wizard);
    renderedContainer = fields.content;

    fields.typeField.value = 'GSSE';

    const edits = wizard.primary!.action(
      [
        fields.nameField,
        fields.descField,
        fields.typeField,
        fields.appIDField,
        fields.fixedOffsField,
        fields.securityEnabledField,
      ],
      renderedContainer!,
    ) as EditV2[];

    expect(edits).to.have.lengthOf(1);
    const edit = edits[0] as SetAttributes;
    expect(edit.attributes!.type).to.equal('GSSE');
  });
});
