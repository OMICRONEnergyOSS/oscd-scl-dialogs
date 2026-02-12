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
      pattern="${patterns.alphanumericFirstLowerCase}"
      dialogInitialFocus
      disabled
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
      .selectOptions=${content.doTypes.map(dataType => dataType.id)}
      .value=${content.type}
      disabled
    ></scl-select>`,
    ];
}
function createSDoAction(parent) {
    return (inputs) => {
        const name = getValue(inputs.find(i => i.label === 'name'));
        const desc = getValue(inputs.find(i => i.label === 'desc'));
        const type = getValue(inputs.find(i => i.label === 'type'));
        const actions = [];
        const element = createElement(parent.ownerDocument, 'SDO', {
            name,
            desc,
            type,
        });
        actions.push({
            parent,
            node: element,
            reference: getReference(parent, 'SDO'),
        });
        return actions;
    };
}
function createSDoWizard(parent) {
    const [type, name, desc] = [null, '', null];
    const doTypes = Array.from(parent.ownerDocument.querySelectorAll('DOType')).filter(doType => doType.getAttribute('id'));
    return {
        title: 'Add SDO',
        primary: { icon: '', label: 'save', action: createSDoAction(parent) },
        content: renderContent({
            name,
            desc,
            type,
            doTypes,
        }),
    };
}
function updateSDoAction(element) {
    return (inputs) => {
        const name = getValue(inputs.find(i => i.label === 'name'));
        const desc = getValue(inputs.find(i => i.label === 'desc'));
        const type = getValue(inputs.find(i => i.label === 'type'));
        if (name === element.getAttribute('name') &&
            desc === element.getAttribute('desc') &&
            type === element.getAttribute('type')) {
            return [];
        }
        return [{ element, attributes: { name, desc, type } }];
    };
}
function editSDoWizard(element) {
    const [type, name, desc] = [
        element.getAttribute('type'),
        element.getAttribute('name'),
        element.getAttribute('desc'),
    ];
    const doTypes = Array.from(element.ownerDocument.querySelectorAll('DOType')).filter(doType => doType.getAttribute('id'));
    return {
        title: 'Edit SDO',
        primary: { icon: '', label: 'save', action: updateSDoAction(element) },
        content: renderContent({
            name,
            desc,
            type,
            doTypes,
        }),
    };
}

export { createSDoWizard, editSDoWizard };
//# sourceMappingURL=sdo.js.map
