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

function contentSubEquipmentWizard(options) {
    return [
        b `<scl-text-field
      label="name"
      .value=${options.name}
      .reservedValues=${options.reservedValues}
      required
      dialogInitialFocus
    ></scl-text-field>`,
        b `<scl-text-field
      label="desc"
      .value=${options.desc}
      nullable
    ></scl-text-field>`,
        b `<scl-select
      label="phase"
      .value=${options.phase}
      .selectOptions=${['A', 'B', 'C', 'N', 'all', 'none', 'AB', 'BC', 'CA']}
      nullable
    >
    </scl-select> `,
        b `<scl-checkbox
      label="virtual"
      .value=${options.virtual}
      nullable
    ></scl-checkbox>`,
    ];
}
function createAction(parent) {
    return (inputs) => {
        const subEquipmentAttrs = {};
        const subEquipmentKeys = ['name', 'desc', 'phase', 'virtual'];
        subEquipmentKeys.forEach(key => {
            subEquipmentAttrs[key] = getValue(inputs.find(i => i.label === key));
        });
        const subEquipment = createElement(parent.ownerDocument, 'SubEquipment', subEquipmentAttrs);
        return [
            {
                parent,
                node: subEquipment,
                reference: getReference(parent, 'SubEquipment'),
            },
        ];
    };
}
function createSubEquipmentWizard(parent) {
    const name = '';
    const desc = null;
    const phase = null;
    const virtual = null;
    return {
        title: 'Add SubEquipment',
        primary: {
            icon: 'save',
            label: 'save',
            action: createAction(parent),
        },
        content: [
            ...contentSubEquipmentWizard({
                name,
                desc,
                phase,
                virtual,
                reservedValues: reservedNames(parent, 'SubEquipment'),
            }),
        ],
    };
}
function updateAction(element) {
    return (inputs) => {
        const attributes = {};
        const subFunctionKeys = ['name', 'desc', 'phase', 'virtual'];
        subFunctionKeys.forEach(key => {
            attributes[key] = getValue(inputs.find(i => i.label === key));
        });
        if (subFunctionKeys.some(key => attributes[key] !== element.getAttribute(key))) {
            return [{ element, attributes }];
        }
        return [];
    };
}
function editSubEquipmentWizard(element) {
    const name = element.getAttribute('name');
    const desc = element.getAttribute('desc');
    const phase = element.getAttribute('phase');
    const virtual = element.getAttribute('virtual');
    return {
        title: 'Edit SubEquipment',
        primary: {
            icon: 'save',
            label: 'save',
            action: updateAction(element),
        },
        content: [
            ...contentSubEquipmentWizard({
                name,
                desc,
                phase,
                virtual,
                reservedValues: reservedNames(element),
            }),
        ],
    };
}

export { createSubEquipmentWizard, editSubEquipmentWizard };
//# sourceMappingURL=subequipment.js.map
