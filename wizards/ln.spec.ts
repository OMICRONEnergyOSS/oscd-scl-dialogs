/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect, fixture } from '@open-wc/testing';
import { html } from 'lit';

import { createLNWizard, updateLNWizard } from './ln.js';
import { EditV2 } from '@openscd/oscd-api';
import { XMLEditor } from '@openscd/oscd-editor';
import { SelectionList } from '@openenergytools/filterable-lists/dist/SelectionList.js';
import { SclTextField } from '@openenergytools/scl-text-field';
import { Wizard } from '../foundation.js';

if (!customElements.get('selection-list')) {
  customElements.define('selection-list', SelectionList);
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
                <LN0 lnClass="LLN0" inst="" lnType="LLN0_Type" />
                <LN lnClass="GGIO" inst="1" lnType="GGIO_Type" />
                <LN lnClass="GGIO" inst="2" lnType="GGIO_Type" />
              </LDevice>
            </Server>
          </AccessPoint>
        </IED>
        <DataTypeTemplates>
          <LNodeType lnClass="LLN0" id="LLN0_Type" />
          <LNodeType lnClass="GGIO" id="GGIO_Type" />
          <LNodeType lnClass="XCBR" id="XCBR_Type" />
        </DataTypeTemplates>
      </SCL>
    `,
    'application/xml',
  );
}

async function renderContent(wizard: Wizard) {
  const content = await fixture(html`<form>${wizard.content}</form>`);

  const list = content.querySelector('selection-list') as SelectionList;
  const lnTypeField = content.querySelector(
    'scl-text-field[label="lnType"]',
  ) as SclTextField;
  const descField = content.querySelector(
    'scl-text-field[label="desc"]',
  ) as SclTextField;
  const prefixField = content.querySelector(
    'scl-text-field[label="prefix"]',
  ) as SclTextField;
  const lnClassField = content.querySelector(
    'scl-text-field[label="lnClass"]',
  ) as SclTextField;
  const amountField = content.querySelector(
    'scl-text-field[label="amount"]',
  ) as SclTextField;
  const instField = content.querySelector(
    'scl-text-field[label="inst"]',
  ) as SclTextField;

  return {
    content,
    list,
    lnTypeField,
    descField,
    prefixField,
    lnClassField,
    amountField,
    instField,
  };
}

describe('LN wizard', () => {
  let xmlEditor: XMLEditor;
  let renderedContainer: Element | undefined = undefined;

  async function createLNTestSetup({
    scl,
    parentSelector,
  }: {
    scl: XMLDocument;
    parentSelector: string;
  }) {
    const parent = scl.querySelector(parentSelector)!;
    const wizard = createLNWizard(parent);
    const contentAndFields = await renderContent(wizard);
    renderedContainer = contentAndFields.content;

    return { parent, wizard, ...contentAndFields };
  }

  async function editLNTestSetup({
    scl,
    elementSelector,
  }: {
    scl: XMLDocument;
    elementSelector: string;
  }) {
    const ln = scl.querySelector(elementSelector)!;
    const wizard = updateLNWizard(ln);
    const contentAndFields = await renderContent(wizard);

    renderedContainer = contentAndFields.content;

    return { ln, wizard, ...contentAndFields };
  }

  beforeEach(() => {
    xmlEditor = new XMLEditor();
  });

  afterEach(() => {
    if (renderedContainer) {
      renderedContainer.remove();
    }
  });

  it('creates LN elements from selected LNodeType', async () => {
    const scl = createSclDoc();
    const { wizard, parent, list, descField, prefixField, amountField } =
      await createLNTestSetup({ scl, parentSelector: 'LDevice' });

    const ggioItem = list.items.find(
      item =>
        (item.attachedElement as Element | undefined)?.getAttribute('id') ===
        'GGIO_Type',
    );
    expect(ggioItem).to.exist;
    if (ggioItem) {
      ggioItem.selected = true;
    }
    list.dispatchEvent(new Event('input'));

    descField.value = 'Test LN';
    prefixField.value = 'P';
    amountField.value = '2';

    const edits = wizard.primary!.action(
      [descField, prefixField, amountField],
      renderedContainer!,
    ) as EditV2[];

    xmlEditor.commit(edits);

    const lns = Array.from(
      parent.querySelectorAll(':scope > LN[lnClass="GGIO"]'),
    );
    expect(lns.length).to.equal(4);

    const newLns = lns.filter(
      ln => !['1', '2'].includes(ln.getAttribute('inst') ?? ''),
    );
    newLns.forEach(ln => {
      expect(ln.getAttribute('lnType')).to.equal('GGIO_Type');
      expect(ln.getAttribute('prefix')).to.equal('P');
      expect(ln.getAttribute('desc')).to.equal('Test LN');
    });
  });

  it('blocks duplicate inst updates for LN', async () => {
    const scl = createSclDoc();
    const {
      wizard,
      lnTypeField,
      descField,
      prefixField,
      lnClassField,
      instField,
    } = await editLNTestSetup({
      scl,
      elementSelector: 'LDevice > LN[inst="1"]',
    });

    instField.value = '2';
    instField.dispatchEvent(new Event('input'));

    const edits = wizard.primary!.action(
      [lnTypeField, descField, prefixField, lnClassField, instField],
      renderedContainer!,
    ) as EditV2[];
    expect(edits.length).to.equal(0);
  });

  it('updates LN attributes when valid', async () => {
    const scl = createSclDoc();
    const {
      wizard,
      ln,
      lnTypeField,
      descField,
      prefixField,
      lnClassField,
      instField,
    } = await editLNTestSetup({
      scl,
      elementSelector: 'LDevice > LN[inst="1"]',
    });

    descField.value = 'Updated LN';
    prefixField.value = 'PX';
    instField.value = '3';

    const edits = wizard.primary!.action(
      [lnTypeField, descField, prefixField, lnClassField, instField],
      renderedContainer!,
    ) as EditV2[];

    xmlEditor.commit(edits);

    expect(ln.getAttribute('desc')).to.equal('Updated LN');
    expect(ln.getAttribute('prefix')).to.equal('PX');
    expect(ln.getAttribute('inst')).to.equal('3');
  });
});
