import '../node_modules/@lit/reactive-element/reactive-element.js';
import { html as x } from '../node_modules/lit-html/lit-html.js';
import '../node_modules/lit-element/lit-element.js';
import { getReference } from '../node_modules/@openscd/scl-lib/dist/tBaseElement/getReference.js';
import { lnInstGenerator } from '../node_modules/@openscd/scl-lib/dist/generator/lnInstGenerator.js';
import '../node_modules/@openscd/scl-lib/dist/generator/macAddressGenerator.js';
import '../node_modules/@openscd/scl-lib/dist/generator/appIdGenerator.js';
import '../node_modules/@openscd/scl-lib/dist/tExtRef/extRefTypeRestrictions.js';
import '../node_modules/@openscd/scl-lib/dist/tDataTypeTemplates/nsdToJson.js';
import '../node_modules/@openscd/scl-lib/dist/tBaseElement/find.js';
import '../node_modules/@openscd/scl-lib/dist/tBaseElement/tags.js';
import { getValue, createElement } from '../foundation.js';
import { patterns, maxLength } from './patterns.js';

function listLNodeTypes(doc) {
    return Array.from(doc.querySelectorAll(':root > DataTypeTemplates > LNodeType'))
        .map(type => ({
        id: type.getAttribute('id'),
        lnClass: type.getAttribute('lnClass'),
        desc: type.getAttribute('desc'),
        element: type,
    }))
        .filter(type => type.id && type.lnClass && type.lnClass !== 'LLN0');
}
function renderCreate(lNodeTypes) {
    const items = lNodeTypes.map(type => ({
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
    const enforceSingleSelection = (event) => {
        const list = event.currentTarget;
        const listItem = event
            .composedPath()
            .find(target => target.tagName === 'MD-LIST-ITEM');
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
        x `<selection-list
      id="lnList"
      .items=${items}
      filterable
      style="max-height: 320px; overflow: auto;"
      @input=${enforceSingleSelection}
    ></selection-list>`,
        x `<scl-text-field
      label="desc"
      .value=${null}
      nullable
      supportingText="Logical node description"
      pattern="${patterns.normalizedString}"
    ></scl-text-field>`,
        x `<scl-text-field
      label="prefix"
      .value=${null}
      nullable
      supportingText="Optional LN prefix"
      pattern="${patterns.prefix}"
      maxLength="${maxLength.prefix}"
    ></scl-text-field>`,
        x `<scl-text-field
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
function createAction(parent) {
    return (inputs, wizard) => {
        const list = wizard.querySelector('#lnList');
        const selected = list?.selectedElements?.[0];
        if (!selected) {
            return [];
        }
        const lnClass = selected.getAttribute('lnClass');
        const lnType = selected.getAttribute('id');
        if (!lnClass || !lnType) {
            return [];
        }
        const desc = getValue(inputs.find(i => i.label === 'desc'));
        const prefixValue = getValue(inputs.find(i => i.label === 'prefix'));
        const prefix = prefixValue?.trim() ? prefixValue.trim() : null;
        const amountValue = Number(getValue(inputs.find(i => i.label === 'amount')) ?? '1');
        const amount = Number.isFinite(amountValue) && amountValue > 0
            ? Math.floor(amountValue)
            : 1;
        const getInst = lnInstGenerator(parent, 'LN');
        const reference = getReference(parent, 'LN');
        const edits = [];
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
function createLNWizard(parent) {
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
function reservedInstLN(currentElement, prefixOverride) {
    const ldevice = currentElement.closest('LDevice');
    if (!ldevice) {
        return [];
    }
    const currentLnClass = currentElement.getAttribute('lnClass');
    const targetPrefix = currentElement.getAttribute('prefix') || '';
    const lnElements = Array.from(ldevice.querySelectorAll(':scope > LN')).filter(ln => ln !== currentElement &&
        (ln.getAttribute('prefix') || '') === targetPrefix &&
        ln.getAttribute('lnClass') === currentLnClass);
    return lnElements
        .map(ln => ln.getAttribute('inst'))
        .filter(inst => inst !== null);
}
function updateAction(element) {
    return (inputs, _wizard) => {
        const attributes = {};
        const keys = ['lnType', 'desc', 'prefix', 'lnClass', 'inst'];
        keys.forEach(key => {
            attributes[key] = getValue(inputs.find(i => i.label === key));
        });
        const hasChanges = keys.some(key => attributes[key] !== element.getAttribute(key));
        if (!hasChanges) {
            return [];
        }
        const newPrefix = attributes.prefix || '';
        const newLnClass = attributes.lnClass;
        const newInst = attributes.inst;
        const ldevice = element.closest('LDevice');
        if (ldevice) {
            const isDuplicate = Array.from(ldevice.querySelectorAll(':scope > LN')).some(ln => ln !== element &&
                (ln.getAttribute('prefix') || '') === newPrefix &&
                ln.getAttribute('lnClass') === newLnClass &&
                ln.getAttribute('inst') === newInst);
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
function renderUpdate(element) {
    const lnType = element.getAttribute('lnType');
    const desc = element.getAttribute('desc');
    const prefix = element.getAttribute('prefix');
    const lnClass = element.getAttribute('lnClass');
    const inst = element.getAttribute('inst');
    const reserved = reservedInstLN(element);
    return [
        x `<scl-text-field
      label="lnType"
      .value=${lnType}
      readOnly
      disabled
      required
      supportingText="Logical node type"
    ></scl-text-field>`,
        x `<scl-text-field
      label="desc"
      .value=${desc}
      nullable
      supportingText="Logical node description"
      pattern="${patterns.normalizedString}"
    ></scl-text-field>`,
        x `<scl-text-field
      label="prefix"
      .value=${prefix}
      nullable
      supportingText="Optional LN prefix"
      pattern="${patterns.prefix}"
      maxLength="${maxLength.prefix}"
    ></scl-text-field>`,
        x `<scl-text-field
      label="lnClass"
      .value=${lnClass}
      readOnly
      disabled
      required
      supportingText="Logical node class"
      pattern="${patterns.lnClass}"
    ></scl-text-field>`,
        x `<scl-text-field
      label="inst"
      .value=${inst}
      required
      supportingText="Logical node instance"
      pattern="${patterns.lnInst}"
      .reservedValues=${reserved}
      @input=${(e) => {
            const field = e.target;
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
function updateLNWizard(element) {
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

export { createLNWizard, updateLNWizard };
//# sourceMappingURL=ln.js.map
