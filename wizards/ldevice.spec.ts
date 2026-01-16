/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from '@open-wc/testing';
import { html, render } from 'lit';

import {
  createLDeviceWizard,
  editLDeviceWizard,
  lDeviceNamePattern,
} from './ldevice.js';
import { WizardInputElement } from '../foundation.js';
import { EditV2 } from '@openscd/oscd-api';
import { XMLEditor } from '@openscd/oscd-editor';

function parseXml(xml: string): XMLDocument {
  return new DOMParser().parseFromString(xml, 'application/xml');
}

function input(label: string, value: string | null): WizardInputElement {
  return { label, value } as WizardInputElement;
}

function renderContent(wizard: { content?: unknown[] }): HTMLElement {
  const container = document.createElement('div');
  render(html`${wizard.content}`, container);
  return container;
}

describe('LDevice wizard', () => {
  it('creates an LDevice with ldName when ConfLdName is allowed', () => {
    const xmlEditor = new XMLEditor();
    const doc = parseXml(`
      <SCL>
        <IED name="IED1">
          <Services><ConfLdName /></Services>
          <AccessPoint name="AP1">
            <Server>
              <LDevice inst="LD1" ldName="LD_A" />
              <LDevice inst="LD2" />
            </Server>
          </AccessPoint>
        </IED>
      </SCL>
    `);

    const server = doc.querySelector('Server')!;
    const wizard = createLDeviceWizard(server);
    const edits = wizard.primary!.action(
      [input('inst', 'LD3'), input('ldName', 'LD_NEW')],
      document.createElement('div'),
    ) as EditV2[];

    xmlEditor.commit(edits);

    const ldevice = doc.querySelector('LDevice[inst="LD3"]');
    expect(ldevice).to.exist;

    expect(ldevice!.getAttribute('inst')).to.equal('LD3');
    expect(ldevice!.getAttribute('ldName')).to.equal('LD_NEW');
  });

  it('creates an LDevice without ldName when ConfLdName is missing', () => {
    const xmlEditor = new XMLEditor();
    const doc = parseXml(`
      <SCL>
        <IED name="IED1">
          <AccessPoint name="AP1">
            <Server></Server>
          </AccessPoint>
        </IED>
      </SCL>
    `);

    const server = doc.querySelector('Server')!;
    const wizard = createLDeviceWizard(server);
    const edits = wizard.primary!.action(
      [input('inst', 'LD3'), input('ldName', 'LD_NEW')],
      document.createElement('div'),
    );

    xmlEditor.commit(edits);

    const ldevice = doc.querySelector('LDevice[inst="LD3"]');
    expect(ldevice).to.exist;

    expect(ldevice!.getAttribute('inst')).to.equal('LD3');
    expect(ldevice!.hasAttribute('ldName')).to.be.false;
  });

  it('updates ldName when allowed and changed', () => {
    const doc = parseXml(`
      <SCL>
        <IED name="IED1">
          <Services><ConfLdName /></Services>
          <AccessPoint name="AP1">
            <Server>
              <LDevice inst="LD1" ldName="LD_A" />
            </Server>
          </AccessPoint>
        </IED>
      </SCL>
    `);

    const ldevice = doc.querySelector('LDevice')!;
    const wizard = editLDeviceWizard(ldevice);
    const edits = wizard.primary!.action(
      [input('ldName', 'LD_B')],
      document.createElement('div'),
    );

    expect(edits).to.have.length(1);
    expect(edits[0]).to.deep.equal({
      element: ldevice,
      attributes: { ldName: 'LD_B' },
    });
  });

  it('does not update ldName when ConfLdName is missing', () => {
    const doc = parseXml(`
      <SCL>
        <IED name="IED1">
          <AccessPoint name="AP1">
            <Server>
              <LDevice inst="LD1" ldName="LD_A" />
            </Server>
          </AccessPoint>
        </IED>
      </SCL>
    `);

    const ldevice = doc.querySelector('LDevice')!;
    const wizard = editLDeviceWizard(ldevice);
    const edits = wizard.primary!.action(
      [input('ldName', 'LD_B')],
      document.createElement('div'),
    );

    expect(edits).to.have.length(0);
  });

  it('renders ldName pattern and reserved inst values', () => {
    const doc = parseXml(`
      <SCL>
        <IED name="IED1">
          <Services><ConfLdName /></Services>
          <AccessPoint name="AP1">
            <Server>
              <LDevice inst="LD1" ldName="LD_A" />
              <LDevice inst="LD2" />
            </Server>
          </AccessPoint>
        </IED>
      </SCL>
    `);

    const server = doc.querySelector('Server')!;
    const wizard = createLDeviceWizard(server);
    const container = renderContent(wizard);

    const instField = container.querySelector(
      'scl-text-field[label="inst"]',
    ) as HTMLElement;
    const ldNameField = container.querySelector(
      'scl-text-field[label="ldName"]',
    ) as HTMLElement;

    expect(instField).to.exist;
    expect((instField as { reservedValues?: string[] }).reservedValues).to.eql([
      'LD1',
      'LD2',
    ]);
    expect(ldNameField).to.exist;
    expect(ldNameField.getAttribute('pattern')).to.equal(lDeviceNamePattern());
  });
});
