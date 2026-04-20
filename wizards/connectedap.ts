import { html } from 'lit';

import { EditV2 } from '@openscd/oscd-api';

import {
  SelectionList,
  SelectItem,
} from '@openenergytools/filterable-lists/dist/SelectionList.js';
import { SclCheckbox } from '@openenergytools/scl-checkbox';

import {
  appIdGenerator,
  getReference,
  identity,
  macAddressGenerator,
} from '@openscd/scl-lib';

import {
  compareNames,
  createElement,
  getTypes,
  getValue,
  Wizard,
  WizardActor,
  WizardInputElement,
} from '../foundation.js';

import { contentAddress, updateAddress } from './address.js';

interface AccessPointDescription {
  element: Element;
  connected?: boolean;
}

function initSMVElements(
  doc: XMLDocument,
  connectedAp: Element,
  options: {
    macGeneratorSmv: () => string | null;
    appidGeneratorSmv: () => string | null;
    unconnectedSampledValueControl: Set<string>;
  },
): EditV2[] {
  const actions: EditV2[] = [];

  const ied = doc.querySelector(
    `IED[name="${connectedAp.getAttribute('iedName')}"]`,
  );

  Array.from(ied?.querySelectorAll('SampledValueControl') ?? [])
    .filter(sampledValueControl => {
      const id = identity(sampledValueControl) as string;

      if (options.unconnectedSampledValueControl.has(id)) {
        options.unconnectedSampledValueControl.delete(id);
        return true;
      }

      return false;
    })
    .forEach(sampledValueControl => {
      const cbName = sampledValueControl.getAttribute('name');
      const ldInst =
        sampledValueControl.closest('LDevice')?.getAttribute('inst') ?? null;

      const sMV = createElement(connectedAp.ownerDocument, 'SMV', {
        cbName,
        ldInst,
      });
      actions.push({
        parent: connectedAp,
        node: sMV,
        reference: getReference(connectedAp, 'SMV'),
      });

      const address = createElement(connectedAp.ownerDocument, 'Address', {});
      actions.push({
        parent: sMV,
        node: address,
        reference: getReference(sMV, 'Address'),
      });

      const pMac = createElement(connectedAp.ownerDocument, 'P', {
        type: 'MAC-Address',
      });
      pMac.textContent = options.macGeneratorSmv();
      actions.push({
        parent: address,
        node: pMac,
        reference: getReference(address, 'P'),
      });

      const pAppId = createElement(connectedAp.ownerDocument, 'P', {
        type: 'APPID',
      });
      pAppId.textContent = options.appidGeneratorSmv();
      actions.push({
        parent: address,
        node: pAppId,
        reference: getReference(address, 'P'),
      });

      const pVlanId = createElement(connectedAp.ownerDocument, 'P', {
        type: 'VLAN-ID',
      });
      pVlanId.textContent = '000';
      actions.push({
        parent: address,
        node: pVlanId,
        reference: getReference(address, 'P'),
      });

      const pVlanPrio = createElement(connectedAp.ownerDocument, 'P', {
        type: 'VLAN-PRIORITY',
      });
      pVlanPrio.textContent = '4';
      actions.push({
        parent: address,
        node: pVlanPrio,
        reference: getReference(address, 'P'),
      });
    });

  return actions;
}

function initGSeElements(
  doc: XMLDocument,
  connectedAp: Element,
  options: {
    macGeneratorGse: () => string | null;
    appidGeneratorGse: () => string | null;
    unconnectedGseControl: Set<string>;
  },
): EditV2[] {
  const actions: EditV2[] = [];

  const ied = doc.querySelector(
    `IED[name="${connectedAp.getAttribute('iedName')}"]`,
  );

  Array.from(ied?.querySelectorAll('GSEControl') ?? [])
    .filter(gseControl => {
      const id = identity(gseControl) as string;

      if (options.unconnectedGseControl.has(id)) {
        options.unconnectedGseControl.delete(id);
        return true;
      }

      return false;
    })
    .forEach(gseControl => {
      const cbName = gseControl.getAttribute('name');
      const ldInst =
        gseControl.closest('LDevice')?.getAttribute('inst') ?? null;

      const gSE = createElement(connectedAp.ownerDocument, 'GSE', {
        cbName,
        ldInst,
      });
      actions.push({
        parent: connectedAp,
        node: gSE,
        reference: getReference(connectedAp, 'GSE'),
      });

      const address = createElement(connectedAp.ownerDocument, 'Address', {});
      actions.push({
        parent: gSE,
        node: address,
        reference: getReference(gSE, 'Address'),
      });

      const pMac = createElement(connectedAp.ownerDocument, 'P', {
        type: 'MAC-Address',
      });
      pMac.textContent = options.macGeneratorGse();
      actions.push({
        parent: address,
        node: pMac,
        reference: getReference(address, 'P'),
      });

      const pAppId = createElement(connectedAp.ownerDocument, 'P', {
        type: 'APPID',
      });
      pAppId.textContent = options.appidGeneratorGse();
      actions.push({
        parent: address,
        node: pAppId,
        reference: getReference(address, 'P'),
      });

      const pVlanId = createElement(connectedAp.ownerDocument, 'P', {
        type: 'VLAN-ID',
      });
      pVlanId.textContent = '000';
      actions.push({
        parent: address,
        node: pVlanId,
        reference: getReference(address, 'P'),
      });

      const pVlanPrio = createElement(connectedAp.ownerDocument, 'P', {
        type: 'VLAN-PRIORITY',
      });
      pVlanPrio.textContent = '4';
      actions.push({
        parent: address,
        node: pVlanPrio,
        reference: getReference(address, 'P'),
      });

      const minTime = createElement(connectedAp.ownerDocument, 'MinTime', {
        unit: 's',
        multiplier: 'm',
      });
      minTime.textContent = '10';
      actions.push({
        parent: gSE,
        node: minTime,
        reference: getReference(gSE, 'MinTime'),
      });

      const maxTime = createElement(connectedAp.ownerDocument, 'MaxTime', {
        unit: 's',
        multiplier: 'm',
      });
      maxTime.textContent = '10000';
      actions.push({
        parent: gSE,
        node: maxTime,
        reference: getReference(gSE, 'MaxTime'),
      });
    });

  return actions;
}

function unconnectedGseControls(doc: XMLDocument): Set<string> {
  const allGseControl = Array.from(doc.querySelectorAll('GSEControl'));

  const unconnectedGseControl = allGseControl
    .filter(gseControl => {
      const iedName = gseControl.closest('IED')?.getAttribute('name');
      const ldInst = gseControl.closest('LDevice')?.getAttribute('inst');
      const cbName = gseControl.getAttribute('name');

      return !doc.querySelector(
        `ConnectedAP[iedName="${iedName}"] ` +
          `> GSE[ldInst="${ldInst}"][cbName="${cbName}"]`,
      );
    })
    .map(gseControl => identity(gseControl) as string);

  const mySet = new Set(unconnectedGseControl);
  return mySet;
}

function unconnectedSampledValueControls(doc: XMLDocument): Set<string> {
  const allSmvControl = Array.from(doc.querySelectorAll('SampledValueControl'));

  const unconnectedSmvControl = allSmvControl
    .filter(gseControl => {
      const iedName = gseControl.closest('IED')?.getAttribute('name');
      const ldInst = gseControl.closest('LDevice')?.getAttribute('inst');
      const cbName = gseControl.getAttribute('name');

      return !doc.querySelector(
        `ConnectedAP[iedName="${iedName}"] ` +
          `> SMV[ldInst="${ldInst}"][cbName="${cbName}"]`,
      );
    })
    .map(gseControl => identity(gseControl) as string);

  const mySet = new Set(unconnectedSmvControl);
  return mySet;
}

function createConnectedApAction(parent: Element): WizardActor {
  return (_: WizardInputElement[], wizard: Element): EditV2[] => {
    const doc = parent.ownerDocument;

    // generators ensure unique MAC-Address and APPID across the project
    const macGeneratorSmv = macAddressGenerator(doc, 'SMV');
    const appidGeneratorSmv = appIdGenerator(doc, 'SMV');
    const macGeneratorGse = macAddressGenerator(doc, 'GSE');
    const appidGeneratorGse = appIdGenerator(doc, 'GSE');

    // track GSE and SMV for multiselect access points connection
    const unconnectedGseControl = unconnectedGseControls(doc);
    const unconnectedSampledValueControl = unconnectedSampledValueControls(doc);

    const list = wizard.querySelector('#apList') as SelectionList;
    if (!list) {
      return [];
    }

    const actions = list.selectedElements.map(accP => {
      const id = `${identity(accP)}`;
      const [iedName, apName] = id.split('>');
      const connAPactions: EditV2[] = [];

      const connectedAp = createElement(parent.ownerDocument, 'ConnectedAP', {
        iedName,
        apName,
      });
      connAPactions.push({
        parent,
        node: connectedAp,
        reference: getReference(parent, 'ConnectedAP'),
      });
      connAPactions.push(
        ...initSMVElements(doc, connectedAp, {
          macGeneratorSmv,
          appidGeneratorSmv,
          unconnectedSampledValueControl,
        }),
      );
      connAPactions.push(
        ...initGSeElements(doc, connectedAp, {
          macGeneratorGse,
          appidGeneratorGse,
          unconnectedGseControl,
        }),
      );

      return connAPactions;
    });

    return actions;
  };
}

/** Sorts connected `AccessPoint`s to the bottom. */
function compareAccessPointConnection(
  a: AccessPointDescription,
  b: AccessPointDescription,
): number {
  if (a.connected !== b.connected) {
    return b.connected ? -1 : 1;
  }
  return 0;
}

function existConnectedAp(accessPoint: Element): boolean {
  const iedName = accessPoint.closest('IED')?.getAttribute('name');
  const apName = accessPoint.getAttribute('name');

  const connAp = accessPoint.ownerDocument.querySelector(
    `ConnectedAP[iedName="${iedName}"][apName="${apName}"]`,
  );

  return !!connAp;
}

/** @returns single page  [[`Wizard`]] for creating SCL element ConnectedAP. */
export function createConnectedApWizard(element: Element): Wizard {
  const doc = element.ownerDocument;

  const accessPoints = Array.from(doc.querySelectorAll(':root > IED'))
    .sort(compareNames)
    .flatMap(ied =>
      Array.from(ied.querySelectorAll(':root > IED > AccessPoint')),
    )
    .map(accesspoint => ({
      element: accesspoint,
      connected: existConnectedAp(accesspoint),
    }))
    .sort(compareAccessPointConnection);

  const items: SelectItem[] = accessPoints.map(appP => ({
    headline: `${identity(appP.element)}`,
    supportingText: appP.connected ? 'AccessPoint already connected!' : '',
    selected: !appP.connected,
    disabled: appP.connected,
    attachedElement: appP.element,
  }));

  return {
    title: 'Add ConnectedAP',
    primary: {
      icon: 'save',
      label: 'save',
      action: createConnectedApAction(element),
    },
    content: [
      html`<selection-list
        id="apList"
        multi
        .items=${items}
        filterable
      ></selection-list>`,
    ],
  };
}

function updateAction(element: Element): WizardActor {
  return (inputs: WizardInputElement[], wizard: Element): EditV2[] => {
    const instType: boolean =
      (wizard.querySelector('#instType') as SclCheckbox).value === 'true';

    const addressContent: Record<string, string | null> = {};
    inputs.forEach(input => {
      if (!(input instanceof SclCheckbox)) {
        const key = input.label;
        const value = getValue(input);
        addressContent[key] = value;
      }
    });

    return updateAddress(element, addressContent, instType);
  };
}

/** @returns single page [[`Wizard`]] to edit SCL element ConnectedAP. */
export function editConnectedApWizard(element: Element): Wizard {
  return {
    title: 'Edit ConnectedAP',
    primary: {
      icon: 'save',
      label: 'save',
      action: updateAction(element),
    },
    content: [...contentAddress({ element, types: getTypes(element) })],
  };
}
