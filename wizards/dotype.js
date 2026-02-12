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

function createDOTypeAction(parent) {
    return (inputs) => {
        const doTypeAttrs = {};
        const doTypeKeys = ['id', 'desc', 'cdc'];
        doTypeKeys.forEach(key => {
            doTypeAttrs[key] = getValue(inputs.find(i => i.label === key));
        });
        const doType = createElement(parent.ownerDocument, 'DOType', doTypeAttrs);
        return [
            { parent, node: doType, reference: getReference(parent, 'DOType') },
        ];
    };
}
function createDOTypeWizard(parent) {
    return {
        title: 'Add DOType',
        primary: {
            icon: 'save',
            label: 'Save',
            action: createDOTypeAction(parent),
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
        .maybeValue=${null}
        nullable
        pattern="${patterns.normalizedString}"
      ></scl-text-field>`,
            b `<scl-text-field
        label="cdc"
        .value=${'ENS'}
        pattern="${patterns.cdc}"
      ></scl-text-field>`,
        ],
    };
}

export { createDOTypeWizard };
//# sourceMappingURL=dotype.js.map
