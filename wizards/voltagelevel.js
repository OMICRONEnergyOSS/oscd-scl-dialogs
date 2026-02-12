import '../node_modules/@lit/reactive-element/reactive-element.js';
import { html as b } from '../node_modules/lit-html/lit-html.js';
import '../node_modules/lit-element/lit-element.js';
import { updateVoltageLevel } from '../node_modules/@openscd/scl-lib/dist/tVoltageLevel/updateVoltageLevel.js';
import { getReference } from '../node_modules/@openscd/scl-lib/dist/tBaseElement/getReference.js';
import '../node_modules/@openscd/scl-lib/dist/generator/lnInstGenerator.js';
import '../node_modules/@openscd/scl-lib/dist/generator/macAddressGenerator.js';
import '../node_modules/@openscd/scl-lib/dist/generator/appIdGenerator.js';
import '../node_modules/@openscd/scl-lib/dist/tExtRef/extRefTypeRestrictions.js';
import '../node_modules/@openscd/scl-lib/dist/tDataTypeTemplates/nsdToJson.js';
import '../node_modules/@openscd/scl-lib/dist/tBaseElement/find.js';
import '../node_modules/@openscd/scl-lib/dist/tBaseElement/tags.js';
import { reservedNames, getValue, getMultiplier, createElement, cloneElement } from '../foundation.js';

const initial = {
    nomFreq: '50',
    numPhases: '3',
    Voltage: '110',
    multiplier: 'k',
};
function render(option) {
    return [
        b `<scl-text-field
      label="name"
      .value=${option.name}
      helper="VoltageLevel name attribute"
      required
      validationMessage="Required information"
      .reservedValues="${option.reservedValues}"
      dialogInitialFocus
    ></scl-text-field>`,
        b `<scl-text-field
      label="desc"
      .value=${option.desc}
      nullable
      helper="VoltageLevel name attribute"
    ></scl-text-field>`,
        b `<scl-text-field
      label="nomFreq"
      .value=${option.nomFreq}
      nullable
      helper="Nominal Frequency"
      suffix="Hz"
      required
      validationMessage="Number bigger than 0"
    ></scl-text-field>`,
        b `<scl-text-field
      label="numPhases"
      .value=${option.numPhases}
      nullable
      helper="Number of Phases"
      suffix="#"
      required
      validationMessage="Number bigger than 0"
      type="number"
      min="1"
      max="255"
    ></scl-text-field>`,
        b `<scl-text-field
      label="Voltage"
      .value=${option.Voltage}
      nullable
      unit="V"
      .multipliers=${[null, 'G', 'M', 'k', '', 'm']}
      .multiplier=${option.multiplier}
      helper="Voltage"
      required
      validationMessage="Number bigger than 0"
    ></scl-text-field>`,
    ];
}
function createAction(parent) {
    return (inputs) => {
        const name = getValue(inputs.find(i => i.label === 'name'));
        const desc = getValue(inputs.find(i => i.label === 'desc'));
        const nomFreq = getValue(inputs.find(i => i.label === 'nomFreq'));
        const numPhases = getValue(inputs.find(i => i.label === 'numPhases'));
        const Voltage = getValue(inputs.find(i => i.label === 'Voltage'));
        const multiplier = getMultiplier(inputs.find(i => i.label === 'Voltage'));
        const element = createElement(parent.ownerDocument, 'VoltageLevel', {
            name,
            desc,
            nomFreq,
            numPhases,
        });
        if (Voltage !== null) {
            const voltageElement = createElement(parent.ownerDocument, 'Voltage', {
                unit: 'V',
                multiplier,
            });
            voltageElement.textContent = Voltage;
            element.insertBefore(voltageElement, element.firstChild);
        }
        return [
            {
                parent,
                node: element,
                reference: getReference(parent, 'VoltageLevel'),
            },
        ];
    };
}
function createVoltageLevelWizard(parent) {
    return {
        title: 'Create VoltageLevel',
        primary: {
            icon: 'add',
            label: 'add',
            action: createAction(parent),
        },
        content: render({
            name: '',
            reservedValues: reservedNames(parent, 'VoltageLevel'),
            desc: '',
            nomFreq: initial.nomFreq,
            numPhases: initial.numPhases,
            Voltage: initial.Voltage,
            multiplier: initial.multiplier,
        }),
    };
}
function getVoltageAction(oldVoltage, Voltage, multiplier, voltageLevel) {
    if (oldVoltage === null) {
        const element = createElement(voltageLevel.ownerDocument, 'Voltage', {
            unit: 'V',
            multiplier,
        });
        element.textContent = Voltage;
        return [
            {
                parent: voltageLevel,
                node: element,
                reference: getReference(voltageLevel, 'Voltage'),
            },
        ];
    }
    if (Voltage === null) {
        return [
            {
                node: oldVoltage,
            },
        ];
    }
    const newVoltage = cloneElement(oldVoltage, { multiplier });
    newVoltage.textContent = Voltage;
    return [
        {
            parent: voltageLevel,
            node: newVoltage,
            reference: oldVoltage.nextElementSibling,
        },
        { node: oldVoltage },
    ];
}
function updateAction(element) {
    return (inputs) => {
        const name = inputs.find(i => i.label === 'name').value;
        const desc = getValue(inputs.find(i => i.label === 'desc'));
        const nomFreq = getValue(inputs.find(i => i.label === 'nomFreq'));
        const numPhases = getValue(inputs.find(i => i.label === 'numPhases'));
        const Voltage = getValue(inputs.find(i => i.label === 'Voltage'));
        const multiplier = getMultiplier(inputs.find(i => i.label === 'Voltage'));
        let voltageLevelAction;
        let voltageAction;
        if (name === element.getAttribute('name') &&
            desc === element.getAttribute('desc') &&
            nomFreq === element.getAttribute('nomFreq') &&
            numPhases === element.getAttribute('numPhases')) {
            voltageLevelAction = null;
        }
        else {
            voltageLevelAction = {
                element,
                attributes: { name, desc, nomFreq, numPhases },
            };
        }
        if (Voltage ===
            (element.querySelector('VoltageLevel > Voltage')?.textContent?.trim() ??
                null) &&
            multiplier ===
                (element
                    .querySelector('VoltageLevel > Voltage')
                    ?.getAttribute('multiplier') ?? null)) {
            voltageAction = null;
        }
        else {
            voltageAction = getVoltageAction(element.querySelector('VoltageLevel > Voltage'), Voltage, multiplier, element);
        }
        const complexAction = [];
        if (voltageLevelAction) {
            complexAction.push(...updateVoltageLevel(voltageLevelAction));
        }
        if (voltageAction) {
            complexAction.push(...voltageAction);
        }
        return complexAction.length ? complexAction : [];
    };
}
function editVoltageLevelWizard(element) {
    return {
        title: 'Edit VoltageLevel',
        primary: {
            icon: 'edit',
            label: 'save',
            action: updateAction(element),
        },
        content: render({
            name: element.getAttribute('name') ?? '',
            reservedValues: reservedNames(element),
            desc: element.getAttribute('desc'),
            nomFreq: element.getAttribute('nomFreq'),
            numPhases: element.getAttribute('numPhases'),
            Voltage: element.querySelector('VoltageLevel > Voltage')?.textContent?.trim() ??
                null,
            multiplier: element
                .querySelector('VoltageLevel > Voltage')
                ?.getAttribute('multiplier') ?? null,
        }),
    };
}

export { createAction, createVoltageLevelWizard, editVoltageLevelWizard, updateAction };
//# sourceMappingURL=voltagelevel.js.map
