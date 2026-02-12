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
import { reservedNames, getValue, createElement } from '../foundation.js';

const defaultPowerTransformerType = 'PTR';
function renderPowerTransformerWizard(options) {
    return [
        b `<scl-text-field
      label="name"
      .value=${options.name}
      required
      dialogInitialFocus
      .reservedValues=${options.reservedValues}
    ></scl-text-field>`,
        b `<scl-text-field
      label="desc"
      .value=${options.desc}
      nullable
    ></scl-text-field>`,
        b `<scl-text-field
      label="type"
      .value=${options.type}
      disabled
    ></scl-text-field>`,
    ];
}
function createAction(parent) {
    return (inputs) => {
        const name = getValue(inputs.find(i => i.label === 'name'));
        const desc = getValue(inputs.find(i => i.label === 'desc'));
        const powerTransformer = createElement(parent.ownerDocument, 'PowerTransformer', {
            name,
            desc,
            type: defaultPowerTransformerType,
        });
        return [
            {
                parent,
                node: powerTransformer,
                reference: getReference(parent, 'PowerTransformer'),
            },
        ];
    };
}
function createPowerTransformerWizard(parent) {
    return {
        title: 'Add PowerTransformer',
        primary: {
            icon: '',
            label: 'add',
            action: createAction(parent),
        },
        content: renderPowerTransformerWizard({
            name: '',
            reservedValues: reservedNames(parent, 'PowerTransformer'),
            desc: null,
            type: defaultPowerTransformerType,
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
        return [{ element, attributes: { name, desc } }];
    };
}
function editPowerTransformerWizard(element) {
    return {
        title: 'Edit PowerTransformer',
        primary: {
            icon: 'edit',
            label: 'save',
            action: updateAction(element),
        },
        content: renderPowerTransformerWizard({
            name: element.getAttribute('name'),
            reservedValues: reservedNames(element),
            desc: element.getAttribute('desc'),
            type: element.getAttribute('type'),
        }),
    };
}

export { createPowerTransformerWizard, editPowerTransformerWizard };
//# sourceMappingURL=powertransformer.js.map
