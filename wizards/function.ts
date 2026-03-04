import { html, TemplateResult } from 'lit';

import { EditV2 } from '@openscd/oscd-api';
import { getReference } from '@openscd/scl-lib';

import {
  createElement,
  getValue,
  reservedNames,
  Wizard,
  WizardActor,
  WizardInputElement,
} from '../foundation.js';

type RenderOptions = {
  name: string | null;
  desc: string | null;
  type: string | null;
  reservedValues: string[];
};

export function contentFunctionWizard(
  options: RenderOptions,
): TemplateResult[] {
  return [
    html`<scl-text-field
      label="name"
      .value=${options.name}
      required
      .reservedValues=${options.reservedValues}
      dialogInitialFocus
    ></scl-text-field>`,
    html`<scl-text-field
      label="desc"
      .value=${options.desc}
      nullable
    ></scl-text-field>`,
    html`<scl-text-field
      label="type"
      .value=${options.type}
      nullable
    ></scl-text-field>`,
  ];
}

function createFunctionAction(parent: Element): WizardActor {
  return (inputs: WizardInputElement[]): EditV2[] => {
    const functionAttrs: Record<string, string | null> = {};
    const functionKeys = ['name', 'desc', 'type'];
    functionKeys.forEach(key => {
      functionAttrs[key] = getValue(inputs.find(i => i.label === key)!);
    });

    const fUnction = createElement(
      parent.ownerDocument,
      'Function',
      functionAttrs,
    );

    return [
      { parent, node: fUnction, reference: getReference(parent, 'Function') },
    ];
  };
}

export function createFunctionWizard(parent: Element): Wizard {
  const name = '';
  const desc = null;
  const type = null;

  return {
    title: 'Add Function',
    primary: {
      icon: 'save',
      label: 'save',
      action: createFunctionAction(parent),
    },
    content: [
      ...contentFunctionWizard({
        name,
        desc,
        type,
        reservedValues: reservedNames(parent, 'Function'),
      }),
    ],
  };
}

function updateFunction(element: Element): WizardActor {
  return (inputs: WizardInputElement[]): EditV2[] => {
    const attributes: Record<string, string | null> = {};
    const functionKeys = ['name', 'desc', 'type'];
    functionKeys.forEach(key => {
      attributes[key] = getValue(inputs.find(i => i.label === key)!);
    });

    if (
      functionKeys.some(key => attributes[key] !== element.getAttribute(key))
    ) {
      return [{ element, attributes }];
    }

    return [];
  };
}

export function editFunctionWizard(element: Element): Wizard {
  const name = element.getAttribute('name');
  const desc = element.getAttribute('desc');
  const type = element.getAttribute('type');

  return {
    title: 'Edit Function',
    primary: {
      icon: 'save',
      label: 'save',
      action: updateFunction(element),
    },
    content: [
      ...contentFunctionWizard({
        name,
        desc,
        type,
        reservedValues: reservedNames(element),
      }),
    ],
  };
}
