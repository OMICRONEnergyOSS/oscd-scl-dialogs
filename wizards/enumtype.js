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
import { getValue, createElement } from '../foundation.js';
import { patterns } from './patterns.js';

function createEnumTypeAction(parent) {
    return (inputs) => {
        const enumTypeAttrs = {};
        const enumTypeKeys = ['id', 'desc'];
        enumTypeKeys.forEach(key => {
            enumTypeAttrs[key] = getValue(inputs.find(i => i.label === key));
        });
        const enumType = createElement(parent.ownerDocument, 'EnumType', enumTypeAttrs);
        return [
            { parent, node: enumType, reference: getReference(parent, 'EnumType') },
        ];
    };
}
function createEnumTypeWizard(parent) {
    return {
        title: 'Add EnumType',
        primary: {
            icon: 'Save',
            label: 'Save',
            action: createEnumTypeAction(parent),
        },
        content: [
            b `<scl-text-field
        label="id"
        .value=${''}
        required
        maxlength="127"
        minlength="1"
        pattern="${patterns.nmToken}"
      ></scl-text-field>`,
            b `<scl-text-field
        label="desc"
        .value=${null}
        nullable
        pattern="${patterns.normalizedString}"
      ></scl-text-field>`,
        ],
    };
}

export { createEnumTypeWizard };
//# sourceMappingURL=enumtype.js.map
