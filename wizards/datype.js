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

function createDATypeAction(parent) {
    return (inputs) => {
        const daTypeAttrs = {};
        const daTypeKeys = ['id', 'desc'];
        daTypeKeys.forEach(key => {
            daTypeAttrs[key] = getValue(inputs.find(i => i.label === key));
        });
        const daType = createElement(parent.ownerDocument, 'DAType', daTypeAttrs);
        return [
            { parent, node: daType, reference: getReference(parent, 'DAType') },
        ];
    };
}
function createDATypeWizard(parent) {
    return {
        title: 'Add DAType',
        primary: {
            icon: 'Save',
            label: 'Save',
            action: createDATypeAction(parent),
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

export { createDATypeWizard };
//# sourceMappingURL=datype.js.map
