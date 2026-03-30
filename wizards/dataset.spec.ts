/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect, fixture } from '@open-wc/testing';
import { html } from 'lit';

import { editDataSetWizard } from './dataset.js';
import { EditV2, Remove, SetAttributes } from '@openscd/oscd-api';
import { XMLEditor } from '@openscd/oscd-editor';
import { SclTextField } from '@openenergytools/scl-text-field';
import { SelectionList } from '@openenergytools/filterable-lists/dist/SelectionList.js';
import { Wizard } from '../foundation.js';

if (!customElements.get('scl-text-field')) {
  customElements.define('scl-text-field', SclTextField);
}
if (!customElements.get('selection-list')) {
  customElements.define('selection-list', SelectionList);
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
                  <DataSet name="DS1" desc="Data set 1">
                    <FCDA ldInst="LD1" lnClass="LLN0" doName="Beh" daName="stVal" fc="ST" />
                    <FCDA ldInst="LD1" lnClass="LLN0" doName="Beh" daName="q" fc="ST" />
                    <FCDA ldInst="LD1" lnClass="MMXU" lnInst="1" doName="TotW" fc="MX" />
                  </DataSet>
                  <DataSet name="DS2" />
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
  const fcdaList = content.querySelector(
    'selection-list#fcda-list',
  ) as SelectionList;

  expect(nameField).to.exist;
  expect(descField).to.exist;

  return {
    content,
    nameField,
    descField,
    fcdaList,
  };
}

describe('DataSet edit wizard', () => {
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

  it('returns a wizard with correct title and 3 content items', () => {
    const scl = createSclDoc();
    const element = scl.querySelector('DataSet[name="DS1"]')!;
    const wizard = editDataSetWizard(element);

    expect(wizard.title).to.equal('Edit DataSet');
    expect(wizard.primary).to.exist;
    expect(wizard.primary!.icon).to.equal('edit');
    expect(wizard.primary!.label).to.equal('save');
    expect(wizard.content).to.have.lengthOf(3);
  });

  it('populates fields with current attribute values', async () => {
    const scl = createSclDoc();
    const element = scl.querySelector('DataSet[name="DS1"]')!;
    const wizard = editDataSetWizard(element);
    const fields = await renderContent(wizard);
    renderedContainer = fields.content;

    expect(fields.nameField.value).to.equal('DS1');
    expect(fields.descField.value).to.equal('Data set 1');
  });

  it('renders name field as disabled', async () => {
    const scl = createSclDoc();
    const element = scl.querySelector('DataSet[name="DS1"]')!;
    const wizard = editDataSetWizard(element);
    const fields = await renderContent(wizard);
    renderedContainer = fields.content;

    expect(fields.nameField.disabled).to.be.true;
  });

  it('renders the FCDA selection list', async () => {
    const scl = createSclDoc();
    const element = scl.querySelector('DataSet[name="DS1"]')!;
    const wizard = editDataSetWizard(element);
    const fields = await renderContent(wizard);
    renderedContainer = fields.content;

    expect(fields.fcdaList).to.exist;
    expect(fields.fcdaList.items).to.have.lengthOf(3);
    expect(fields.fcdaList.items[0].selected).to.be.true;
    expect(fields.fcdaList.items[1].selected).to.be.true;
    expect(fields.fcdaList.items[2].selected).to.be.true;
  });

  it('renders FCDA labels with ldInst, lnClass, doName, daName, fc', async () => {
    const scl = createSclDoc();
    const element = scl.querySelector('DataSet[name="DS1"]')!;
    const wizard = editDataSetWizard(element);
    const fields = await renderContent(wizard);
    renderedContainer = fields.content;

    expect(fields.fcdaList.items[0].headline).to.equal(
      'LD1.LLN0.Beh.stVal.[ST]',
    );
    expect(fields.fcdaList.items[1].headline).to.equal('LD1.LLN0.Beh.q.[ST]');
    expect(fields.fcdaList.items[2].headline).to.equal('LD1.MMXU1.TotW.[MX]');
  });

  it('returns [] when no changes are made', async () => {
    const scl = createSclDoc();
    const element = scl.querySelector('DataSet[name="DS1"]')!;
    const wizard = editDataSetWizard(element);
    const fields = await renderContent(wizard);
    renderedContainer = fields.content;

    const edits = wizard.primary!.action(
      [fields.nameField, fields.descField],
      renderedContainer!,
    ) as EditV2[];

    expect(edits).to.have.lengthOf(0);
  });

  it('returns SetAttributes with changed desc', async () => {
    const scl = createSclDoc();
    const element = scl.querySelector('DataSet[name="DS1"]')!;
    const wizard = editDataSetWizard(element);
    const fields = await renderContent(wizard);
    renderedContainer = fields.content;

    fields.descField.value = 'Updated description';

    const edits = wizard.primary!.action(
      [fields.nameField, fields.descField],
      renderedContainer!,
    ) as EditV2[];

    expect(edits).to.have.lengthOf(1);
    const edit = edits[0] as SetAttributes;
    expect(edit.element).to.equal(element);
    expect(edit.attributes!.desc).to.equal('Updated description');
  });

  it('applies changed desc to the document', async () => {
    const scl = createSclDoc();
    const element = scl.querySelector('DataSet[name="DS1"]')!;
    const wizard = editDataSetWizard(element);
    const fields = await renderContent(wizard);
    renderedContainer = fields.content;

    fields.descField.value = 'Updated description';

    const edits = wizard.primary!.action(
      [fields.nameField, fields.descField],
      renderedContainer!,
    ) as EditV2[];

    xmlEditor.commit(edits);
    expect(element.getAttribute('desc')).to.equal('Updated description');
    expect(element.getAttribute('name')).to.equal('DS1');
  });

  it('handles nullable desc — set to null removes attribute', async () => {
    const scl = createSclDoc();
    const element = scl.querySelector('DataSet[name="DS1"]')!;
    expect(element.getAttribute('desc')).to.equal('Data set 1');

    const wizard = editDataSetWizard(element);
    const fields = await renderContent(wizard);
    renderedContainer = fields.content;

    fields.descField.value = null as unknown as string;

    const edits = wizard.primary!.action(
      [fields.nameField, fields.descField],
      renderedContainer!,
    ) as EditV2[];

    expect(edits).to.have.lengthOf(1);
    const edit = edits[0] as SetAttributes;
    expect(edit.attributes!.desc).to.be.null;

    xmlEditor.commit(edits);
    expect(element.getAttribute('desc')).to.be.null;
  });

  it('handles element with no FCDAs (DS2)', async () => {
    const scl = createSclDoc();
    const element = scl.querySelector('DataSet[name="DS2"]')!;
    const wizard = editDataSetWizard(element);
    const fields = await renderContent(wizard);
    renderedContainer = fields.content;

    expect(fields.nameField.value).to.equal('DS2');
    expect(fields.descField.value).to.be.null;
    expect(fields.fcdaList).to.exist;
    expect(fields.fcdaList.items).to.have.lengthOf(0);
  });

  it('returns [] when no-attribute element is unchanged', async () => {
    const scl = createSclDoc();
    const element = scl.querySelector('DataSet[name="DS2"]')!;
    const wizard = editDataSetWizard(element);
    const fields = await renderContent(wizard);
    renderedContainer = fields.content;

    const edits = wizard.primary!.action(
      [fields.nameField, fields.descField],
      renderedContainer!,
    ) as EditV2[];

    expect(edits).to.have.lengthOf(0);
  });

  it('returns Remove edits for deselected FCDAs', async () => {
    const scl = createSclDoc();
    const element = scl.querySelector('DataSet[name="DS1"]')!;
    const allFcdas = Array.from(element.querySelectorAll('FCDA'));
    expect(allFcdas).to.have.lengthOf(3);

    const wizard = editDataSetWizard(element);
    const fields = await renderContent(wizard);
    renderedContainer = fields.content;

    // Deselect the second FCDA
    fields.fcdaList.items = fields.fcdaList.items.map((item, index) => ({
      ...item,
      selected: index !== 1,
    }));

    const edits = wizard.primary!.action(
      [fields.nameField, fields.descField],
      renderedContainer!,
    ) as EditV2[];

    expect(edits).to.have.lengthOf(1);
    const removeEdit = edits[0] as Remove;
    expect(removeEdit.node).to.equal(allFcdas[1]);
  });

  it('returns both Remove and SetAttributes when desc changed and FCDA deselected', async () => {
    const scl = createSclDoc();
    const element = scl.querySelector('DataSet[name="DS1"]')!;
    const allFcdas = Array.from(element.querySelectorAll('FCDA'));

    const wizard = editDataSetWizard(element);
    const fields = await renderContent(wizard);
    renderedContainer = fields.content;

    // Deselect the first FCDA
    fields.fcdaList.items = fields.fcdaList.items.map((item, index) => ({
      ...item,
      selected: index !== 0,
    }));

    // Also change desc
    fields.descField.value = 'New desc';

    const edits = wizard.primary!.action(
      [fields.nameField, fields.descField],
      renderedContainer!,
    ) as EditV2[];

    expect(edits).to.have.lengthOf(2);

    // Remove edit comes first
    const removeEdit = edits[0] as Remove;
    expect(removeEdit.node).to.equal(allFcdas[0]);

    // SetAttributes edit comes second
    const setAttrs = edits[1] as SetAttributes;
    expect(setAttrs.element).to.equal(element);
    expect(setAttrs.attributes!.desc).to.equal('New desc');
  });

  it('applies FCDA removal to the document', async () => {
    const scl = createSclDoc();
    const element = scl.querySelector('DataSet[name="DS1"]')!;
    expect(element.querySelectorAll('FCDA')).to.have.lengthOf(3);

    const wizard = editDataSetWizard(element);
    const fields = await renderContent(wizard);
    renderedContainer = fields.content;

    // Deselect first and third FCDAs
    fields.fcdaList.items = fields.fcdaList.items.map((item, index) => ({
      ...item,
      selected: index === 1,
    }));

    const edits = wizard.primary!.action(
      [fields.nameField, fields.descField],
      renderedContainer!,
    ) as EditV2[];

    expect(edits).to.have.lengthOf(2);
    xmlEditor.commit(edits);
    expect(element.querySelectorAll('FCDA')).to.have.lengthOf(1);
  });
});
