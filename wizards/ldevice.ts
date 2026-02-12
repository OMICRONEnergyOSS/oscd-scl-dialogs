import { html, TemplateResult } from 'lit';

import { EditV2 } from '@openscd/oscd-api';

import { getReference } from '@openscd/scl-lib';

import {
  createElement,
  getValue,
  Wizard,
  WizardActor,
  WizardInputElement,
} from '../foundation.js';
import { patterns } from './patterns.js';
import { SclTextField } from '@openenergytools/scl-text-field';

export function lDeviceNamePattern(): string {
  return (
    '[A-Za-z][0-9A-Za-z_]{0,2}|' +
    '[A-Za-z][0-9A-Za-z_]{4,63}|' +
    '[A-MO-Za-z][0-9A-Za-z_]{3}|' +
    'N[0-9A-Za-np-z_][0-9A-Za-z_]{2}|' +
    'No[0-9A-Za-mo-z_][0-9A-Za-z_]|' +
    'Non[0-9A-Za-df-z_]'
  );
}

function ldNameIsAllowed(element: Element): boolean {
  return !!element.closest('IED')?.querySelector('Services > ConfLdName');
}

function reservedInstLDevice(currentElement: Element): string[] {
  const ied = currentElement.closest('IED');
  if (!ied) {
    return [];
  }

  return Array.from(
    ied.querySelectorAll(':scope > AccessPoint > Server > LDevice'),
  )
    .map(ld => ld.getAttribute('inst') ?? '')
    .filter(name => name !== currentElement.getAttribute('inst'));
}

function render(
  inst: string | null,
  ldName: string | null,
  desc: string | null,
  reservedInsts: string[],
  allowLdName: boolean,
  disableInst: boolean,
): TemplateResult[] {
  const content = [
    allowLdName
      ? html`<scl-text-field
          label="ldName"
          .value=${ldName}
          nullable
          supportingText="Logical device name"
          validationMessage="Required"
          dialogInitialFocus
          pattern="${lDeviceNamePattern()}"
        ></scl-text-field>`
      : html`<scl-text-field
          label="ldName"
          .value=${ldName}
          supportingText="IED doesn't support Functional Naming"
          helperPersistent
          readOnly
          disabled
        ></scl-text-field>`,
    html`<scl-text-field
      label="desc"
      .value=${desc}
      nullable
      supportingText="Logical device description"
      pattern="${patterns.normalizedString}"
    ></scl-text-field>`,
    html`<scl-text-field
      label="inst"
      .value=${inst}
      ?disabled=${disableInst}
      required
      supportingText="Logical device inst"
      pattern="${patterns.normalizedString}"
      @input=${(e: Event) => {
        const input = e.target as SclTextField;
        const currentValue = getValue(input) ?? '';
        let customValidityMsg = '';
        if (reservedInsts.includes(currentValue)) {
          customValidityMsg = `"${currentValue}" is already in use`;
        }
        input.setCustomValidity(customValidityMsg);
        input.reportValidity();
      }}
      .reservedValues=${reservedInsts}
    ></scl-text-field>`,
  ];
  return content;
}

export function createAction(parent: Element): WizardActor {
  return (inputs: WizardInputElement[]): EditV2[] => {
    const inst = getValue(inputs.find(i => i.label === 'inst')!)!;
    const ldNameAllowed = ldNameIsAllowed(parent);
    const ldName = ldNameAllowed
      ? getValue(inputs.find(i => i.label === 'ldName')!)
      : null;
    const desc = getValue(inputs.find(i => i.label === 'desc')!);
    const node = createElement(parent.ownerDocument, 'LDevice', {
      inst,
      ldName,
      desc,
    });

    return [
      {
        parent,
        node,
        reference: getReference(parent, 'LDevice'),
      },
    ];
  };
}

export function updateAction(element: Element): WizardActor {
  return (inputs: WizardInputElement[]): EditV2[] => {
    const ldNameAllowed = ldNameIsAllowed(element);
    const desc = getValue(inputs.find(i => i.label === 'desc')!);
    const ldName = ldNameAllowed
      ? getValue(inputs.find(i => i.label === 'ldName')!)
      : null;

    if (
      ldName === element.getAttribute('ldName') &&
      desc === element.getAttribute('desc')
    ) {
      return [];
    }

    return [
      {
        element,
        attributes: { ldName, desc },
      },
    ];
  };
}

export function createLDeviceWizard(parent: Element): Wizard {
  return {
    title: 'Add LDevice',
    primary: {
      icon: '',
      label: 'save',
      action: createAction(parent),
    },
    content: render(
      null,
      null,
      null,
      reservedInstLDevice(parent),
      ldNameIsAllowed(parent),
      false,
    ),
  };
}

export function editLDeviceWizard(element: Element): Wizard {
  return {
    title: 'Edit LDevice',
    primary: {
      icon: 'edit',
      label: 'save',
      action: updateAction(element),
    },
    content: render(
      element.getAttribute('inst'),
      element.getAttribute('ldName'),
      element.getAttribute('desc'),
      reservedInstLDevice(element),
      ldNameIsAllowed(element),
      true,
    ),
  };
}
