/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect, fixture } from '@open-wc/testing';
import { html } from 'lit';

import { updateLN0Wizard } from './ln0.js';
import { EditV2 } from '@openscd/oscd-api';
import { XMLEditor } from '@openscd/oscd-editor';
import { SclSelect } from '@openenergytools/scl-select';
import { SclTextField } from '@openenergytools/scl-text-field';
import { Wizard } from '../foundation.js';

if (!customElements.get('scl-select')) {
  customElements.define('scl-select', SclSelect);
}
if (!customElements.get('scl-text-field')) {
  customElements.define('scl-text-field', SclTextField);
}

const xmlParser = new DOMParser();
function createSclDoc(): XMLDocument {
  return xmlParser.parseFromString(
    `
      <SCL>
        <IED name="IED1">
          <AccessPoint name="AP1">
            <Server>
              <LDevice inst="LD1">
                <LN0 lnClass="LLN0" inst="" lnType="LLN0_Type_A" desc="LN0 A" />
              </LDevice>
            </Server>
          </AccessPoint>
        </IED>
        <DataTypeTemplates>
          <LNodeType lnClass="LLN0" id="LLN0_Type_A" />
          <LNodeType lnClass="LLN0" id="LLN0_Type_B" />
        </DataTypeTemplates>
      </SCL>
    `,
    'application/xml',
  );
}

async function renderContent(wizard: Wizard) {
  const content = await fixture(html`<form>${wizard.content}</form>`);

  const lnTypeField = content.querySelector(
    'scl-select[label="lnType"]',
  ) as SclSelect;
  const descField = content.querySelector(
    'scl-text-field[label="desc"]',
  ) as SclTextField;

  const lnClassField = content.querySelector(
    'scl-text-field[label="lnClass"]',
  ) as SclTextField;
  const instField = content.querySelector(
    'scl-text-field[label="inst"]',
  ) as SclTextField;

  expect(lnTypeField).to.exist;
  expect(descField).to.exist;
  return { content, lnTypeField, descField, lnClassField, instField };
}

describe('LN0 wizard', () => {
  let xmlEditor: XMLEditor;
  let renderedContainer: Element | undefined = undefined;

  async function editLN0TestSetup({
    scl,
    elementSelector,
  }: {
    scl: XMLDocument;
    elementSelector: string;
  }) {
    const ln0 = scl.querySelector(elementSelector)!;
    const wizard = updateLN0Wizard(ln0);
    const contentAndFields = await renderContent(wizard);

    renderedContainer = contentAndFields.content;

    return { ln0, wizard, ...contentAndFields };
  }

  beforeEach(() => {
    xmlEditor = new XMLEditor();
  });

  afterEach(() => {
    if (renderedContainer) {
      renderedContainer.remove();
    }
  });

  it('updates LN0 lnType and desc', async () => {
    const scl = createSclDoc();

    const { wizard, ln0, lnTypeField, descField, lnClassField, instField } =
      await editLN0TestSetup({
        scl,
        elementSelector: 'LDevice > LN0',
      });

    lnTypeField.value = 'LLN0_Type_B';
    descField.value = 'Updated LN0';

    const edits = wizard.primary!.action(
      [lnTypeField, descField, lnClassField, instField],
      renderedContainer!,
    ) as EditV2[];

    xmlEditor.commit(edits);

    expect(ln0.getAttribute('lnType')).to.equal('LLN0_Type_B');
    expect(ln0.getAttribute('desc')).to.equal('Updated LN0');
  });
});
