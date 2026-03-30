/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect, fixture } from '@open-wc/testing';
import { html } from 'lit';

import { editSampledValueControlWizard } from './sampledvaluecontrol.js';
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
function createSclDoc(multicast?: string): XMLDocument {
  const multicastAttr =
    multicast !== undefined ? `multicast="${multicast}"` : '';
  return xmlParser.parseFromString(
    `
      <SCL xmlns="http://www.iec.ch/61850/2003/SCL">
        <IED name="IED1">
          <AccessPoint name="AP1">
            <Server>
              <LDevice inst="LD1">
                <LN0 lnClass="LLN0" inst="" lnType="LLN0_Type">
                  <SampledValueControl name="SVC1" desc="SV control 1" smvID="SV_ID1" smpMod="SmpPerPeriod" smpRate="80" nofASDU="1" securityEnabled="None" ${multicastAttr} datSet="ds1" confRev="1" />
                  <SampledValueControl name="SVC2" smvID="SV_ID2" smpRate="256" nofASDU="2" />
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
  const smvIDField = content.querySelector(
    'scl-text-field[label="smvID"]',
  ) as SclTextField;
  const smpModField = content.querySelector(
    'scl-select[label="smpMod"]',
  ) as SclSelect;
  const smpRateField = content.querySelector(
    'scl-text-field[label="smpRate"]',
  ) as SclTextField;
  const nofASDUField = content.querySelector(
    'scl-text-field[label="nofASDU"]',
  ) as SclTextField;
  const securityEnabledField = content.querySelector(
    'scl-select[label="securityEnabled"]',
  ) as SclSelect;
  const multicastField = content.querySelector(
    'scl-checkbox[label="multicast"]',
  ) as SclCheckbox | null;

  expect(nameField).to.exist;
  expect(descField).to.exist;
  expect(smvIDField).to.exist;
  expect(smpModField).to.exist;
  expect(smpRateField).to.exist;
  expect(nofASDUField).to.exist;
  expect(securityEnabledField).to.exist;

  return {
    content,
    nameField,
    descField,
    smvIDField,
    smpModField,
    smpRateField,
    nofASDUField,
    securityEnabledField,
    multicastField,
  };
}

describe('SampledValueControl edit wizard', () => {
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

  it('returns a wizard with correct title and 7 fields (multicast true/absent)', () => {
    const scl = createSclDoc();
    const element = scl.querySelector('SampledValueControl[name="SVC1"]')!;
    const wizard = editSampledValueControlWizard(element);

    expect(wizard.title).to.equal('Edit SampledValueControl');
    expect(wizard.primary).to.exist;
    expect(wizard.primary!.icon).to.equal('edit');
    expect(wizard.primary!.label).to.equal('save');
    // 7 fields: name, desc, smvID, smpMod, smpRate, nofASDU, securityEnabled
    // No multicast field when multicast is absent (defaults to true)
    expect(wizard.content).to.have.lengthOf(7);
  });

  it('shows 8 fields with disabled multicast checkbox when multicast is false', () => {
    const scl = createSclDoc('false');
    const element = scl.querySelector('SampledValueControl[name="SVC1"]')!;
    const wizard = editSampledValueControlWizard(element);

    expect(wizard.content).to.have.lengthOf(8);
  });

  it('does not show multicast field when multicast is true', () => {
    const scl = createSclDoc('true');
    const element = scl.querySelector('SampledValueControl[name="SVC1"]')!;
    const wizard = editSampledValueControlWizard(element);

    // 7 fields — no multicast
    expect(wizard.content).to.have.lengthOf(7);
  });

  it('populates fields with current attribute values', async () => {
    const scl = createSclDoc();
    const element = scl.querySelector('SampledValueControl[name="SVC1"]')!;
    const wizard = editSampledValueControlWizard(element);
    const fields = await renderContent(wizard);
    renderedContainer = fields.content;

    expect(fields.nameField.value).to.equal('SVC1');
    expect(fields.descField.value).to.equal('SV control 1');
    expect(fields.smvIDField.value).to.equal('SV_ID1');
    expect(fields.smpModField.value).to.equal('SmpPerPeriod');
    expect(fields.smpRateField.value).to.equal('80');
    expect(fields.nofASDUField.value).to.equal('1');
    expect(fields.securityEnabledField.value).to.equal('None');
    expect(fields.multicastField).to.be.null;
  });

  it('returns [] when no changes are made', async () => {
    const scl = createSclDoc();
    const element = scl.querySelector('SampledValueControl[name="SVC1"]')!;
    const wizard = editSampledValueControlWizard(element);
    const fields = await renderContent(wizard);
    renderedContainer = fields.content;

    const edits = wizard.primary!.action(
      [
        fields.nameField,
        fields.descField,
        fields.smvIDField,
        fields.smpModField,
        fields.smpRateField,
        fields.nofASDUField,
        fields.securityEnabledField,
      ],
      renderedContainer!,
    ) as EditV2[];

    expect(edits).to.have.lengthOf(0);
  });

  it('returns SetAttributes with changed name', async () => {
    const scl = createSclDoc();
    const element = scl.querySelector('SampledValueControl[name="SVC1"]')!;
    const wizard = editSampledValueControlWizard(element);
    const fields = await renderContent(wizard);
    renderedContainer = fields.content;

    fields.nameField.value = 'SVC_New';

    const edits = wizard.primary!.action(
      [
        fields.nameField,
        fields.descField,
        fields.smvIDField,
        fields.smpModField,
        fields.smpRateField,
        fields.nofASDUField,
        fields.securityEnabledField,
      ],
      renderedContainer!,
    ) as EditV2[];

    expect(edits).to.have.lengthOf(1);
    const edit = edits[0] as SetAttributes;
    expect(edit.element).to.equal(element);
    expect(edit.attributes!.name).to.equal('SVC_New');
  });

  it('applies changed attributes to the document', async () => {
    const scl = createSclDoc();
    const element = scl.querySelector('SampledValueControl[name="SVC1"]')!;
    const wizard = editSampledValueControlWizard(element);
    const fields = await renderContent(wizard);
    renderedContainer = fields.content;

    fields.nameField.value = 'SVC_New';
    fields.smpRateField.value = '4000';
    fields.nofASDUField.value = '8';

    const edits = wizard.primary!.action(
      [
        fields.nameField,
        fields.descField,
        fields.smvIDField,
        fields.smpModField,
        fields.smpRateField,
        fields.nofASDUField,
        fields.securityEnabledField,
      ],
      renderedContainer!,
    ) as EditV2[];

    xmlEditor.commit(edits);
    expect(element.getAttribute('name')).to.equal('SVC_New');
    expect(element.getAttribute('smpRate')).to.equal('4000');
    expect(element.getAttribute('nofASDU')).to.equal('8');
  });

  it('handles nullable smpMod cleared returns null attribute', async () => {
    const scl = createSclDoc();
    const element = scl.querySelector('SampledValueControl[name="SVC1"]')!;
    expect(element.getAttribute('smpMod')).to.equal('SmpPerPeriod');

    const wizard = editSampledValueControlWizard(element);
    const fields = await renderContent(wizard);
    renderedContainer = fields.content;

    fields.smpModField.value = null as unknown as string;

    const edits = wizard.primary!.action(
      [
        fields.nameField,
        fields.descField,
        fields.smvIDField,
        fields.smpModField,
        fields.smpRateField,
        fields.nofASDUField,
        fields.securityEnabledField,
      ],
      renderedContainer!,
    ) as EditV2[];

    expect(edits).to.have.lengthOf(1);
    const edit = edits[0] as SetAttributes;
    expect(edit.attributes!.smpMod).to.be.null;

    xmlEditor.commit(edits);
    expect(element.getAttribute('smpMod')).to.be.null;
  });

  it('handles element with minimal attributes (SVC2)', async () => {
    const scl = createSclDoc();
    const element = scl.querySelector('SampledValueControl[name="SVC2"]')!;
    const wizard = editSampledValueControlWizard(element);
    const fields = await renderContent(wizard);
    renderedContainer = fields.content;

    expect(fields.nameField.value).to.equal('SVC2');
    expect(fields.descField.value).to.be.null;
    expect(fields.smvIDField.value).to.equal('SV_ID2');
    expect(fields.smpModField.value).to.be.null;
    expect(fields.smpRateField.value).to.equal('256');
    expect(fields.nofASDUField.value).to.equal('2');
    expect(fields.securityEnabledField.value).to.be.null;
  });

  it('renders disabled multicast checkbox for unicast SV', async () => {
    const scl = createSclDoc('false');
    const element = scl.querySelector('SampledValueControl[name="SVC1"]')!;
    const wizard = editSampledValueControlWizard(element);
    const fields = await renderContent(wizard);
    renderedContainer = fields.content;

    expect(fields.multicastField).to.exist;
    expect(fields.multicastField!.disabled).to.be.true;
    expect(fields.multicastField!.value).to.equal('false');
  });
});
