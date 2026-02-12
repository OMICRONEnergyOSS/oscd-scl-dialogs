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

function renderContent(content) {
    return [
        b `<scl-text-field
      label="name"
      .value=${content.name}
      required
      pattern="${patterns.alphanumericFirstUpperCase}"
      dialogInitialFocus
    ></scl-text-field>`,
        b `<scl-text-field
      label="desc"
      .value=${content.desc}
      nullable
      pattern="${patterns.normalizedString}"
    ></scl-text-field>`,
        b `<scl-select
      label="type"
      required
      .selectOptions=${content.doTypes.map(doType => doType.id)}
      .value=${content.type}
    ></scl-select>`,
        b `<scl-text-field
      label="accessControl"
      .value=${content.accessControl}
      nullable
      pattern="${patterns.normalizedString}"
    ></scl-text-field>`,
        b `<scl-checkbox
      label="transient"
      .value="${content.transient}"
      nullable
    ></scl-checkbox>`,
    ];
}
function createDoAction(parent) {
    return (inputs) => {
        const name = getValue(inputs.find(i => i.label === 'name'));
        const desc = getValue(inputs.find(i => i.label === 'desc'));
        const type = getValue(inputs.find(i => i.label === 'type'));
        const accessControl = getValue(inputs.find(i => i.label === 'accessControl'));
        const transient = getValue(inputs.find(i => i.label === 'transient')) !== ''
            ? getValue(inputs.find(i => i.label === 'transient'))
            : null;
        const actions = [];
        const element = createElement(parent.ownerDocument, 'DO', {
            name,
            desc,
            type,
            accessControl,
            transient,
        });
        actions.push({
            parent,
            node: element,
            reference: getReference(parent, 'DO'),
        });
        return actions;
    };
}
function createDoWizard(parent) {
    const [type, name, desc, accessControl, transient] = [
        null,
        '',
        null,
        null,
        null,
    ];
    const doTypes = Array.from(parent.ownerDocument.querySelectorAll('DOType')).filter(doType => doType.getAttribute('id'));
    return {
        title: 'Add DO',
        primary: { icon: '', label: 'save', action: createDoAction(parent) },
        content: renderContent({
            name,
            desc,
            transient,
            accessControl,
            type,
            doTypes,
        }),
    };
}
function updateDoAction(element) {
    return (inputs) => {
        const name = getValue(inputs.find(i => i.label === 'name'));
        const desc = getValue(inputs.find(i => i.label === 'desc'));
        const type = getValue(inputs.find(i => i.label === 'type'));
        const accessControl = getValue(inputs.find(i => i.label === 'accessControl'));
        const transient = getValue(inputs.find(i => i.label === 'transient')) !== ''
            ? getValue(inputs.find(i => i.label === 'transient'))
            : null;
        if (name === element.getAttribute('name') &&
            desc === element.getAttribute('desc') &&
            type === element.getAttribute('type') &&
            accessControl === element.getAttribute('accessControl') &&
            transient === element.getAttribute('transient')) {
            return [];
        }
        return [
            { element, attributes: { name, desc, type, accessControl, transient } },
        ];
    };
}
function editDoWizard(element) {
    const [type, name, desc, accessControl, transient] = [
        element.getAttribute('type'),
        element.getAttribute('name'),
        element.getAttribute('desc'),
        element.getAttribute('accessControl'),
        element.getAttribute('transient'),
    ];
    const doTypes = Array.from(element.ownerDocument.querySelectorAll('DOType')).filter(doType => doType.getAttribute('id'));
    return {
        title: 'Edit DO',
        primary: { icon: '', label: 'save', action: updateDoAction(element) },
        content: renderContent({
            name,
            desc,
            transient,
            accessControl,
            type,
            doTypes,
        }),
    };
}

export { createDoWizard, editDoWizard };
//# sourceMappingURL=do.js.map
