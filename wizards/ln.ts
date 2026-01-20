import { html, TemplateResult } from 'lit';

import { EditV2 } from '@openscd/oscd-api';

import { getReference, lnInstGenerator } from '@openscd/scl-lib';

import {
  SelectionList,
  SelectItem,
} from '@openenergytools/filterable-lists/dist/SelectionList.js';
import { SclTextField } from '@openenergytools/scl-text-field';

import {
  createElement,
  getValue,
  Wizard,
  WizardActor,
  WizardInputElement,
} from '../foundation.js';
import { patterns, maxLength } from './patterns.js';

type LNodeTypeInfo = {
  id: string;
  lnClass: string;
  desc: string | null;
  element: Element;
};

function listLNodeTypes(doc: XMLDocument): LNodeTypeInfo[] {
  return Array.from(
    doc.querySelectorAll(':root > DataTypeTemplates > LNodeType'),
  )
    .map(type => ({
      id: type.getAttribute('id'),
      lnClass: type.getAttribute('lnClass'),
      desc: type.getAttribute('desc'),
      element: type,
    }))
    .filter(
      type => type.id && type.lnClass && type.lnClass !== 'LLN0',
    ) as LNodeTypeInfo[];
}

function renderCreate(lNodeTypes: LNodeTypeInfo[]): TemplateResult[] {
  const items: SelectItem[] = lNodeTypes.map(type => ({
    headline: type.lnClass,
    supportingText: `#${type.id}${type.desc ? ` — ${type.desc}` : ''}`,
    selected: false,
    disabled: false,
    attachedElement: type.element,
  }));

  /*
   * This is a temporary workaround to enforce single selection in the
   * SelectionList component, which currently does not support it natively.
   */
  const enforceSingleSelection = (event: Event): void => {
    const list = (event.currentTarget as SelectionList)!;

    const listItem = event
      .composedPath()
      .find(target => (target as HTMLElement).tagName === 'MD-LIST-ITEM') as
      | HTMLElement
      | undefined;
    if (!listItem) {
      return;
    }

    const itemsInDom = list.shadowRoot?.querySelectorAll('md-list-item');
    if (!itemsInDom) {
      return;
    }

    const index = Array.from(itemsInDom).indexOf(listItem);
    if (index < 0) {
      return;
    }

    setTimeout(() => {
      const isSelected = list.items[index]?.selected ?? false;
      list.items.forEach((item, i) => {
        item.selected = i === index ? isSelected : false;
      });
      list.items = [...list.items];
    }, 0);
  };

  return [
    html`<selection-list
      id="lnList"
      .items=${items}
      filterable
      style="max-height: 320px; overflow: auto;"
      @input=${enforceSingleSelection}
    ></selection-list>`,
    html`<scl-text-field
      label="desc"
      .value=${null}
      nullable
      supportingText="Logical node description"
      pattern="${patterns.normalizedString}"
    ></scl-text-field>`,
    html`<scl-text-field
      label="prefix"
      .value=${null}
      nullable
      supportingText="Optional LN prefix"
      pattern="${patterns.prefix}"
      maxLength="${maxLength.prefix}"
    ></scl-text-field>`,
    html`<scl-text-field
      label="amount"
      .value=${'1'}
      required
      supportingText="Number of LNs to add"
      validationMessage="Number must be 1 or greater"
      type="number"
      min="1"
    ></scl-text-field>`,
  ];
}

function createAction(parent: Element): WizardActor {
  return (inputs: WizardInputElement[], wizard: Element): EditV2[] => {
    const list = wizard.querySelector('#lnList') as SelectionList | null;
    const selected = list?.selectedElements?.[0] as Element | undefined;
    if (!selected) {
      return [];
    }

    const lnClass = selected.getAttribute('lnClass');
    const lnType = selected.getAttribute('id');
    if (!lnClass || !lnType) {
      return [];
    }

    const desc = getValue(inputs.find(i => i.label === 'desc')!);
    const prefixValue = getValue(inputs.find(i => i.label === 'prefix')!);
    const prefix = prefixValue?.trim() ? prefixValue.trim() : null;

    const amountValue = Number(
      getValue(inputs.find(i => i.label === 'amount')!) ?? '1',
    );
    const amount =
      Number.isFinite(amountValue) && amountValue > 0
        ? Math.floor(amountValue)
        : 1;

    const getInst = lnInstGenerator(parent, 'LN');
    const reference = getReference(parent, 'LN');
    const edits: EditV2[] = [];

    for (let i = 0; i < amount; i += 1) {
      const inst = getInst(lnClass);
      if (!inst) {
        break;
      }

      const node = createElement(parent.ownerDocument, 'LN', {
        lnClass,
        lnType,
        inst,
        desc,
        ...(prefix ? { prefix } : {}),
      });

      edits.push({ parent, node, reference });
    }

    return edits;
  };
}

export function createLNWizard(parent: Element): Wizard {
  const lNodeTypes = listLNodeTypes(parent.ownerDocument);

  return {
    title: 'Add LN',
    primary: {
      icon: 'save',
      label: 'save',
      action: createAction(parent),
    },
    content: renderCreate(lNodeTypes),
  };
}

function reservedInstLN(
  currentElement: Element,
  prefixOverride?: string,
): string[] {
  const ldevice = currentElement.closest('LDevice');
  if (!ldevice) {
    return [];
  }

  const currentLnClass = currentElement.getAttribute('lnClass');
  const targetPrefix =
    prefixOverride !== undefined
      ? prefixOverride
      : currentElement.getAttribute('prefix') || '';

  const lnElements = Array.from(ldevice.querySelectorAll(':scope > LN')).filter(
    ln =>
      ln !== currentElement &&
      (ln.getAttribute('prefix') || '') === targetPrefix &&
      ln.getAttribute('lnClass') === currentLnClass,
  );

  return lnElements
    .map(ln => ln.getAttribute('inst'))
    .filter(inst => inst !== null) as string[];
}

function updateAction(element: Element): WizardActor {
  return (inputs: WizardInputElement[], _wizard: Element): EditV2[] => {
    const attributes: Record<string, string | null> = {};
    const keys = ['lnType', 'desc', 'prefix', 'lnClass', 'inst'];
    keys.forEach(key => {
      attributes[key] = getValue(inputs.find(i => i.label === key)!);
    });

    const hasChanges = keys.some(
      key => attributes[key] !== element.getAttribute(key),
    );
    if (!hasChanges) {
      return [];
    }

    const newPrefix = attributes.prefix || '';
    const newLnClass = attributes.lnClass;
    const newInst = attributes.inst;
    const ldevice = element.closest('LDevice');
    if (ldevice) {
      const isDuplicate = Array.from(
        ldevice.querySelectorAll(':scope > LN'),
      ).some(
        ln =>
          ln !== element &&
          (ln.getAttribute('prefix') || '') === newPrefix &&
          ln.getAttribute('lnClass') === newLnClass &&
          ln.getAttribute('inst') === newInst,
      );
      if (isDuplicate) {
        //TODO consider reporting this to the user (e.g. notifications)
        return [];
      }
    }

    return [
      {
        element,
        attributes,
      },
    ];
  };
}

function renderUpdate(element: Element): TemplateResult[] {
  const lnType = element.getAttribute('lnType');
  const desc = element.getAttribute('desc');
  const prefix = element.getAttribute('prefix');
  const lnClass = element.getAttribute('lnClass');
  const inst = element.getAttribute('inst');
  const reserved = reservedInstLN(element);

  return [
    html`<scl-text-field
      label="lnType"
      .value=${lnType}
      readOnly
      disabled
      required
      supportingText="Logical node type"
    ></scl-text-field>`,
    html`<scl-text-field
      label="desc"
      .value=${desc}
      nullable
      supportingText="Logical node description"
      pattern="${patterns.normalizedString}"
    ></scl-text-field>`,
    html`<scl-text-field
      label="prefix"
      .value=${prefix}
      nullable
      supportingText="Optional LN prefix"
      pattern="${patterns.prefix}"
      maxLength="${maxLength.prefix}"
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
      required
      supportingText="Logical node instance"
      pattern="${patterns.lnInst}"
      .reservedValues=${reserved}
      @input=${(e: Event) => {
        const field = e.target as SclTextField;
        const currentValue = field.value ?? '';
        const customValidityMsg = reserved.includes(currentValue)
          ? `"${currentValue}" is already in use`
          : '';
        field.setCustomValidity(customValidityMsg);
        field.reportValidity();
      }}
    ></scl-text-field>`,
  ];
}

export function updateLNWizard(element: Element): Wizard {
  return {
    title: 'Edit LN',
    primary: {
      icon: 'edit',
      label: 'save',
      action: updateAction(element),
    },
    content: renderUpdate(element),
  };
}
