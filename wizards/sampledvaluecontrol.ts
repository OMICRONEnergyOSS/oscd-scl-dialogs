import { html, TemplateResult } from 'lit';

import { EditV2 } from '@openscd/oscd-api';

import {
  getValue,
  reservedNames,
  Wizard,
  WizardActor,
  WizardInputElement,
} from '../foundation.js';
import { maxLength, tSecurityEnable, tSmpMod } from './patterns.js';

type RenderOptions = {
  name: string;
  reservedValues: string[];
  desc: string | null;
  smvID: string;
  smpMod: string | null;
  smpRate: string;
  nofASDU: string;
  securityEnabled: string | null;
  multicast: string | null;
};

function render(options: RenderOptions): TemplateResult[] {
  const fields: TemplateResult[] = [
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
    html`<scl-text-field
      label="smvID"
      .value=${options.smvID}
      required
    ></scl-text-field>`,
    html`<scl-select
      label="smpMod"
      .selectOptions=${tSmpMod}
      .value=${options.smpMod}
      nullable
    ></scl-select>`,
    html`<scl-text-field
      label="smpRate"
      .value=${options.smpRate}
      required
      type="number"
      min="0"
    ></scl-text-field>`,
    html`<scl-text-field
      label="nofASDU"
      .value=${options.nofASDU}
      required
      type="number"
      min="0"
    ></scl-text-field>`,
    html`<scl-select
      label="securityEnabled"
      .selectOptions=${tSecurityEnable}
      .value=${options.securityEnabled}
      nullable
    ></scl-select>`,
  ];

  if (options.multicast === 'false') {
    fields.push(
      html`<scl-checkbox
        label="multicast"
        .value=${'false'}
        disabled
      ></scl-checkbox>`,
    );
  }

  return fields;
}

function updateAction(element: Element): WizardActor {
  return (inputs: WizardInputElement[]): EditV2[] => {
    const name = getValue(inputs.find(i => i.label === 'name')!)!;
    const desc = getValue(inputs.find(i => i.label === 'desc')!);
    const smvID = getValue(inputs.find(i => i.label === 'smvID')!)!;
    const smpMod = getValue(inputs.find(i => i.label === 'smpMod')!);
    const smpRate = getValue(inputs.find(i => i.label === 'smpRate')!)!;
    const nofASDU = getValue(inputs.find(i => i.label === 'nofASDU')!)!;
    const securityEnabled = getValue(
      inputs.find(i => i.label === 'securityEnabled')!,
    );

    if (
      name === element.getAttribute('name') &&
      desc === element.getAttribute('desc') &&
      smvID === element.getAttribute('smvID') &&
      smpMod === element.getAttribute('smpMod') &&
      smpRate === element.getAttribute('smpRate') &&
      nofASDU === element.getAttribute('nofASDU') &&
      securityEnabled === element.getAttribute('securityEnabled')
    ) {
      return [];
    }

    return [
      {
        element,
        attributes: {
          name,
          desc,
          smvID,
          smpMod,
          smpRate,
          nofASDU,
          securityEnabled,
        },
      },
    ];
  };
}

export function editSampledValueControlWizard(element: Element): Wizard {
  return {
    title: 'Edit SampledValueControl',
    primary: {
      icon: 'edit',
      label: 'save',
      action: updateAction(element),
    },
    content: render({
      name: element.getAttribute('name') ?? '',
      reservedValues: reservedNames(element),
      desc: element.getAttribute('desc'),
      smvID: element.getAttribute('smvID') ?? '',
      smpMod: element.getAttribute('smpMod'),
      smpRate: element.getAttribute('smpRate') ?? '',
      nofASDU: element.getAttribute('nofASDU') ?? '',
      securityEnabled: element.getAttribute('securityEnabled'),
      multicast: element.getAttribute('multicast'),
    }),
  };
}
