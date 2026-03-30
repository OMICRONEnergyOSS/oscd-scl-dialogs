import '../node_modules/@lit/reactive-element/reactive-element.js';
import { html as b } from '../node_modules/lit-html/lit-html.js';
import '../node_modules/lit-element/lit-element.js';
import { reservedNames, getValue } from '../foundation.js';
import { maxLength, tSmpMod, tSecurityEnable } from './patterns.js';

function render(options) {
    const fields = [
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
        b `<scl-text-field
      label="smvID"
      .value=${options.smvID}
      required
    ></scl-text-field>`,
        b `<scl-select
      label="smpMod"
      .selectOptions=${tSmpMod}
      .value=${options.smpMod}
      nullable
    ></scl-select>`,
        b `<scl-text-field
      label="smpRate"
      .value=${options.smpRate}
      required
      type="number"
      min="0"
    ></scl-text-field>`,
        b `<scl-text-field
      label="nofASDU"
      .value=${options.nofASDU}
      required
      type="number"
      min="0"
    ></scl-text-field>`,
        b `<scl-select
      label="securityEnabled"
      .selectOptions=${tSecurityEnable}
      .value=${options.securityEnabled}
      nullable
    ></scl-select>`,
    ];
    if (options.multicast === 'false') {
        fields.push(b `<scl-checkbox
        label="multicast"
        .value=${'false'}
        disabled
      ></scl-checkbox>`);
    }
    return fields;
}
function updateAction(element) {
    return (inputs) => {
        const name = getValue(inputs.find(i => i.label === 'name'));
        const desc = getValue(inputs.find(i => i.label === 'desc'));
        const smvID = getValue(inputs.find(i => i.label === 'smvID'));
        const smpMod = getValue(inputs.find(i => i.label === 'smpMod'));
        const smpRate = getValue(inputs.find(i => i.label === 'smpRate'));
        const nofASDU = getValue(inputs.find(i => i.label === 'nofASDU'));
        const securityEnabled = getValue(inputs.find(i => i.label === 'securityEnabled'));
        if (name === element.getAttribute('name') &&
            desc === element.getAttribute('desc') &&
            smvID === element.getAttribute('smvID') &&
            smpMod === element.getAttribute('smpMod') &&
            smpRate === element.getAttribute('smpRate') &&
            nofASDU === element.getAttribute('nofASDU') &&
            securityEnabled === element.getAttribute('securityEnabled')) {
            return [];
        }
        return [
            {
                element,
                attributes: {
                    name,
                    desc,
                    smvID,
                    smpMod,
                    smpRate,
                    nofASDU,
                    securityEnabled,
                },
            },
        ];
    };
}
function editSampledValueControlWizard(element) {
    return {
        title: 'Edit SampledValueControl',
        primary: {
            icon: 'edit',
            label: 'save',
            action: updateAction(element),
        },
        content: render({
            name: element.getAttribute('name') ?? '',
            reservedValues: reservedNames(element),
            desc: element.getAttribute('desc'),
            smvID: element.getAttribute('smvID') ?? '',
            smpMod: element.getAttribute('smpMod'),
            smpRate: element.getAttribute('smpRate') ?? '',
            nofASDU: element.getAttribute('nofASDU') ?? '',
            securityEnabled: element.getAttribute('securityEnabled'),
            multicast: element.getAttribute('multicast'),
        }),
    };
}

export { editSampledValueControlWizard };
//# sourceMappingURL=sampledvaluecontrol.js.map
