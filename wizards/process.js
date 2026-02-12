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
import { getChildElementsByTagName, getValue, createElement } from '../foundation.js';

function contentProcessWizard(content) {
    return [
        b `<scl-text-field
      label="name"
      .value=${content.name}
      required
      .reservedValues=${content.reservedNames}
      dialogInitialFocus
    ></scl-text-field>`,
        b `<scl-text-field
      label="desc"
      .value=${content.desc}
      nullable
    ></scl-text-field>`,
        b `<scl-text-field
      label="type"
      .value=${content.type}
      nullable
    ></scl-text-field>`,
    ];
}
function createAction(parent) {
    return (inputs) => {
        const attributes = {};
        const processKeys = ['name', 'desc', 'type'];
        processKeys.forEach(key => {
            attributes[key] = getValue(inputs.find(i => i.label === key));
        });
        const process = createElement(parent.ownerDocument, 'Process', attributes);
        return [
            { parent, node: process, reference: getReference(parent, 'Process') },
        ];
    };
}
function createProcessWizard(parent) {
    const name = '';
    const desc = '';
    const type = '';
    const reservedNames = getChildElementsByTagName(parent.parentElement, 'Process')
        .filter(sibling => sibling !== parent)
        .map(sibling => sibling.getAttribute('name'));
    return {
        title: 'Add Process',
        primary: {
            icon: 'save',
            label: 'save',
            action: createAction(parent),
        },
        content: [
            ...contentProcessWizard({
                name,
                desc,
                type,
                reservedNames,
            }),
        ],
    };
}
function updateAction(element) {
    return (inputs) => {
        const attributes = {};
        const tapProcessKeys = ['name', 'desc', 'type'];
        tapProcessKeys.forEach(key => {
            attributes[key] = getValue(inputs.find(i => i.label === key));
        });
        if (tapProcessKeys.some(key => attributes[key] !== element.getAttribute(key))) {
            return [{ element, attributes }];
        }
        return [];
    };
}
function editProcessWizard(element) {
    const name = element.getAttribute('name');
    const desc = element.getAttribute('desc');
    const type = element.getAttribute('type');
    const reservedNames = getChildElementsByTagName(element.parentElement, 'Process')
        .filter(sibling => sibling !== element)
        .map(sibling => sibling.getAttribute('name'));
    return {
        title: 'Edit Process',
        primary: {
            icon: 'save',
            label: 'save',
            action: updateAction(element),
        },
        content: [
            ...contentProcessWizard({
                name,
                desc,
                type,
                reservedNames,
            }),
        ],
    };
}

export { createProcessWizard, editProcessWizard };
//# sourceMappingURL=process.js.map
