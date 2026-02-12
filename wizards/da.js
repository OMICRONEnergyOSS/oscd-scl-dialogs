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
import { renderAbstractDataAttributeContent, getValAction } from './abstractda.js';
import { functionalConstraintEnum } from './patterns.js';

function renderAdditionalDaContent(fc, dchg, qchg, dupd) {
    return [
        b `<scl-select
      label="fc"
      .selectOptions=${functionalConstraintEnum}
      .value=${fc}
      required
    ></scl-select>`,
        b `<scl-checkbox label="dchg" .value=${dchg} nullable></scl-checkbox>`,
        b `<scl-checkbox label="qchg" .value=${qchg} nullable></scl-checkbox>`,
        b `<scl-checkbox label="dupd" .value=${dupd} nullable></scl-checkbox>`,
    ];
}
function createDaAction(parent) {
    return (inputs) => {
        const name = getValue(inputs.find(i => i.label === 'name'));
        const desc = getValue(inputs.find(i => i.label === 'desc'));
        const bType = getValue(inputs.find(i => i.label === 'bType'));
        const type = bType === 'Enum' || bType === 'Struct'
            ? getValue(inputs.find(i => i.label === 'type'))
            : null;
        const sAddr = getValue(inputs.find(i => i.label === 'sAddr'));
        const valKind = getValue(inputs.find(i => i.label === 'valKind'));
        const valImport = getValue(inputs.find(i => i.label === 'valImport'));
        const valField = inputs.find(i => i.label === 'Val' && i.style.display !== 'none');
        const Val = valField ? getValue(valField) : null;
        const fc = getValue(inputs.find(i => i.label === 'fc')) ?? '';
        const dchg = getValue(inputs.find(i => i.label === 'dchg'));
        const qchg = getValue(inputs.find(i => i.label === 'qchg'));
        const dupd = getValue(inputs.find(i => i.label === 'dupd'));
        const actions = [];
        const element = createElement(parent.ownerDocument, 'DA', {
            name,
            desc,
            bType,
            type,
            sAddr,
            valKind,
            valImport,
            fc,
            dchg,
            qchg,
            dupd,
        });
        if (Val !== null) {
            const valElement = createElement(parent.ownerDocument, 'Val', {});
            valElement.textContent = Val;
            element.appendChild(valElement);
        }
        actions.push({
            parent,
            node: element,
            reference: getReference(parent, 'DA'),
        });
        return actions;
    };
}
function createDaWizard(element) {
    const doc = element.ownerDocument;
    const name = '';
    const desc = null;
    const bType = '';
    const type = null;
    const sAddr = null;
    const Val = null;
    const valKind = null;
    const valImport = null;
    const fc = '';
    const dchg = null;
    const qchg = null;
    const dupd = null;
    const doTypes = Array.from(doc.querySelectorAll('DAType, EnumType')).filter(doType => doType.getAttribute('id'));
    const data = element.closest('DataTypeTemplates');
    return {
        title: 'Add DA',
        primary: {
            icon: '',
            label: 'save',
            action: createDaAction(element),
        },
        content: [
            ...renderAbstractDataAttributeContent(name, desc, bType, doTypes, type, sAddr, valKind, valImport, Val, data),
            ...renderAdditionalDaContent(fc, dchg, qchg, dupd),
        ],
    };
}
function updateDaAction(element) {
    return (inputs) => {
        const name = getValue(inputs.find(i => i.label === 'name'));
        const desc = getValue(inputs.find(i => i.label === 'desc'));
        const bType = getValue(inputs.find(i => i.label === 'bType'));
        const type = bType === 'Enum' || bType === 'Struct'
            ? getValue(inputs.find(i => i.label === 'type'))
            : null;
        const sAddr = getValue(inputs.find(i => i.label === 'sAddr'));
        const valKind = getValue(inputs.find(i => i.label === 'valKind'));
        const valImport = getValue(inputs.find(i => i.label === 'valImport'));
        const valField = inputs.find(i => i.label === 'Val' && i.style.display !== 'none');
        const Val = valField ? getValue(valField) : null;
        const fc = getValue(inputs.find(i => i.label === 'fc')) ?? '';
        const dchg = getValue(inputs.find(i => i.label === 'dchg'));
        const qchg = getValue(inputs.find(i => i.label === 'qchg'));
        const dupd = getValue(inputs.find(i => i.label === 'dupd'));
        let daAction;
        const valAction = [];
        if (name === element.getAttribute('name') &&
            desc === element.getAttribute('desc') &&
            bType === element.getAttribute('bType') &&
            type === element.getAttribute('type') &&
            sAddr === element.getAttribute('sAddr') &&
            valKind === element.getAttribute('valKind') &&
            valImport === element.getAttribute('valImprot') &&
            fc === element.getAttribute('fc') &&
            dchg === element.getAttribute('dchg') &&
            qchg === element.getAttribute('qchg') &&
            dupd === element.getAttribute('dupd')) {
            daAction = null;
        }
        else {
            daAction = {
                element,
                attributes: {
                    name,
                    desc,
                    bType,
                    type,
                    sAddr,
                    valKind,
                    valImport,
                    fc,
                    dchg,
                    qchg,
                    dupd,
                },
            };
        }
        if (Val !== (element.querySelector('Val')?.textContent?.trim() ?? null)) {
            valAction.push(getValAction(element.querySelector('Val'), Val, daAction?.element ?? element));
        }
        const actions = [];
        if (daAction) {
            actions.push(daAction);
        }
        if (valAction) {
            actions.push(...valAction);
        }
        return actions;
    };
}
function editDAWizard(element) {
    const doc = element.ownerDocument;
    const name = element.getAttribute('name');
    const desc = element.getAttribute('desc');
    const bType = element.getAttribute('bType') ?? '';
    const type = element.getAttribute('type');
    const sAddr = element.getAttribute('sAddr');
    const Val = element.querySelector('Val')?.innerHTML.trim() ?? null;
    const valKind = element.getAttribute('valKind');
    const valImport = element.getAttribute('valImport');
    const fc = element.getAttribute('fc') ?? '';
    const dchg = element.getAttribute('dchg');
    const qchg = element.getAttribute('qchg');
    const dupd = element.getAttribute('dupd');
    const doTypes = Array.from(doc.querySelectorAll('DAType, EnumType')).filter(doType => doType.getAttribute('id'));
    const data = element.closest('DataTypeTemplates');
    return {
        title: 'Edit DA',
        primary: {
            icon: '',
            label: 'save',
            action: updateDaAction(element),
        },
        content: [
            ...renderAbstractDataAttributeContent(name, desc, bType, doTypes, type, sAddr, valKind, valImport, Val, data),
            ...renderAdditionalDaContent(fc, dchg, qchg, dupd),
        ],
    };
}

export { createDaWizard, editDAWizard, renderAdditionalDaContent };
//# sourceMappingURL=da.js.map
