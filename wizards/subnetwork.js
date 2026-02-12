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
import { reservedNames, getValue, getMultiplier, createElement, cloneElement } from '../foundation.js';
import { patterns } from './patterns.js';

/** Initial attribute values suggested for `SubNetwork` creation */
const initial = {
    type: '8-MMS',
    bitrate: '100',
    multiplier: 'M',
};
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
      pattern="${patterns.normalizedString}"
    ></scl-text-field>`,
        b `<scl-text-field
      label="BitRate"
      .value=${options.BitRate}
      nullable
      unit="b/s"
      .multipliers=${[null, 'M']}
      .multiplier=${options.multiplier}
      required
      pattern="${patterns.decimal}"
    ></scl-text-field>`,
    ];
}
function createAction(parent) {
    return (inputs) => {
        const name = getValue(inputs.find(i => i.label === 'name'));
        const desc = getValue(inputs.find(i => i.label === 'desc'));
        const type = getValue(inputs.find(i => i.label === 'type'));
        const BitRate = getValue(inputs.find(i => i.label === 'BitRate'));
        const multiplier = getMultiplier(inputs.find(i => i.label === 'BitRate'));
        const element = createElement(parent.ownerDocument, 'SubNetwork', {
            name,
            desc,
            type,
        });
        if (BitRate !== null) {
            const bitRateElement = createElement(parent.ownerDocument, 'BitRate', {
                unit: 'b/s',
                multiplier,
            });
            bitRateElement.textContent = BitRate;
            element.appendChild(bitRateElement);
        }
        const action = {
            parent,
            node: element,
            reference: getReference(parent, 'SubNetwork'),
        };
        return [action];
    };
}
function createSubNetworkWizard(parent) {
    return {
        title: 'Add SubNetwork',
        primary: {
            icon: 'add',
            label: 'add',
            action: createAction(parent),
        },
        content: renderContent({
            name: '',
            reservedValues: reservedNames(parent, 'SubNetwork'),
            desc: '',
            type: initial.type,
            BitRate: initial.bitrate,
            multiplier: initial.multiplier,
        }),
    };
}
function getBitRateAction(oldBitRate, BitRate, multiplier, SubNetwork) {
    if (oldBitRate === null) {
        const bitRateElement = createElement(SubNetwork.ownerDocument, 'BitRate', {
            unit: 'b/s',
        });
        if (multiplier) {
            bitRateElement.setAttribute('multiplier', multiplier);
        }
        if (BitRate) {
            bitRateElement.textContent = BitRate;
        }
        return {
            parent: SubNetwork,
            node: bitRateElement,
            reference: getReference(SubNetwork, 'BitRate'),
        };
    }
    if (BitRate === null) {
        return {
            parent: SubNetwork,
            node: oldBitRate,
            reference: oldBitRate.nextSibling,
        };
    }
    const newBitRate = cloneElement(oldBitRate, { multiplier });
    newBitRate.textContent = BitRate;
    return [
        {
            parent: oldBitRate.parentElement,
            node: newBitRate,
            reference: getReference(oldBitRate.parentElement, 'BitRate'),
        },
        { node: oldBitRate },
    ];
}
function updateAction(element) {
    return (inputs) => {
        const name = inputs.find(i => i.label === 'name').value;
        const desc = getValue(inputs.find(i => i.label === 'desc'));
        const type = getValue(inputs.find(i => i.label === 'type'));
        const BitRate = getValue(inputs.find(i => i.label === 'BitRate'));
        const multiplier = getMultiplier(inputs.find(i => i.label === 'BitRate'));
        let subNetworkAction;
        let bitRateAction;
        if (name === element.getAttribute('name') &&
            desc === element.getAttribute('desc') &&
            type === element.getAttribute('type')) {
            subNetworkAction = null;
        }
        else {
            subNetworkAction = { element, attributes: { name, desc, type } };
        }
        if (BitRate ===
            (element.querySelector('SubNetwork > BitRate')?.textContent?.trim() ??
                null) &&
            multiplier ===
                (element
                    .querySelector('SubNetwork > BitRate')
                    ?.getAttribute('multiplier') ?? null)) {
            bitRateAction = null;
        }
        else {
            bitRateAction = getBitRateAction(element.querySelector('SubNetwork > BitRate'), BitRate, multiplier, subNetworkAction?.element ?? element);
        }
        const actions = [];
        if (subNetworkAction) {
            actions.push(subNetworkAction);
        }
        if (bitRateAction) {
            actions.push(bitRateAction);
        }
        return actions;
    };
}
function editSubNetworkWizard(element) {
    const name = element.getAttribute('name');
    const desc = element.getAttribute('desc');
    const type = element.getAttribute('type');
    const BitRate = element.querySelector('SubNetwork > BitRate')?.textContent?.trim() ?? null;
    const multiplier = element.querySelector('SubNetwork > BitRate')?.getAttribute('multiplier') ??
        null;
    reservedNames(element);
    return {
        title: 'Edit SubNetwork',
        primary: {
            icon: 'save',
            label: 'save',
            action: updateAction(element),
        },
        content: renderContent({
            name,
            desc,
            type,
            BitRate,
            multiplier,
        }),
    };
}

export { createAction, createSubNetworkWizard, editSubNetworkWizard };
//# sourceMappingURL=subnetwork.js.map
