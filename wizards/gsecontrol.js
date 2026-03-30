import '../node_modules/@lit/reactive-element/reactive-element.js';
import { html as b } from '../node_modules/lit-html/lit-html.js';
import '../node_modules/lit-element/lit-element.js';
import { reservedNames, getValue } from '../foundation.js';
import { maxLength, tGSEControlType, tSecurityEnable } from './patterns.js';

function render(options) {
    return [
        b `<scl-text-field
      label="name"
      .value=${options.name}
      required
      maxLength="${maxLength.cbName}"
      .reservedValues=${options.reservedValues}
      dialogInitialFocus
    ></scl-text-field>`,
        b `<scl-text-field
      label="desc"
      .value=${options.desc}
      nullable
    ></scl-text-field>`,
        b `<scl-select
      label="type"
      .selectOptions=${tGSEControlType}
      .value=${options.type}
      nullable
    ></scl-select>`,
        b `<scl-text-field
      label="appID"
      .value=${options.appID}
      required
    ></scl-text-field>`,
        b `<scl-checkbox
      label="fixedOffs"
      .value=${options.fixedOffs}
      nullable
    ></scl-checkbox>`,
        b `<scl-select
      label="securityEnabled"
      .selectOptions=${tSecurityEnable}
      .value=${options.securityEnabled}
      nullable
    ></scl-select>`,
    ];
}
function updateAction(element) {
    return (inputs) => {
        const name = getValue(inputs.find(i => i.label === 'name'));
        const desc = getValue(inputs.find(i => i.label === 'desc'));
        const type = getValue(inputs.find(i => i.label === 'type'));
        const appID = getValue(inputs.find(i => i.label === 'appID'));
        const fixedOffs = getValue(inputs.find(i => i.label === 'fixedOffs'));
        const securityEnabled = getValue(inputs.find(i => i.label === 'securityEnabled'));
        if (name === element.getAttribute('name') &&
            desc === element.getAttribute('desc') &&
            type === element.getAttribute('type') &&
            appID === element.getAttribute('appID') &&
            fixedOffs === element.getAttribute('fixedOffs') &&
            securityEnabled === element.getAttribute('securityEnabled')) {
            return [];
        }
        return [
            {
                element,
                attributes: { name, desc, type, appID, fixedOffs, securityEnabled },
            },
        ];
    };
}
function editGSEControlWizard(element) {
    return {
        title: 'Edit GSEControl',
        primary: {
            icon: 'edit',
            label: 'save',
            action: updateAction(element),
        },
        content: render({
            name: element.getAttribute('name') ?? '',
            reservedValues: reservedNames(element),
            desc: element.getAttribute('desc'),
            type: element.getAttribute('type'),
            appID: element.getAttribute('appID') ?? '',
            fixedOffs: element.getAttribute('fixedOffs'),
            securityEnabled: element.getAttribute('securityEnabled'),
        }),
    };
}

export { editGSEControlWizard };
//# sourceMappingURL=gsecontrol.js.map
