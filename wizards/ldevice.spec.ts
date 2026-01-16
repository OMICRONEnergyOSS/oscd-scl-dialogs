/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect, fixture } from '@open-wc/testing';
import { html } from 'lit';

import { createLDeviceWizard, editLDeviceWizard } from './ldevice.js';
import { EditV2 } from '@openscd/oscd-api';
import { XMLEditor } from '@openscd/oscd-editor';
import { SclTextField } from '@openenergytools/scl-text-field';
import { Wizard } from '../foundation.js';

customElements.define('scl-text-field', SclTextField);

async function setSclTextFieldValue(
  field: SclTextField,
  value: string,
): Promise<void> {
  if (field.disabled) {
    return;
  }
  if (field.nullable && !field.nullSwitch?.selected) {
    field.nullSwitch?.click();
    await field.updateComplete;
  }

  field.value = value;
  await field.updateComplete;
  field.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  await field.updateComplete;
}

const xmlParser = new DOMParser();
function createSclDoc(withConfLdName?: boolean): XMLDocument {
  return xmlParser.parseFromString(
    `
      <SCL>
        <IED name="IED1">
          <Services>${withConfLdName ? '<ConfLdName />' : ''}</Services>
          <AccessPoint name="AP1">
            <Server>
              <LDevice inst="LD1" ldName="LD_A" />
              <LDevice inst="LD2" />
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

  const instField = content.querySelector(
    'scl-text-field[label="inst"]',
  ) as SclTextField;
  const ldNameField = content.querySelector(
    'scl-text-field[label="ldName"]',
  ) as SclTextField;
  const desc = content.querySelector(
    'scl-text-field[label="desc"]',
  ) as SclTextField;
  await instField.updateComplete;
  await ldNameField.updateComplete;
  await desc.updateComplete;

  expect(instField).to.exist;
  expect(ldNameField).to.exist;
  expect(desc).to.exist;
  return { instField, ldNameField, desc, content };
}

describe('LDevice wizard', () => {
  let xmlEditor: XMLEditor;
  let renderedContainer: Element | undefined = undefined;

  async function createLDeviceTestSetup({
    scl,
    parentSelector,
  }: {
    scl: XMLDocument;
    parentSelector: string;
  }) {
    const parent = scl.querySelector(parentSelector)!;
    const wizard = createLDeviceWizard(parent);
    const { instField, ldNameField, desc, content } =
      await renderContent(wizard);
    renderedContainer = content;

    return { parent, wizard, instField, ldNameField, desc };
  }

  async function editLDeviceTestSetup({
    scl,
    elementSelector,
  }: {
    scl: XMLDocument;
    elementSelector: string;
  }) {
    const ldevice = scl.querySelector(elementSelector)!;
    const wizard = editLDeviceWizard(ldevice);
    const { instField, ldNameField, desc, content } =
      await renderContent(wizard);

    renderedContainer = content;

    return { ldevice, wizard, instField, ldNameField, desc };
  }

  beforeEach(() => {
    xmlEditor = new XMLEditor();
  });

  afterEach(() => {
    if (renderedContainer) {
      (renderedContainer as Element).remove();
    }
  });

  it('creates an LDevice with ldName when ConfLdName is allowed', async () => {
    const scl = createSclDoc(true);
    const { parent, wizard, instField, ldNameField, desc } =
      await createLDeviceTestSetup({
        scl,
        parentSelector: 'Server',
      });

    expect(ldNameField.disabled).to.not.be.true;

    expect(desc.shadowRoot?.querySelector('md-filled-text-field')).property(
      'disabled',
    ).to.be.true;

    instField.value = 'LD3';
    ldNameField.value = 'LD_NEW';
    desc.value = 'New LDevice';
    desc.requestUpdate();

    const edits = wizard.primary!.action(
      [instField, ldNameField, desc],
      parent,
    ) as EditV2[];

    xmlEditor.commit(edits);

    const ldevice = scl.querySelector('LDevice[inst="LD3"]');
    expect(ldevice).to.exist;
    expect(ldevice!.getAttribute('ldName')).to.equal('LD_NEW');
    expect(ldevice!.getAttribute('desc')).to.equal('New LDevice');
  });

  it('creates an LDevice without ldName when ConfLdName is missing', async () => {
    const scl = createSclDoc(false);
    const { parent, wizard, instField, ldNameField, desc } =
      await createLDeviceTestSetup({
        scl,
        parentSelector: 'Server',
      });

    expect(ldNameField.disabled).to.be.true;

    expect(desc.shadowRoot?.querySelector('md-filled-text-field')).property(
      'disabled',
    ).to.be.true;

    instField.value = 'LD3';
    ldNameField.value = 'LD_NEW';
    desc.value = 'New LDevice';

    const edits = wizard.primary!.action(
      [instField, ldNameField, desc],
      parent,
    ) as EditV2[];

    xmlEditor.commit(edits);

    const ldevice = scl.querySelector('LDevice[inst="LD3"]');
    expect(ldevice).to.exist;
    expect(ldevice!.getAttribute('ldName')).to.be.null;
    expect(ldevice!.getAttribute('desc')).to.equal('New LDevice');
  });

  it('updates ldName when allowed and changed', async () => {
    const scl = createSclDoc(true);
    const { ldevice, wizard, instField, ldNameField, desc } =
      await editLDeviceTestSetup({
        scl,
        elementSelector: 'LDevice',
      });

    ldNameField.value = 'LD_B';

    const edits = wizard.primary!.action(
      [instField, ldNameField, desc],
      ldevice,
    ) as EditV2[];

    xmlEditor.commit(edits);

    expect(ldevice).to.exist;
    expect(ldevice!.getAttribute('ldName')).to.equal('LD_B');
  });

  it('does not update ldName when ConfLdName is missing', async () => {
    const scl = createSclDoc(false);
    const { ldevice, wizard, instField, ldNameField, desc } =
      await editLDeviceTestSetup({
        scl,
        elementSelector: 'LDevice',
      });

    ldNameField.value = 'LD_B';

    const edits = wizard.primary!.action(
      [instField, ldNameField, desc],
      ldevice,
    ) as EditV2[];

    xmlEditor.commit(edits);

    expect(ldevice).to.exist;
    expect(ldevice!.getAttribute('ldName')).to.equal('LD_A');
  });

  it('prevents creating a LDevice with an inst value already in use', async () => {
    const scl = createSclDoc(false);
    const { instField } = await createLDeviceTestSetup({
      scl,
      parentSelector: 'Server',
    });

    await setSclTextFieldValue(instField, 'LD1');

    expect(instField.checkValidity()).to.be.false;
  });

  it('prevents setting the ldName to None', async () => {
    const scl = createSclDoc(true);
    const { ldNameField } = await editLDeviceTestSetup({
      scl,
      elementSelector: 'Server',
    });
    await setSclTextFieldValue(ldNameField, 'None');

    expect(ldNameField.checkValidity()).to.be.false;
  });
});
