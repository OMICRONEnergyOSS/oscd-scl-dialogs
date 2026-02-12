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

function contentTapChangerWizard(options) {
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
        const tapChangerAttrs = {};
        const tapChangerKeys = ['name', 'desc', 'type', 'virtual'];
        tapChangerKeys.forEach(key => {
            tapChangerAttrs[key] = getValue(inputs.find(i => i.label === key));
        });
        const tapChanger = createElement(parent.ownerDocument, 'TapChanger', tapChangerAttrs);
        return [
            {
                parent,
                node: tapChanger,
                reference: getReference(parent, 'TapChanger'),
            },
        ];
    };
}
function createTapChangerWizard(parent) {
    const name = '';
    const desc = null;
    const type = 'LTC';
    const virtual = null;
    return {
        title: 'Add TapChanger',
        primary: {
            icon: 'save',
            label: 'save',
            action: createAction(parent),
        },
        content: [
            ...contentTapChangerWizard({
                name,
                desc,
                type,
                virtual,
                reservedValues: reservedNames(parent, 'TapChanger'),
            }),
        ],
    };
}
function updateAction(element) {
    return (inputs) => {
        const attributes = {};
        const tapChangerKeys = ['name', 'desc', 'type', 'virtual'];
        tapChangerKeys.forEach(key => {
            attributes[key] = getValue(inputs.find(i => i.label === key));
        });
        if (tapChangerKeys.some(key => attributes[key] !== element.getAttribute(key))) {
            return [{ element, attributes }];
        }
        return [];
    };
}
function editTapChangerWizard(element) {
    const name = element.getAttribute('name');
    const desc = element.getAttribute('desc');
    const type = element.getAttribute('type');
    const virtual = element.getAttribute('virtual');
    return {
        title: 'Edit TapChanger',
        primary: {
            icon: 'save',
            label: 'save',
            action: updateAction(element),
        },
        content: [
            ...contentTapChangerWizard({
                name,
                desc,
                type,
                virtual,
                reservedValues: reservedNames(element),
            }),
        ],
    };
}

export { createTapChangerWizard, editTapChangerWizard };
//# sourceMappingURL=tapchanger.js.map
