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

function lDeviceNamePattern() {
    return ('[A-Za-z][0-9A-Za-z_]{0,2}|' +
        '[A-Za-z][0-9A-Za-z_]{4,63}|' +
        '[A-MO-Za-z][0-9A-Za-z_]{3}|' +
        'N[0-9A-Za-np-z_][0-9A-Za-z_]{2}|' +
        'No[0-9A-Za-mo-z_][0-9A-Za-z_]|' +
        'Non[0-9A-Za-df-z_]');
}
function ldNameIsAllowed(element) {
    return !!element.closest('IED')?.querySelector('Services > ConfLdName');
}
function reservedInstLDevice(currentElement) {
    const ied = currentElement.closest('IED');
    if (!ied) {
        return [];
    }
    return Array.from(ied.querySelectorAll(':scope > AccessPoint > Server > LDevice'))
        .map(ld => ld.getAttribute('inst') ?? '')
        .filter(name => name !== currentElement.getAttribute('inst'));
}
function render(inst, ldName, desc, reservedInsts, allowLdName, disableInst) {
    const content = [
        allowLdName
            ? b `<scl-text-field
          label="ldName"
          .value=${ldName}
          nullable
          supportingText="Logical device name"
          validationMessage="Required"
          dialogInitialFocus
          pattern="${lDeviceNamePattern()}"
        ></scl-text-field>`
            : b `<scl-text-field
          label="ldName"
          .value=${ldName}
          supportingText="IED doesn't support Functional Naming"
          helperPersistent
          readOnly
          disabled
        ></scl-text-field>`,
        b `<scl-text-field
      label="desc"
      .value=${desc}
      nullable
      supportingText="Logical device description"
      pattern="${patterns.normalizedString}"
    ></scl-text-field>`,
        b `<scl-text-field
      label="inst"
      .value=${inst}
      ?disabled=${disableInst}
      required
      supportingText="Logical device inst"
      pattern="${patterns.normalizedString}"
      @input=${(e) => {
            const input = e.target;
            const currentValue = getValue(input) ?? '';
            let customValidityMsg = '';
            if (reservedInsts.includes(currentValue)) {
                customValidityMsg = `"${currentValue}" is already in use`;
            }
            input.setCustomValidity(customValidityMsg);
            input.reportValidity();
        }}
      .reservedValues=${reservedInsts}
    ></scl-text-field>`,
    ];
    return content;
}
function createAction(parent) {
    return (inputs) => {
        const inst = getValue(inputs.find(i => i.label === 'inst'));
        const ldNameAllowed = ldNameIsAllowed(parent);
        const ldName = ldNameAllowed
            ? getValue(inputs.find(i => i.label === 'ldName'))
            : null;
        const desc = getValue(inputs.find(i => i.label === 'desc'));
        const node = createElement(parent.ownerDocument, 'LDevice', {
            inst,
            ldName,
            desc,
        });
        return [
            {
                parent,
                node,
                reference: getReference(parent, 'LDevice'),
            },
        ];
    };
}
function updateAction(element) {
    return (inputs) => {
        const ldNameAllowed = ldNameIsAllowed(element);
        const desc = getValue(inputs.find(i => i.label === 'desc'));
        const ldName = ldNameAllowed
            ? getValue(inputs.find(i => i.label === 'ldName'))
            : null;
        if (ldName === element.getAttribute('ldName') &&
            desc === element.getAttribute('desc')) {
            return [];
        }
        return [
            {
                element,
                attributes: { ldName, desc },
            },
        ];
    };
}
function createLDeviceWizard(parent) {
    return {
        title: 'Add LDevice',
        primary: {
            icon: '',
            label: 'save',
            action: createAction(parent),
        },
        content: render(null, null, null, reservedInstLDevice(parent), ldNameIsAllowed(parent), false),
    };
}
function editLDeviceWizard(element) {
    return {
        title: 'Edit LDevice',
        primary: {
            icon: 'edit',
            label: 'save',
            action: updateAction(element),
        },
        content: render(element.getAttribute('inst'), element.getAttribute('ldName'), element.getAttribute('desc'), reservedInstLDevice(element), ldNameIsAllowed(element), true),
    };
}

export { createAction, createLDeviceWizard, editLDeviceWizard, lDeviceNamePattern, updateAction };
//# sourceMappingURL=ldevice.js.map
