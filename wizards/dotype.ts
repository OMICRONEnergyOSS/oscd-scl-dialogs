import { html } from 'lit';

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

function createDOTypeAction(parent: Element): WizardActor {
  return (inputs: WizardInputElement[]): EditV2[] => {
    const doTypeAttrs: Record<string, string | null> = {};
    const doTypeKeys = ['id', 'desc', 'cdc'];
    doTypeKeys.forEach(key => {
      doTypeAttrs[key] = getValue(inputs.find(i => i.label === key)!);
    });

    const doType = createElement(parent.ownerDocument, 'DOType', doTypeAttrs);

    return [
      { parent, node: doType, reference: getReference(parent, 'DOType') },
    ];
  };
}

export function createDOTypeWizard(parent: Element): Wizard {
  return {
    title: 'Add DOType',
    primary: {
      icon: 'save',
      label: 'Save',
      action: createDOTypeAction(parent),
    },
    content: [
      html`<scl-text-field
        label="id"
        .value=${''}
        required
        maxlength="127"
        minlength="1"
        pattern="${patterns.nmToken}"
      ></scl-text-field>`,
      html`<scl-text-field
        label="desc"
        .value=${null}
        nullable
        pattern="${patterns.normalizedString}"
      ></scl-text-field>`,
      html`<scl-text-field
        label="cdc"
        .value=${'ENS'}
        pattern="${patterns.cdc}"
      ></scl-text-field>`,
    ],
  };
}
