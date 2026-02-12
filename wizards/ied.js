import '../node_modules/@lit/reactive-element/reactive-element.js';
import { html as b } from '../node_modules/lit-html/lit-html.js';
import '../node_modules/lit-element/lit-element.js';
import '../node_modules/@openscd/scl-lib/dist/tBaseElement/tags.js';
import { updateIED } from '../node_modules/@openscd/scl-lib/dist/tIED/updateIED.js';
import '../node_modules/@openscd/scl-lib/dist/generator/lnInstGenerator.js';
import '../node_modules/@openscd/scl-lib/dist/generator/macAddressGenerator.js';
import '../node_modules/@openscd/scl-lib/dist/generator/appIdGenerator.js';
import '../node_modules/@openscd/scl-lib/dist/tExtRef/extRefTypeRestrictions.js';
import '../node_modules/@openscd/scl-lib/dist/tDataTypeTemplates/nsdToJson.js';
import '../node_modules/@openscd/scl-lib/dist/tBaseElement/find.js';
import { getValue } from '../foundation.js';

function renderAdd(name, iedNames, desc) {
    return [
        b `<scl-text-field
      label="name"
      .value=${name}
      .reservedValues=${iedNames}
      required
      dialogInitialFocus
    ></scl-text-field>`,
        b `<scl-text-field
      label="desc"
      .value=${desc}
      nullable
    ></scl-text-field>`,
    ];
}
function renderEdit(name, iedNames, desc, type, manufacturer, owner) {
    return [
        ...renderAdd(name, iedNames, desc),
        b `<scl-text-field
      label="type"
      .value=${type}
      disabled
    ></scl-text-field>`,
        b `<scl-text-field
      label="manufacturer"
      .value=${manufacturer}
      disabled
    ></scl-text-field>`,
        b `<scl-text-field
      label="owner"
      .value=${owner}
      disabled
    ></scl-text-field>`,
    ];
}
function updateAction(element) {
    return (inputs) => {
        const name = inputs.find(i => i.label === 'name').value;
        const desc = getValue(inputs.find(i => i.label === 'desc'));
        if (name === element.getAttribute('name') &&
            desc === element.getAttribute('desc')) {
            return [];
        }
        return updateIED({
            element,
            attributes: { name, desc },
        });
    };
}
function getAllOtherIEDNames(parent) {
    return Array.from(parent.ownerDocument.querySelectorAll(':root > IED'))
        .map(ied => ied.getAttribute('name'))
        .filter(ied => ied !== parent.getAttribute('name'));
}
function editIEDWizard(element) {
    const iedNames = getAllOtherIEDNames(element.parentElement);
    return {
        title: 'Edit IED',
        primary: {
            icon: 'edit',
            label: 'save',
            action: updateAction(element),
        },
        content: renderEdit(element.getAttribute('name') ?? '', iedNames, element.getAttribute('desc'), element.getAttribute('type'), element.getAttribute('manufacturer'), element.getAttribute('owner')),
    };
}
function createIEDWizard(parent) {
    const iedNames = getAllOtherIEDNames(parent);
    return {
        title: 'Add Virtial IED',
        primary: {
            icon: 'add',
            label: 'Create',
            action: updateAction(parent),
        },
        content: renderAdd(parent.getAttribute('name') ?? '', iedNames, parent.getAttribute('desc')),
    };
}

export { createIEDWizard, editIEDWizard, updateAction };
//# sourceMappingURL=ied.js.map
