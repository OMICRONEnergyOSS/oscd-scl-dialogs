import '../node_modules/@lit/reactive-element/reactive-element.js';
import { html as b } from '../node_modules/lit-html/lit-html.js';
import '../node_modules/lit-element/lit-element.js';
import { updateBay } from '../node_modules/@openscd/scl-lib/dist/tBay/updateBay.js';
import { getReference } from '../node_modules/@openscd/scl-lib/dist/tBaseElement/getReference.js';
import '../node_modules/@openscd/scl-lib/dist/generator/lnInstGenerator.js';
import '../node_modules/@openscd/scl-lib/dist/generator/macAddressGenerator.js';
import '../node_modules/@openscd/scl-lib/dist/generator/appIdGenerator.js';
import '../node_modules/@openscd/scl-lib/dist/tExtRef/extRefTypeRestrictions.js';
import '../node_modules/@openscd/scl-lib/dist/tDataTypeTemplates/nsdToJson.js';
import '../node_modules/@openscd/scl-lib/dist/tBaseElement/find.js';
import '../node_modules/@openscd/scl-lib/dist/tBaseElement/tags.js';
import { reservedNames, getValue, createElement } from '../foundation.js';

function renderBayWizard(options) {
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
        const node = createElement(parent.ownerDocument, 'Bay', {
            name,
            desc,
        });
        const action = {
            parent,
            node,
            reference: getReference(parent, 'Bay'),
        };
        return [action];
    };
}
function createBayWizard(parent) {
    return {
        title: 'Add Bay',
        primary: {
            icon: '',
            label: 'add',
            action: createAction(parent),
        },
        content: renderBayWizard({
            name: '',
            reservedValues: reservedNames(parent, 'Bay'),
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
        return updateBay({ element, attributes: { name, desc } });
    };
}
function editBayWizard(element) {
    return {
        title: 'Edit Bay',
        primary: {
            icon: 'edit',
            label: 'save',
            action: updateAction(element),
        },
        content: renderBayWizard({
            name: element.getAttribute('name'),
            reservedValues: reservedNames(element),
            desc: element.getAttribute('desc'),
        }),
    };
}

export { createAction, createBayWizard, editBayWizard, renderBayWizard, updateAction };
//# sourceMappingURL=bay.js.map
