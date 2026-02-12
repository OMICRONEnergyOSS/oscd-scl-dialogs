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

function contentTransformerWindingWizard(options) {
    return [
        b `<scl-text-field
      label="name"
      .value=${options.name}
      required
      .reservedValues=${options.reservedValues}
      dialogInitialFocus
    ></scl-text-field>`,
        b `<scl-text-field
      label="desc"
      .value=${options.desc}
      nullable
    ></scl-text-field>`,
        b `<scl-text-field
      label="type"
      .value=${options.type}
      nullable
    ></scl-text-field>`,
        b `<scl-checkbox
      label="virtual"
      .value=${options.virtual}
      nullable
    ></scl-checkbox>`,
    ];
}
function createAction(parent) {
    return (inputs) => {
        const attributes = {};
        const transformerWindingKeys = ['name', 'desc', 'type', 'virtual'];
        transformerWindingKeys.forEach(key => {
            attributes[key] = getValue(inputs.find(i => i.label === key));
        });
        const transformerWinding = createElement(parent.ownerDocument, 'TransformerWinding', attributes);
        return [
            {
                parent,
                node: transformerWinding,
                reference: getReference(parent, 'TransformerWinding'),
            },
        ];
    };
}
function createTransformerWindingWizard(parent) {
    const name = '';
    const desc = null;
    const type = null;
    const virtual = null;
    return {
        title: 'Add TransformerWinding',
        primary: {
            icon: 'save',
            label: 'save',
            action: createAction(parent),
        },
        content: [
            ...contentTransformerWindingWizard({
                name,
                reservedValues: reservedNames(parent, 'TransformerWinding'),
                desc,
                type,
                virtual,
            }),
        ],
    };
}
function updateAction(element) {
    return (inputs) => {
        const attributes = {};
        const transformerWindingKeys = ['name', 'desc', 'type', 'virtual'];
        transformerWindingKeys.forEach(key => {
            attributes[key] = getValue(inputs.find(i => i.label === key));
        });
        if (transformerWindingKeys.some(key => attributes[key] !== element.getAttribute(key))) {
            return [{ element, attributes }];
        }
        return [];
    };
}
function editTransformerWindingWizard(element) {
    const name = element.getAttribute('name');
    const desc = element.getAttribute('desc');
    const type = element.getAttribute('type');
    const virtual = element.getAttribute('virtual');
    return {
        title: 'Edit TransformerWinding',
        primary: {
            icon: 'save',
            label: 'save',
            action: updateAction(element),
        },
        content: [
            ...contentTransformerWindingWizard({
                name,
                reservedValues: reservedNames(element),
                desc,
                type,
                virtual,
            }),
        ],
    };
}

export { createTransformerWindingWizard, editTransformerWindingWizard };
//# sourceMappingURL=transformerWinding.js.map
