import '../node_modules/@lit/reactive-element/reactive-element.js';
import { html as b } from '../node_modules/lit-html/lit-html.js';
import '../node_modules/lit-element/lit-element.js';
import { updateSubstation } from '../node_modules/@openscd/scl-lib/dist/tSubstation/updateSubstation.js';
import { getReference } from '../node_modules/@openscd/scl-lib/dist/tBaseElement/getReference.js';
import '../node_modules/@openscd/scl-lib/dist/generator/lnInstGenerator.js';
import '../node_modules/@openscd/scl-lib/dist/generator/macAddressGenerator.js';
import '../node_modules/@openscd/scl-lib/dist/generator/appIdGenerator.js';
import '../node_modules/@openscd/scl-lib/dist/tExtRef/extRefTypeRestrictions.js';
import '../node_modules/@openscd/scl-lib/dist/tDataTypeTemplates/nsdToJson.js';
import '../node_modules/@openscd/scl-lib/dist/tBaseElement/find.js';
import '../node_modules/@openscd/scl-lib/dist/tBaseElement/tags.js';
import { reservedNames, getValue, createElement } from '../foundation.js';

function render(options) {
    return [
        b `<scl-text-field
      label="name"
      .value=${options.name}
      required
      .reservedValues="${options.reservedValues}"
      dialogInitialFocus
    ></scl-text-field>`,
        b `<scl-text-field
      label="desc"
      .value=${options.desc}
      nullable
    ></scl-text-field>`,
    ];
}
function createAction(parent) {
    return (inputs) => {
        const name = getValue(inputs.find(i => i.label === 'name'));
        const desc = getValue(inputs.find(i => i.label === 'desc'));
        parent.ownerDocument.createElement('Substation');
        const substation = createElement(parent.ownerDocument, 'Substation', {
            name,
            desc,
        });
        return [
            {
                parent,
                node: substation,
                reference: getReference(parent, 'Substation'),
            },
        ];
    };
}
function createSubstationWizard(parent) {
    return {
        title: 'Create Substation',
        primary: {
            icon: 'add',
            label: 'add',
            action: createAction(parent),
        },
        content: render({
            name: '',
            reservedValues: reservedNames(parent, 'Substation'),
            desc: '',
        }),
    };
}
function updateAction(element) {
    return (inputs) => {
        const name = inputs.find(i => i.label === 'name').value;
        const desc = getValue(inputs.find(i => i.label === 'desc'));
        if (name === element.getAttribute('name') &&
            desc === element.getAttribute('desc')) {
            return [];
        }
        return updateSubstation({ element, attributes: { name, desc } });
    };
}
function editSubstationWizard(element) {
    return {
        title: 'Edit Substation',
        primary: {
            icon: 'edit',
            label: 'save',
            action: updateAction(element),
        },
        content: render({
            name: element.getAttribute('name') ?? '',
            reservedValues: reservedNames(element),
            desc: element.getAttribute('desc'),
        }),
    };
}

export { createAction, createSubstationWizard, editSubstationWizard, updateAction };
//# sourceMappingURL=substation.js.map
