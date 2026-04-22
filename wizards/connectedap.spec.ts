/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect, fixture } from '@open-wc/testing';
import { html } from 'lit';

import { editConnectedApWizard } from './connectedap.js';
import { EditV2 } from '@openscd/oscd-api';
import { XMLEditor } from '@openscd/oscd-editor';
import { SclTextField } from '@openenergytools/scl-text-field';
import { SclCheckbox } from '@openenergytools/scl-checkbox';
import { WizardInputElement } from '../foundation.js';

if (!customElements.get('scl-text-field'))
  customElements.define('scl-text-field', SclTextField);
if (!customElements.get('scl-checkbox'))
  customElements.define('scl-checkbox', SclCheckbox);

async function setSclTextFieldValue(
  field: SclTextField,
  value: string,
): Promise<void> {
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
function createSclDoc(): XMLDocument {
  return xmlParser.parseFromString(
    `<?xml version="1.0" encoding="UTF-8"?>
<SCL xmlns="http://www.iec.ch/61850/2003/SCL"
     version="2007"
     revision="B"
     release="4">
  <Substation name="S1">
    <VoltageLevel name="V1">
      <Bay name="PUB"/>
      <Bay name="SUB"/>
    </VoltageLevel>
  </Substation>
  <Communication>
    <SubNetwork name="StationBus" type="8-MMS">
      <BitRate unit="b/s" multiplier="M">100</BitRate>
      <ConnectedAP iedName="PUB_A" apName="AP1">
        <GSE ldInst="LD_A" cbName="GCB_A">
          <Address>
            <P type="MAC-Address">01-0C-CD-01-00-01</P>
            <P type="APPID">0001</P>
          </Address>
          <MinTime unit="s" multiplier="m">10</MinTime>
          <MaxTime unit="s" multiplier="m">1000</MaxTime>
        </GSE>
      </ConnectedAP>
    </SubNetwork>
  </Communication>
  <IED name="PUB_A" manufacturer="OpenSCD">
    <AccessPoint name="AP1">
      <Server>
        <Authentication/>
        <LDevice inst="LD_A">
          <LN0 lnClass="LLN0" inst="" lnType="LLN0_Test">
            <DataSet name="DS_A">
              <FCDA ldInst="LD_A" prefix="" lnClass="TCTR" lnInst="1" doName="Beh" daName="stVal" fc="ST"/>
              <FCDA ldInst="LD_A" prefix="" lnClass="TCTR" lnInst="1" doName="Beh" daName="q" fc="ST"/>
            </DataSet>
            <GSEControl name="GCB_A" type="GOOSE" appID="0001" confRev="1" datSet="DS_A"/>
          </LN0>
          <LN lnClass="TCTR" inst="1" lnType="TCTR_Test">
            <DOI name="Beh">
              <DAI name="stVal">
                <Val>on</Val>
              </DAI>
            </DOI>
            <DOI name="HzRtg"/>
            <DOI name="ARtg"/>
          </LN>
        </LDevice>
      </Server>
    </AccessPoint>
  </IED>
</SCL>`,
    'application/xml',
  );
}

describe('ConnectedAP wizard', () => {
  let xmlEditor: XMLEditor;

  beforeEach(() => {
    xmlEditor = new XMLEditor();
  });

  it('Editing a ConnectedAP to add an IP/Subnet does not affect GSE elements contained within', async () => {
    const doc = createSclDoc();
    const connectedAP = doc.querySelector('ConnectedAP')!;
    expect(connectedAP).to.exist;

    // Verify GSE > Address exists before editing
    const gseBefore = connectedAP.querySelector('GSE');
    expect(gseBefore).to.exist;
    const gseAddressBefore = gseBefore!.querySelector('Address');
    expect(gseAddressBefore).to.exist;
    expect(gseAddressBefore!.querySelectorAll('P').length).to.equal(2);

    // Create the edit wizard
    const wizard = editConnectedApWizard(connectedAP);
    expect(wizard).to.exist;
    expect(wizard.primary).to.exist;

    // Render the wizard content
    const content = await fixture(html`<form>${wizard.content}</form>`);

    // Find the IP field and set a value
    const ipField = content.querySelector(
      'scl-text-field[label="IP"]',
    ) as SclTextField;
    expect(ipField).to.exist;
    await setSclTextFieldValue(ipField, '192.168.0.1');

    // Find the IP-SUBNET field and set a value
    const subnetField = content.querySelector(
      'scl-text-field[label="IP-SUBNET"]',
    ) as SclTextField;
    expect(subnetField).to.exist;
    await setSclTextFieldValue(subnetField, '255.255.255.0');

    // Gather inputs (all scl-text-field elements)
    const inputs = Array.from(
      content.querySelectorAll('scl-text-field'),
    ) as WizardInputElement[];

    // Execute the update action
    const edits = wizard.primary!.action(inputs, content) as EditV2[];
    expect(edits).to.exist;
    expect(edits.length).to.be.greaterThan(0);

    // Apply edits
    xmlEditor.commit(edits);

    // After applying edits, verify the GSE > Address still exists and is intact
    const gseAfter = connectedAP.querySelector('GSE');
    expect(gseAfter, 'GSE element should still exist').to.exist;

    const gseAddressAfter = gseAfter!.querySelector('Address');
    expect(
      gseAddressAfter,
      'GSE > Address element should still exist after editing ConnectedAP address',
    ).to.exist;

    const gsePElements = gseAddressAfter!.querySelectorAll('P');
    expect(
      gsePElements.length,
      'GSE > Address should still have 2 P elements',
    ).to.equal(2);

    const macAddress = Array.from(gsePElements).find(
      p => p.getAttribute('type') === 'MAC-Address',
    );
    expect(macAddress, 'GSE MAC-Address should be preserved').to.exist;
    expect(macAddress!.textContent).to.equal('01-0C-CD-01-00-01');

    const appId = Array.from(gsePElements).find(
      p => p.getAttribute('type') === 'APPID',
    );
    expect(appId, 'GSE APPID should be preserved').to.exist;
    expect(appId!.textContent).to.equal('0001');

    // Also verify that the ConnectedAP now has its own direct Address child
    const connApAddress = connectedAP.querySelector(':scope > Address');
    expect(
      connApAddress,
      'ConnectedAP should have a direct Address child with IP info',
    ).to.exist;
  });
});
