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
import { patterns } from './patterns.js';

function renderContent(options) {
    return [
        b `<scl-text-field
      label="name"
      .value=${options.name}
      required
      dialogInitialFocus
    ></scl-text-field>`,
        b `<scl-text-field
      label="desc"
      .value=${options.desc}
      nullable
    ></scl-text-field>`,
        b `<scl-text-field
      label="type"
      .value=${options.type}
      nullable
    ></scl-text-field>`,
        b `<scl-text-field
      label="nomFreq"
      .value=${options.nomFreq}
      nullable
      suffix="Hz"
      pattern="${patterns.unsigned}"
    ></scl-text-field>`,
        b `<scl-text-field
      label="numPhases"
      .value=${options.numPhases}
      nullable
      suffix="#"
      type="number"
      min="1"
      max="255"
    ></scl-text-field>`,
    ];
}
function createAction(parent) {
    return (inputs) => {
        const attributes = {};
        const lineKeys = ['name', 'desc', 'type', 'nomFreq', 'numPhases'];
        lineKeys.forEach(key => {
            attributes[key] = getValue(inputs.find(i => i.label === key));
        });
        const line = createElement(parent.ownerDocument, 'Line', attributes);
        return [{ parent, node: line, reference: getReference(parent, 'Line') }];
    };
}
function createLineWizard(parent) {
    const name = '';
    const desc = '';
    const type = '';
    const nomFreq = '';
    const numPhases = '';
    reservedNames(parent, 'Line');
    return {
        title: 'Add Line',
        primary: {
            icon: 'save',
            label: 'save',
            action: createAction(parent),
        },
        content: [
            ...renderContent({
                name,
                desc,
                type,
                nomFreq,
                numPhases,
            }),
        ],
    };
}
function updateAction(element) {
    return (inputs) => {
        const attributes = {};
        const lineKeys = ['name', 'desc', 'type', 'nomFreq', 'numPhases'];
        lineKeys.forEach(key => {
            attributes[key] = getValue(inputs.find(i => i.label === key));
        });
        if (lineKeys.some(key => attributes[key] !== element.getAttribute(key))) {
            return [{ element, attributes }];
        }
        return [];
    };
}
function editLineWizard(element) {
    return {
        title: 'Edit Line',
        primary: {
            icon: 'edit',
            label: 'save',
            action: updateAction(element),
        },
        content: renderContent({
            name: element.getAttribute('name') ?? '',
            reservedValues: reservedNames(element),
            desc: element.getAttribute('desc'),
            type: element.getAttribute('type'),
            nomFreq: element.getAttribute('nomFreq'),
            numPhases: element.getAttribute('numPhases'),
        }),
    };
}

export { createLineWizard, editLineWizard };
//# sourceMappingURL=line.js.map
