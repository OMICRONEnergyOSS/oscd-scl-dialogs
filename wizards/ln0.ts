import { html, TemplateResult } from 'lit';

import { EditV2 } from '@openscd/oscd-api';

import {
  getValue,
  Wizard,
  WizardActor,
  WizardInputElement,
} from '../foundation.js';
import { patterns } from './patterns.js';

function getLNodeTypeOptions(element: Element): string[] {
  const doc = element.ownerDocument;
  const lNodeTypes = Array.from(
    doc.querySelectorAll('DataTypeTemplates > LNodeType[lnClass="LLN0"]'),
  );
  return lNodeTypes
    .map(type => type.getAttribute('id'))
    .filter((id): id is string => !!id);
}

function render(element: Element, lnodeTypeIds: string[]): TemplateResult[] {
  const lnType = element.getAttribute('lnType');
  const desc = element.getAttribute('desc');
  const lnClass = element.getAttribute('lnClass');
  const inst = element.getAttribute('inst');

  return [
    html`<scl-select
      label="lnType"
      .value=${lnType}
      required
      .selectOptions=${lnodeTypeIds}
    ></scl-select>`,
    html`<scl-text-field
      label="desc"
      .value=${desc}
      nullable
      supportingText="Logical node zero description"
      pattern="${patterns.normalizedString}"
    ></scl-text-field>`,
    html`<scl-text-field
      label="lnClass"
      .value=${lnClass}
      readOnly
      disabled
      required
      supportingText="Logical node class"
      pattern="${patterns.lnClass}"
    ></scl-text-field>`,
    html`<scl-text-field
      label="inst"
      .value=${inst}
      readOnly
      disabled
      supportingText="Logical node instance"
    ></scl-text-field>`,
  ];
}

function updateAction(element: Element): WizardActor {
  return (inputs: WizardInputElement[]): EditV2[] => {
    const attributes: Record<string, string | null> = {};
    // Key attributes omitted from update are: 'lnClass', 'inst'.
    const keys = ['lnType', 'desc'];
    keys.forEach(key => {
      attributes[key] = getValue(inputs.find(i => i.label === key)!);
    });

    const hasChanges = keys.some(
      key => attributes[key] !== element.getAttribute(key),
    );
    if (!hasChanges) {
      return [];
    }

    return [
      {
        element,
        attributes,
      },
    ];
  };
}

export function updateLN0Wizard(element: Element): Wizard {
  const lnodeTypeIds = getLNodeTypeOptions(element);

  return {
    title: 'Edit LN0',
    primary: {
      icon: 'edit',
      label: 'save',
      action: updateAction(element),
    },
    content: render(element, lnodeTypeIds),
  };
}
