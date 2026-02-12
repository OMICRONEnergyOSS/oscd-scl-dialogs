import '../node_modules/@lit/reactive-element/reactive-element.js';
import { html as b } from '../node_modules/lit-html/lit-html.js';
import '../node_modules/lit-element/lit-element.js';
import { getReference } from '../node_modules/@openscd/scl-lib/dist/tBaseElement/getReference.js';
import '../node_modules/@openscd/scl-lib/dist/generator/lnInstGenerator.js';
import '../node_modules/@openscd/scl-lib/dist/generator/macAddressGenerator.js';
import '../node_modules/@openscd/scl-lib/dist/generator/appIdGenerator.js';
import '../node_modules/@openscd/scl-lib/dist/tExtRef/extRefTypeRestrictions.js';
import '../node_modules/@openscd/scl-lib/dist/tDataTypeTemplates/nsdToJson.js';
import '../node_modules/@openscd/scl-lib/dist/tBaseElement/find.js';
import '../node_modules/@openscd/scl-lib/dist/tBaseElement/tags.js';
import { getValue, createElement, cloneElement } from '../foundation.js';
import { patterns } from './patterns.js';

function renderContent(content) {
    return [
        b `<scl-text-field
      label="ord"
      .value=${content.ord}
      required
      type="number"
    ></scl-text-field>`,
        b `<scl-text-field
      label="value"
      .value=${content.value}
      pattern="${patterns.normalizedString}"
      dialogInitialFocus
    ></scl-text-field>`,
        b `<scl-text-field
      id="evDesc"
      label="desc"
      .value=${content.desc}
      nullable
      pattern="${patterns.normalizedString}"
    ></scl-text-field>`,
    ];
}
function nextOrd(parent) {
    const maxOrd = Math.max(...Array.from(parent.children).map(child => parseInt(child.getAttribute('ord') ?? '-2', 10)));
    return isFinite(maxOrd) ? (maxOrd + 1).toString(10) : '0';
}
function createAction(parent) {
    return (inputs) => {
        const value = getValue(inputs.find(i => i.label === 'value'));
        const desc = getValue(inputs.find(i => i.label === 'desc'));
        const ord = getValue(inputs.find(i => i.label === 'ord')) || nextOrd(parent);
        const element = createElement(parent.ownerDocument, 'EnumVal', {
            ord,
            desc,
        });
        element.textContent = value;
        const action = [
            {
                parent,
                node: element,
                reference: getReference(parent, 'EnumVal'),
            },
        ];
        return [action];
    };
}
function createEnumValWizard(parent) {
    const [ord, desc, value] = [nextOrd(parent), null, ''];
    return {
        title: 'Add EnumVal',
        primary: {
            icon: '',
            label: 'Save',
            action: createAction(parent),
        },
        content: renderContent({ ord, desc, value }),
    };
}
function updateAction(element) {
    return (inputs) => {
        const value = getValue(inputs.find(i => i.label === 'value')) ?? '';
        const desc = getValue(inputs.find(i => i.label === 'desc'));
        const ord = getValue(inputs.find(i => i.label === 'ord')) ||
            element.getAttribute('ord') ||
            nextOrd(element.parentElement);
        if (value === element.textContent &&
            desc === element.getAttribute('desc') &&
            ord === element.getAttribute('ord')) {
            return [];
        }
        const newElement = cloneElement(element, { desc, ord });
        newElement.textContent = value;
        return [
            {
                parent: element.parentElement,
                node: newElement,
                reference: getReference(element.parentElement, 'EnumVal'),
            },
            { node: element },
        ];
    };
}
function editEnumValWizard(element) {
    const [ord, desc, value] = [
        element.getAttribute('ord'),
        element.getAttribute('desc'),
        element.textContent,
    ];
    return {
        title: 'Edit EnumVal',
        primary: {
            icon: '',
            label: 'Save',
            action: updateAction(element),
        },
        content: renderContent({ ord, desc, value }),
    };
}

export { createEnumValWizard, editEnumValWizard };
//# sourceMappingURL=enumval.js.map
