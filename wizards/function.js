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

function contentFunctionWizard(options) {
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
      .maybeValue=${options.desc}
      nullable
    ></scl-text-field>`,
        b `<scl-text-field
      label="type"
      .maybeValue=${options.type}
      nullable
    ></scl-text-field>`,
    ];
}
function createFunctionAction(parent) {
    return (inputs) => {
        const functionAttrs = {};
        const functionKeys = ['name', 'desc', 'type'];
        functionKeys.forEach(key => {
            functionAttrs[key] = getValue(inputs.find(i => i.label === key));
        });
        const fUnction = createElement(parent.ownerDocument, 'Function', functionAttrs);
        return [
            { parent, node: fUnction, reference: getReference(parent, 'Function') },
        ];
    };
}
function createFunctionWizard(parent) {
    const name = '';
    const desc = null;
    const type = null;
    return {
        title: 'Add Function',
        primary: {
            icon: 'save',
            label: 'save',
            action: createFunctionAction(parent),
        },
        content: [
            ...contentFunctionWizard({
                name,
                desc,
                type,
                reservedValues: reservedNames(parent, 'Function'),
            }),
        ],
    };
}
function updateFunction(element) {
    return (inputs) => {
        const attributes = {};
        const functionKeys = ['name', 'desc', 'type'];
        functionKeys.forEach(key => {
            attributes[key] = getValue(inputs.find(i => i.label === key));
        });
        if (functionKeys.some(key => attributes[key] !== element.getAttribute(key))) {
            return [{ element, attributes }];
        }
        return [];
    };
}
function editFunctionWizard(element) {
    const name = element.getAttribute('name');
    const desc = element.getAttribute('desc');
    const type = element.getAttribute('type');
    return {
        title: 'Edit Function',
        primary: {
            icon: 'save',
            label: 'save',
            action: updateFunction(element),
        },
        content: [
            ...contentFunctionWizard({
                name,
                desc,
                type,
                reservedValues: reservedNames(element),
            }),
        ],
    };
}

export { contentFunctionWizard, createFunctionWizard, editFunctionWizard };
//# sourceMappingURL=function.js.map
