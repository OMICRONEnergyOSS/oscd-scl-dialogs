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
  const ConfLdName = element
    .closest('IED')
    ?.querySelector('Services > ConfLdName');
  if (ConfLdName) {
    return true;
  }

  return false;
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
  inst: string,
  ldName: string | null,
  reservedInsts: string[],
  allowLdName: boolean,
  disableInst: boolean,
): TemplateResult[] {
  const content = [
    html`<scl-text-field
      label="inst"
      .value=${inst}
      .reservedValues=${reservedInsts}
      pattern="${patterns.ldInst}"
      required
      ?disabled=${disableInst}
      ?dialogInitialFocus=${!disableInst}
    ></scl-text-field>`,
  ];

  if (allowLdName) {
    content.push(
      html`<scl-text-field
        label="ldName"
        .value=${ldName}
        nullable
        pattern="${lDeviceNamePattern()}"
      ></scl-text-field>`,
    );
  }

  return content;
}

export function createAction(parent: Element): WizardActor {
  return (inputs: WizardInputElement[]): EditV2[] => {
    const inst = getValue(inputs.find(i => i.label === 'inst')!)!;
    const ldNameAllowed = ldNameIsAllowed(parent);
    const ldName = ldNameAllowed
      ? getValue(inputs.find(i => i.label === 'ldName')!)
      : null;

    const node = createElement(parent.ownerDocument, 'LDevice', {
      inst,
      ldName,
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
    const ldName = ldNameAllowed
      ? getValue(inputs.find(i => i.label === 'ldName')!)
      : null;

    if (!ldNameAllowed || ldName === element.getAttribute('ldName')) {
      return [];
    }

    return [
      {
        element,
        attributes: { ldName },
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
      '',
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
      element.getAttribute('inst') ?? '',
      element.getAttribute('ldName'),
      reservedInstLDevice(element),
      ldNameIsAllowed(element),
      true,
    ),
  };
}
