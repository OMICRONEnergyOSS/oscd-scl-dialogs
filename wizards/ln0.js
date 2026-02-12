import '../node_modules/@lit/reactive-element/reactive-element.js';
import { html as b } from '../node_modules/lit-html/lit-html.js';
import '../node_modules/lit-element/lit-element.js';
import { getValue } from '../foundation.js';
import { patterns } from './patterns.js';

function getLNodeTypeOptions(element) {
    const doc = element.ownerDocument;
    const lNodeTypes = Array.from(doc.querySelectorAll('DataTypeTemplates > LNodeType[lnClass="LLN0"]'));
    return lNodeTypes
        .map(type => type.getAttribute('id'))
        .filter((id) => !!id);
}
function render(element, lnodeTypeIds) {
    const lnType = element.getAttribute('lnType');
    const desc = element.getAttribute('desc');
    const lnClass = element.getAttribute('lnClass');
    const inst = element.getAttribute('inst');
    return [
        b `<scl-select
      label="lnType"
      .value=${lnType}
      required
      .selectOptions=${lnodeTypeIds}
    ></scl-select>`,
        b `<scl-text-field
      label="desc"
      .value=${desc}
      nullable
      supportingText="Logical node zero description"
      pattern="${patterns.normalizedString}"
    ></scl-text-field>`,
        b `<scl-text-field
      label="lnClass"
      .value=${lnClass}
      readOnly
      disabled
      required
      supportingText="Logical node class"
      pattern="${patterns.lnClass}"
    ></scl-text-field>`,
        b `<scl-text-field
      label="inst"
      .value=${inst}
      readOnly
      disabled
      supportingText="Logical node instance"
    ></scl-text-field>`,
    ];
}
function updateAction(element) {
    return (inputs) => {
        const attributes = {};
        // Key attributes omitted from update are: 'lnClass', 'inst'.
        const keys = ['lnType', 'desc'];
        keys.forEach(key => {
            attributes[key] = getValue(inputs.find(i => i.label === key));
        });
        const hasChanges = keys.some(key => attributes[key] !== element.getAttribute(key));
        if (!hasChanges) {
            return [];
        }
        return [
            {
                element,
                attributes,
            },
        ];
    };
}
function updateLN0Wizard(element) {
    const lnodeTypeIds = getLNodeTypeOptions(element);
    return {
        title: 'Edit LN0',
        primary: {
            icon: 'edit',
            label: 'save',
            action: updateAction(element),
        },
        content: render(element, lnodeTypeIds),
    };
}

export { updateLN0Wizard };
//# sourceMappingURL=ln0.js.map
