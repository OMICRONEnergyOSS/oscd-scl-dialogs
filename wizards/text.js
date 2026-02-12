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

function render({ content }) {
    return [
        b `<md-filled-textfield
      type="textarea"
      label="content"
      value="${content}"
      rows="10"
      cols="80"
      dialogInitialFocus
    ></md-filled-textfield>`,
    ];
}
function createAction(parent) {
    return (inputs) => {
        const content = getValue(inputs.find(i => i.label === 'content'));
        parent.ownerDocument.createElement('Text');
        const text = createElement(parent.ownerDocument, 'Text', {});
        text.textContent = content;
        return [
            {
                parent,
                node: text,
                reference: getReference(parent, 'Text'),
            },
        ];
    };
}
function createTextWizard(parent) {
    return {
        title: 'Create Text',
        primary: {
            icon: 'add',
            label: 'add',
            action: createAction(parent),
        },
        content: render({
            content: '',
        }),
    };
}
function updateAction(element) {
    return (inputs) => {
        const content = inputs.find(i => i.label === 'content').value;
        if (content === element.textContent) {
            return [];
        }
        const node = element.cloneNode();
        node.textContent = content;
        Array.from(element.querySelectorAll('Private')).forEach(priv => node.prepend(priv.cloneNode(true)));
        const reference = element.nextElementSibling;
        const parent = element.parentElement;
        if (!parent) {
            return [];
        }
        return [{ node: element }, { parent, node, reference }];
    };
}
function editTextWizard(element) {
    return {
        title: 'Edit Text',
        primary: {
            icon: 'edit',
            label: 'save',
            action: updateAction(element),
        },
        content: render({
            content: element.textContent || '',
        }),
    };
}

export { createAction, createTextWizard, editTextWizard, updateAction };
//# sourceMappingURL=text.js.map
