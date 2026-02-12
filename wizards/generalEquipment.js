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

function contentGeneralEquipmentWizard(options) {
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
      .value=${options.type}
      minLength="3"
      pattern="AXN|BAT|MOT|FAN|FIL|PMP|TNK|VLV|E[A-Z]*"
      required
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
        const generalEquipmentKeys = ['name', 'desc', 'type', 'virtual'];
        generalEquipmentKeys.forEach(key => {
            attributes[key] = getValue(inputs.find(i => i.label === key));
        });
        const generalEquipment = createElement(parent.ownerDocument, 'GeneralEquipment', attributes);
        return [
            {
                parent,
                node: generalEquipment,
                reference: getReference(parent, 'GeneralEquipment'),
            },
        ];
    };
}
function createGeneralEquipmentWizard(parent) {
    const name = '';
    const desc = null;
    const type = null;
    const virtual = null;
    return {
        title: 'Add GeneralEquipment',
        primary: {
            icon: 'save',
            label: 'save',
            action: createAction(parent),
        },
        content: [
            ...contentGeneralEquipmentWizard({
                name,
                desc,
                type,
                virtual,
                reservedValues: reservedNames(parent, 'GeneralEquipment'),
            }),
        ],
    };
}
function updateAction(element) {
    return (inputs) => {
        const attributes = {};
        const generalEquipmentKeys = ['name', 'desc', 'type', 'virtual'];
        generalEquipmentKeys.forEach(key => {
            attributes[key] = getValue(inputs.find(i => i.label === key));
        });
        if (generalEquipmentKeys.some(key => attributes[key] !== element.getAttribute(key))) {
            return [{ element, attributes }];
        }
        return [];
    };
}
function editGeneralEquipmentWizard(element) {
    const name = element.getAttribute('name');
    const desc = element.getAttribute('desc');
    const type = element.getAttribute('type');
    const virtual = element.getAttribute('virtual');
    return {
        title: 'Edit GeneralEquipment',
        primary: {
            icon: 'save',
            label: 'save',
            action: updateAction(element),
        },
        content: [
            ...contentGeneralEquipmentWizard({
                name,
                desc,
                type,
                virtual,
                reservedValues: reservedNames(element),
            }),
        ],
    };
}

export { contentGeneralEquipmentWizard, createGeneralEquipmentWizard, editGeneralEquipmentWizard };
//# sourceMappingURL=generalEquipment.js.map
