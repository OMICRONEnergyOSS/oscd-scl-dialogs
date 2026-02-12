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

function createLNodeTypeAction(parent) {
    return (inputs) => {
        const lNodeTypeAttrs = {};
        const lNodeTypeKeys = ['id', 'desc', 'lnClass'];
        lNodeTypeKeys.forEach(key => {
            lNodeTypeAttrs[key] = getValue(inputs.find(i => i.label === key));
        });
        const lNodeType = createElement(parent.ownerDocument, 'LNodeType', lNodeTypeAttrs);
        return [
            { parent, node: lNodeType, reference: getReference(parent, 'LNodeType') },
        ];
    };
}
function createLNodeTypeWizard(parent) {
    return {
        title: 'Add LNodeType',
        primary: {
            icon: 'Save',
            label: 'Save',
            action: createLNodeTypeAction(parent),
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
            b `<scl-text-field
        label="lnClass"
        .value=${'LLN0'}
        pattern="${patterns.lnClass}"
      ></scl-text-field>`,
        ],
    };
}

export { createLNodeTypeWizard };
//# sourceMappingURL=lnodetype.js.map
