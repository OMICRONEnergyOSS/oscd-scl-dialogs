import { html, TemplateResult } from 'lit';

import { EditV2 } from '@openscd/oscd-api';

import {
  getValue,
  Wizard,
  WizardActor,
  WizardInputElement,
} from '../foundation.js';

const smvOptKeys = [
  'refreshTime',
  'sampleRate',
  'dataSet',
  'security',
  'synchSourceId',
] as const;

type SmvOptKey = (typeof smvOptKeys)[number];

type RenderOptions = Record<SmvOptKey, string | null>;

function render(options: RenderOptions): TemplateResult[] {
  return smvOptKeys.map(
    key =>
      html`<scl-checkbox
        label="${key}"
        .value=${options[key]}
        nullable
      ></scl-checkbox>`,
  );
}

function updateAction(element: Element): WizardActor {
  return (inputs: WizardInputElement[]): EditV2[] => {
    const attributes: Record<string, string | null> = {};
    for (const key of smvOptKeys) {
      attributes[key] = getValue(inputs.find(i => i.label === key)!);
    }

    if (!smvOptKeys.some(key => attributes[key] !== element.getAttribute(key)))
      return [];

    return [{ element, attributes }];
  };
}

export function editSmvOptsWizard(element: Element): Wizard {
  const options = {} as RenderOptions;
  for (const key of smvOptKeys) {
    options[key] = element.getAttribute(key);
  }

  return {
    title: 'Edit SmvOpts',
    primary: {
      icon: 'edit',
      label: 'save',
      action: updateAction(element),
    },
    content: render(options),
  };
}
