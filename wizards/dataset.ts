import { html, TemplateResult } from 'lit';

import { EditV2 } from '@openscd/oscd-api';

import { SelectionList } from '@openenergytools/filterable-lists/dist/SelectionList.js';

import {
  getValue,
  Wizard,
  WizardActor,
  WizardInputElement,
} from '../foundation.js';

type RenderOptions = {
  name: string;
  desc: string | null;
  fcdas: Element[];
};

function fcdaLabel(fcda: Element): string {
  const parts: string[] = [];

  const ldInst = fcda.getAttribute('ldInst');
  if (ldInst) parts.push(ldInst);

  const prefix = fcda.getAttribute('prefix') ?? '';
  const lnClass = fcda.getAttribute('lnClass') ?? '';
  const lnInst = fcda.getAttribute('lnInst') ?? '';
  if (lnClass) parts.push(`${prefix}${lnClass}${lnInst}`);

  const doName = fcda.getAttribute('doName');
  if (doName) parts.push(doName);

  const daName = fcda.getAttribute('daName');
  if (daName) parts.push(daName);

  const fc = fcda.getAttribute('fc');
  if (fc) parts.push(`[${fc}]`);

  return parts.join('.');
}

function render(options: RenderOptions): TemplateResult[] {
  return [
    html`<scl-text-field
      label="name"
      .value=${options.name}
      disabled
      dialogInitialFocus
    ></scl-text-field>`,
    html`<scl-text-field
      label="desc"
      .value=${options.desc}
      nullable
    ></scl-text-field>`,
    html`<selection-list
      id="fcda-list"
      .items=${options.fcdas.map(fcda => ({
        headline: fcdaLabel(fcda),
        attachedElement: fcda,
        selected: true,
      }))}
    ></selection-list>`,
  ];
}

function updateAction(element: Element): WizardActor {
  return (inputs: WizardInputElement[], wizard: Element): EditV2[] => {
    const name = getValue(inputs.find(i => i.label === 'name')!)!;
    const desc = getValue(inputs.find(i => i.label === 'desc')!);

    const edits: EditV2[] = [];

    // Collect FCDA removals from the selection list
    const list = wizard.querySelector('#fcda-list') as SelectionList | null;
    if (list) {
      const selectedFcdas = new Set(list.selectedElements);
      const allFcdas = Array.from(element.querySelectorAll('FCDA'));
      for (const fcda of allFcdas) {
        if (!selectedFcdas.has(fcda)) {
          edits.push({ node: fcda });
        }
      }
    }

    // Collect attribute changes
    if (
      name !== element.getAttribute('name') ||
      desc !== element.getAttribute('desc')
    ) {
      edits.push({ element, attributes: { name, desc } });
    }

    return edits;
  };
}

export function editDataSetWizard(element: Element): Wizard {
  return {
    title: 'Edit DataSet',
    primary: {
      icon: 'edit',
      label: 'save',
      action: updateAction(element),
    },
    content: render({
      name: element.getAttribute('name') ?? '',
      desc: element.getAttribute('desc'),
      fcdas: Array.from(element.querySelectorAll('FCDA')),
    }),
  };
}
