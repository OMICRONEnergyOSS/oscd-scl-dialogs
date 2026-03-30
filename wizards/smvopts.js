import '../node_modules/@lit/reactive-element/reactive-element.js';
import { html as b } from '../node_modules/lit-html/lit-html.js';
import '../node_modules/lit-element/lit-element.js';
import { getValue } from '../foundation.js';

const smvOptKeys = [
    'refreshTime',
    'sampleRate',
    'dataSet',
    'security',
    'synchSourceId',
];
function render(options) {
    return smvOptKeys.map(key => b `<scl-checkbox
        label="${key}"
        .value=${options[key]}
        nullable
      ></scl-checkbox>`);
}
function updateAction(element) {
    return (inputs) => {
        const attributes = {};
        for (const key of smvOptKeys) {
            attributes[key] = getValue(inputs.find(i => i.label === key));
        }
        if (!smvOptKeys.some(key => attributes[key] !== element.getAttribute(key)))
            return [];
        return [{ element, attributes }];
    };
}
function editSmvOptsWizard(element) {
    const options = {};
    for (const key of smvOptKeys) {
        options[key] = element.getAttribute(key);
    }
    return {
        title: 'Edit SmvOpts',
        primary: {
            icon: 'edit',
            label: 'save',
            action: updateAction(element),
        },
        content: render(options),
    };
}

export { editSmvOptsWizard };
//# sourceMappingURL=smvopts.js.map
