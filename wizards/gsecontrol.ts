import { html, TemplateResult } from 'lit';

import { EditV2 } from '@openscd/oscd-api';

import {
  getValue,
  reservedNames,
  Wizard,
  WizardActor,
  WizardInputElement,
} from '../foundation.js';
import { maxLength, tGSEControlType, tSecurityEnable } from './patterns.js';

type RenderOptions = {
  name: string;
  reservedValues: string[];
  desc: string | null;
  type: string | null;
  appID: string;
  fixedOffs: string | null;
  securityEnabled: string | null;
};

function render(options: RenderOptions): TemplateResult[] {
  return [
    html`<scl-text-field
      label="name"
      .value=${options.name}
      required
      maxLength="${maxLength.cbName}"
      .reservedValues=${options.reservedValues}
      dialogInitialFocus
    ></scl-text-field>`,
    html`<scl-text-field
      label="desc"
      .value=${options.desc}
      nullable
    ></scl-text-field>`,
    html`<scl-select
      label="type"
      .selectOptions=${tGSEControlType}
      .value=${options.type}
      nullable
    ></scl-select>`,
    html`<scl-text-field
      label="appID"
      .value=${options.appID}
      required
    ></scl-text-field>`,
    html`<scl-checkbox
      label="fixedOffs"
      .value=${options.fixedOffs}
      nullable
    ></scl-checkbox>`,
    html`<scl-select
      label="securityEnabled"
      .selectOptions=${tSecurityEnable}
      .value=${options.securityEnabled}
      nullable
    ></scl-select>`,
  ];
}

function updateAction(element: Element): WizardActor {
  return (inputs: WizardInputElement[]): EditV2[] => {
    const name = getValue(inputs.find(i => i.label === 'name')!)!;
    const desc = getValue(inputs.find(i => i.label === 'desc')!);
    const type = getValue(inputs.find(i => i.label === 'type')!);
    const appID = getValue(inputs.find(i => i.label === 'appID')!)!;
    const fixedOffs = getValue(inputs.find(i => i.label === 'fixedOffs')!);
    const securityEnabled = getValue(
      inputs.find(i => i.label === 'securityEnabled')!,
    );

    if (
      name === element.getAttribute('name') &&
      desc === element.getAttribute('desc') &&
      type === element.getAttribute('type') &&
      appID === element.getAttribute('appID') &&
      fixedOffs === element.getAttribute('fixedOffs') &&
      securityEnabled === element.getAttribute('securityEnabled')
    ) {
      return [];
    }

    return [
      {
        element,
        attributes: { name, desc, type, appID, fixedOffs, securityEnabled },
      },
    ];
  };
}

export function editGSEControlWizard(element: Element): Wizard {
  return {
    title: 'Edit GSEControl',
    primary: {
      icon: 'edit',
      label: 'save',
      action: updateAction(element),
    },
    content: render({
      name: element.getAttribute('name') ?? '',
      reservedValues: reservedNames(element),
      desc: element.getAttribute('desc'),
      type: element.getAttribute('type'),
      appID: element.getAttribute('appID') ?? '',
      fixedOffs: element.getAttribute('fixedOffs'),
      securityEnabled: element.getAttribute('securityEnabled'),
    }),
  };
}
