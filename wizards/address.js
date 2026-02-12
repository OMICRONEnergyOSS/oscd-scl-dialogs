import '../node_modules/@lit/reactive-element/reactive-element.js';
import { html as b } from '../node_modules/lit-html/lit-html.js';
import '../node_modules/lit-element/lit-element.js';
import { ifDefined as o } from '../node_modules/lit-html/directives/if-defined.js';
import { getReference } from '../node_modules/@openscd/scl-lib/dist/tBaseElement/getReference.js';
import '../node_modules/@openscd/scl-lib/dist/generator/lnInstGenerator.js';
import '../node_modules/@openscd/scl-lib/dist/generator/macAddressGenerator.js';
import '../node_modules/@openscd/scl-lib/dist/generator/appIdGenerator.js';
import '../node_modules/@openscd/scl-lib/dist/tExtRef/extRefTypeRestrictions.js';
import '../node_modules/@openscd/scl-lib/dist/tDataTypeTemplates/nsdToJson.js';
import '../node_modules/@openscd/scl-lib/dist/tBaseElement/find.js';
import '../node_modules/@openscd/scl-lib/dist/tBaseElement/tags.js';
import { typePattern } from './patterns.js';
import { typeNullable, createElement } from '../foundation.js';

function getPElement(parent, type) {
    return (Array.from(parent.querySelectorAll(':scope > Address > P')).find(p => p.getAttribute('type') === type) ?? null);
}
function existDiff(oldAddr, newAddr) {
    if (oldAddr.querySelectorAll('P').length !==
        newAddr.querySelectorAll('P').length) {
        return true;
    }
    return Array.from(oldAddr.querySelectorAll('P')).some(pType => getPElement(newAddr, pType.getAttribute('type'))?.textContent !==
        pType.textContent);
}
function createAddressElement(parent, inputs, instType) {
    const address = createElement(parent.ownerDocument, 'Address', {});
    Object.entries(inputs)
        .filter(([_, value]) => value !== null)
        .forEach(([key, value]) => {
        const type = key;
        const child = createElement(parent.ownerDocument, 'P', { type });
        if (instType) {
            child.setAttributeNS('http://www.w3.org/2001/XMLSchema-instance', 'xsi:type', `tP_${key}`);
        }
        child.textContent = value;
        address.appendChild(child);
    });
    return address;
}
function updateAddress(parent, inputs, instType) {
    const actions = [];
    const newAddress = createAddressElement(parent, inputs, instType);
    const oldAddress = parent.querySelector('Address');
    if (oldAddress !== null && existDiff(oldAddress, newAddress)) {
        actions.push({
            node: oldAddress,
        });
        actions.push({
            parent,
            node: newAddress,
            reference: oldAddress.nextSibling,
        });
    }
    else if (oldAddress === null) {
        actions.push({
            parent,
            node: newAddress,
            reference: getReference(parent, 'Address'),
        });
    }
    return actions;
}
function hasTypeRestriction(element) {
    return Array.from(element.querySelectorAll('Address > P')).some(pType => pType.getAttribute('xsi:type'));
}
function contentAddress(content) {
    const pChildren = {};
    content.types.forEach(type => {
        if (!pChildren[type]) {
            pChildren[type] =
                getPElement(content.element, type)?.textContent?.trim() ?? null;
        }
    });
    return [
        b `<scl-checkbox
      label="Add XMLSchema-instance type"
      id="instType"
      .value="${hasTypeRestriction(content.element) ? 'true' : 'false'}"
    ></scl-checkbox>`,
        b `${Object.entries(pChildren).map(([key, value]) => b `<scl-text-field
          label="${key}"
          ?nullable=${typeNullable[key]}
          .value=${value}
          pattern="${o(typePattern[key])}"
          required
        ></scl-text-field>`)}`,
    ];
}

export { contentAddress, createAddressElement, existDiff, hasTypeRestriction, updateAddress };
//# sourceMappingURL=address.js.map
