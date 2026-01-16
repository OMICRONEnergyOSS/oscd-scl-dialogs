import { html, TemplateResult } from 'lit';

import { EditV2 } from '@openscd/oscd-api';
import { updateIED } from '@openscd/scl-lib';

import {
  getValue,
  Wizard,
  WizardActor,
  WizardInputElement,
} from '../foundation.js';

function renderAdd(
  name: string,
  iedNames: string[],
  desc: string | null,
): TemplateResult[] {
  return [
    html`<scl-text-field
      label="name"
      .value=${name}
      .reservedValues=${iedNames}
      required
      dialogInitialFocus
    ></scl-text-field>`,
    html`<scl-text-field
      label="desc"
      .value=${desc}
      nullable
    ></scl-text-field>`,
  ];
}

function renderEdit(
  name: string,
  iedNames: string[],
  desc: string | null,
  type: string | null,
  manufacturer: string | null,
  owner: string | null,
): TemplateResult[] {
  return [
    ...renderAdd(name, iedNames, desc),
    html`<scl-text-field
      label="type"
      .value=${type}
      disabled
    ></scl-text-field>`,
    html`<scl-text-field
      label="manufacturer"
      .value=${manufacturer}
      disabled
    ></scl-text-field>`,
    html`<scl-text-field
      label="owner"
      .value=${owner}
      disabled
    ></scl-text-field>`,
  ];
}

export function updateAction(element: Element): WizardActor {
  return (inputs: WizardInputElement[]): EditV2[] => {
    const name = inputs.find(i => i.label === 'name')!.value!;
    const desc = getValue(inputs.find(i => i.label === 'desc')!);

    if (
      name === element.getAttribute('name') &&
      desc === element.getAttribute('desc')
    ) {
      return [];
    }

    return updateIED({
      element,
      attributes: { name, desc },
    });
  };
}

export function createAction(element: Element): WizardActor {
  return (inputs: WizardInputElement[]): EditV2[] => {
    const name = inputs.find(i => i.label === 'name')!.value!;
    const desc = getValue(inputs.find(i => i.label === 'desc')!);

    if (
      name === element.getAttribute('name') &&
      desc === element.getAttribute('desc')
    ) {
      return [];
    }

    return [];
  };
}
function getAllOtherIEDNames(parent: Element): string[] {
  return Array.from(parent.ownerDocument.querySelectorAll(':root > IED'))
    .map(ied => ied.getAttribute('name')!)
    .filter(ied => ied !== parent.getAttribute('name'));
}

export function editIEDWizard(element: Element): Wizard {
  const iedNames = getAllOtherIEDNames(element.parentElement!);

  return {
    title: 'Edit IED',
    primary: {
      icon: 'edit',
      label: 'save',
      action: updateAction(element),
    },
    content: renderEdit(
      element.getAttribute('name') ?? '',
      iedNames,
      element.getAttribute('desc'),
      element.getAttribute('type'),
      element.getAttribute('manufacturer'),
      element.getAttribute('owner'),
    ),
  };
}

export function createIEDWizard(parent: Element): Wizard {
  const iedNames = getAllOtherIEDNames(parent);

  return {
    title: 'Add Virtial IED',
    primary: {
      icon: 'add',
      label: 'Create',
      action: updateAction(parent),
    },
    content: renderAdd(
      parent.getAttribute('name') ?? '',
      iedNames,
      parent.getAttribute('desc'),
    ),
  };
}
