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
import { contentAddress, updateAddress } from './address.js';

function mxxTimeUpdateAction(gse, oldMxxTime, newTimeValue, option) {
    if (oldMxxTime === null) {
        const newMxxTime = createElement(gse.ownerDocument, option.minOrMax, {
            unit: 's',
            multiplier: 'm',
        });
        newMxxTime.textContent = newTimeValue;
        return [
            {
                parent: gse,
                node: newMxxTime,
                reference: getReference(gse, option.minOrMax),
            },
        ];
    }
    if (newTimeValue === null) {
        return [
            {
                node: oldMxxTime,
            },
        ];
    }
    const newMxxTime = oldMxxTime.cloneNode(false);
    newMxxTime.textContent = newTimeValue;
    return [
        {
            parent: gse,
            node: newMxxTime,
            reference: oldMxxTime.nextSibling,
        },
        { node: oldMxxTime },
    ];
}
function updateAction(element) {
    return (inputs, wizard) => {
        const action = [];
        const instType = wizard.querySelector('#instType').value === 'true';
        const addressContent = {};
        addressContent['MAC-Address'] = getValue(inputs.find(i => i.label === 'MAC-Address'));
        addressContent.APPID = getValue(inputs.find(i => i.label === 'APPID'));
        addressContent['VLAN-ID'] = getValue(inputs.find(i => i.label === 'VLAN-ID'));
        addressContent['VLAN-PRIORITY'] = getValue(inputs.find(i => i.label === 'VLAN-PRIORITY'));
        const addressActions = updateAddress(element, addressContent, instType);
        addressActions.forEach(addressAction => {
            action.push(addressAction);
        });
        const minTime = getValue(inputs.find(i => i.label === 'MinTime'));
        const MaxTime = getValue(inputs.find(i => i.label === 'MaxTime'));
        if (minTime !==
            (element.querySelector('MinTime')?.textContent?.trim() ?? null)) {
            action.push(...mxxTimeUpdateAction(element, element.querySelector('MinTime'), minTime, { minOrMax: 'MinTime' }));
        }
        if (MaxTime !==
            (element.querySelector('MaxTime')?.textContent?.trim() ?? null)) {
            action.push(...mxxTimeUpdateAction(element, element.querySelector('MaxTime'), minTime, { minOrMax: 'MaxTime' }));
        }
        return action;
    };
}
function editGseWizard(element) {
    const minTime = element.querySelector('MinTime')?.innerHTML.trim() ?? null;
    const maxTime = element.querySelector('MaxTime')?.innerHTML.trim() ?? null;
    const types = ['MAC-Address', 'APPID', 'VLAN-ID', 'VLAN-PRIORITY'];
    return {
        title: 'Edit GSE',
        primary: {
            label: 'save',
            icon: 'save',
            action: updateAction(element),
        },
        content: [
            ...contentAddress({ element, types }),
            b `<scl-text-field
        label="MinTime"
        .value=${minTime}
        nullable
        suffix="ms"
        type="number"
      ></scl-text-field>`,
            b `<scl-text-field
        label="MaxTime"
        .value=${maxTime}
        nullable
        suffix="ms"
        type="number"
      ></scl-text-field>`,
        ],
    };
}

export { editGseWizard };
//# sourceMappingURL=gse.js.map
