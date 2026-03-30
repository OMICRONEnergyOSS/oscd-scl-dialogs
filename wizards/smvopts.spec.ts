/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect, fixture } from '@open-wc/testing';
import { html } from 'lit';

import { editSmvOptsWizard } from './smvopts.js';
import { EditV2, SetAttributes } from '@openscd/oscd-api';
import { XMLEditor } from '@openscd/oscd-editor';
import { SclCheckbox } from '@openenergytools/scl-checkbox';
import { Wizard } from '../foundation.js';

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
                  <SampledValueControl name="SVC1">
                    <SmvOpts refreshTime="true" sampleRate="true" dataSet="false" security="true" synchSourceId="false" />
                  </SampledValueControl>
                  <SampledValueControl name="SVC2">
                    <SmvOpts />
                  </SampledValueControl>
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

  const refreshTimeField = content.querySelector(
    'scl-checkbox[label="refreshTime"]',
  ) as SclCheckbox;
  const sampleRateField = content.querySelector(
    'scl-checkbox[label="sampleRate"]',
  ) as SclCheckbox;
  const dataSetField = content.querySelector(
    'scl-checkbox[label="dataSet"]',
  ) as SclCheckbox;
  const securityField = content.querySelector(
    'scl-checkbox[label="security"]',
  ) as SclCheckbox;
  const synchSourceIdField = content.querySelector(
    'scl-checkbox[label="synchSourceId"]',
  ) as SclCheckbox;

  expect(refreshTimeField).to.exist;
  expect(sampleRateField).to.exist;
  expect(dataSetField).to.exist;
  expect(securityField).to.exist;
  expect(synchSourceIdField).to.exist;

  return {
    content,
    refreshTimeField,
    sampleRateField,
    dataSetField,
    securityField,
    synchSourceIdField,
  };
}

describe('SmvOpts edit wizard', () => {
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

  it('returns a wizard with correct title and all 5 fields', () => {
    const scl = createSclDoc();
    const element = scl.querySelector(
      'SampledValueControl[name="SVC1"] > SmvOpts',
    )!;
    const wizard = editSmvOptsWizard(element);

    expect(wizard.title).to.equal('Edit SmvOpts');
    expect(wizard.primary).to.exist;
    expect(wizard.primary!.icon).to.equal('edit');
    expect(wizard.primary!.label).to.equal('save');
    expect(wizard.content).to.have.lengthOf(5);
  });

  it('populates fields with current attribute values', async () => {
    const scl = createSclDoc();
    const element = scl.querySelector(
      'SampledValueControl[name="SVC1"] > SmvOpts',
    )!;
    const wizard = editSmvOptsWizard(element);
    const fields = await renderContent(wizard);
    renderedContainer = fields.content;

    expect(fields.refreshTimeField.value).to.equal('true');
    expect(fields.sampleRateField.value).to.equal('true');
    expect(fields.dataSetField.value).to.equal('false');
    expect(fields.securityField.value).to.equal('true');
    expect(fields.synchSourceIdField.value).to.equal('false');
  });

  it('returns [] when no changes are made', async () => {
    const scl = createSclDoc();
    const element = scl.querySelector(
      'SampledValueControl[name="SVC1"] > SmvOpts',
    )!;
    const wizard = editSmvOptsWizard(element);
    const fields = await renderContent(wizard);
    renderedContainer = fields.content;

    const edits = wizard.primary!.action(
      [
        fields.refreshTimeField,
        fields.sampleRateField,
        fields.dataSetField,
        fields.securityField,
        fields.synchSourceIdField,
      ],
      renderedContainer!,
    ) as EditV2[];

    expect(edits).to.have.lengthOf(0);
  });

  it('returns SetAttributes with changed refreshTime', async () => {
    const scl = createSclDoc();
    const element = scl.querySelector(
      'SampledValueControl[name="SVC1"] > SmvOpts',
    )!;
    const wizard = editSmvOptsWizard(element);
    const fields = await renderContent(wizard);
    renderedContainer = fields.content;

    fields.refreshTimeField.value = 'false';

    const edits = wizard.primary!.action(
      [
        fields.refreshTimeField,
        fields.sampleRateField,
        fields.dataSetField,
        fields.securityField,
        fields.synchSourceIdField,
      ],
      renderedContainer!,
    ) as EditV2[];

    expect(edits).to.have.lengthOf(1);
    const edit = edits[0] as SetAttributes;
    expect(edit.element).to.equal(element);
    expect(edit.attributes!.refreshTime).to.equal('false');
  });

  it('applies changed attributes to the document', async () => {
    const scl = createSclDoc();
    const element = scl.querySelector(
      'SampledValueControl[name="SVC1"] > SmvOpts',
    )!;
    const wizard = editSmvOptsWizard(element);
    const fields = await renderContent(wizard);
    renderedContainer = fields.content;

    fields.refreshTimeField.value = 'false';
    fields.securityField.value = 'false';

    const edits = wizard.primary!.action(
      [
        fields.refreshTimeField,
        fields.sampleRateField,
        fields.dataSetField,
        fields.securityField,
        fields.synchSourceIdField,
      ],
      renderedContainer!,
    ) as EditV2[];

    xmlEditor.commit(edits);
    expect(element.getAttribute('refreshTime')).to.equal('false');
    expect(element.getAttribute('security')).to.equal('false');
    // Unchanged attributes preserved
    expect(element.getAttribute('sampleRate')).to.equal('true');
    expect(element.getAttribute('dataSet')).to.equal('false');
    expect(element.getAttribute('synchSourceId')).to.equal('false');
  });

  it('handles nullable attribute — set to null removes attribute', async () => {
    const scl = createSclDoc();
    const element = scl.querySelector(
      'SampledValueControl[name="SVC1"] > SmvOpts',
    )!;
    expect(element.getAttribute('refreshTime')).to.equal('true');

    const wizard = editSmvOptsWizard(element);
    const fields = await renderContent(wizard);
    renderedContainer = fields.content;

    fields.refreshTimeField.value = null;

    const edits = wizard.primary!.action(
      [
        fields.refreshTimeField,
        fields.sampleRateField,
        fields.dataSetField,
        fields.securityField,
        fields.synchSourceIdField,
      ],
      renderedContainer!,
    ) as EditV2[];

    expect(edits).to.have.lengthOf(1);
    const edit = edits[0] as SetAttributes;
    expect(edit.attributes!.refreshTime).to.be.null;

    xmlEditor.commit(edits);
    expect(element.getAttribute('refreshTime')).to.be.null;
  });

  it('handles element with no attributes (SmvOpts under SVC2)', async () => {
    const scl = createSclDoc();
    const element = scl.querySelector(
      'SampledValueControl[name="SVC2"] > SmvOpts',
    )!;
    const wizard = editSmvOptsWizard(element);
    const fields = await renderContent(wizard);
    renderedContainer = fields.content;

    expect(fields.refreshTimeField.value).to.be.null;
    expect(fields.sampleRateField.value).to.be.null;
    expect(fields.dataSetField.value).to.be.null;
    expect(fields.securityField.value).to.be.null;
    expect(fields.synchSourceIdField.value).to.be.null;
  });

  it('returns [] when no-attribute element is unchanged', async () => {
    const scl = createSclDoc();
    const element = scl.querySelector(
      'SampledValueControl[name="SVC2"] > SmvOpts',
    )!;
    const wizard = editSmvOptsWizard(element);
    const fields = await renderContent(wizard);
    renderedContainer = fields.content;

    const edits = wizard.primary!.action(
      [
        fields.refreshTimeField,
        fields.sampleRateField,
        fields.dataSetField,
        fields.securityField,
        fields.synchSourceIdField,
      ],
      renderedContainer!,
    ) as EditV2[];

    expect(edits).to.have.lengthOf(0);
  });
});
