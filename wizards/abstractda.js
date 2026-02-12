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
import { createElement } from '../foundation.js';
import { patterns, maxLength, predefinedBasicTypeEnum, valKindEnum } from './patterns.js';

function setSelValue(typeInput, data, Val) {
    const typeValue = typeInput.value;
    const selValInput = typeInput.parentElement.querySelector('scl-select[label="Val"]');
    // If enum make sure to load select Val
    const enumVals = Array.from(data.querySelectorAll(`EnumType[id="${typeValue}"] > EnumVal`)).map(enumval => enumval.textContent?.trim() ?? '');
    selValInput.selectOptions = enumVals;
    selValInput.value = Val;
    selValInput.requestUpdate();
}
function changeType(e, data, Val) {
    if (!e.target || !e.target.parentElement) {
        return;
    }
    // Query all needed inputs
    const typeInput = e.target;
    const bTypeInput = typeInput.parentElement.querySelector('scl-select[label="bType"]');
    //TODO: declared but not used - figure out if it's needed and the implementation is incomplete, or just a copy paste oversight
    // const selValInput = typeInput.parentElement!.querySelector(
    //   'scl-select[label="Val"]'
    // ) as SclSelect;
    // Get values
    // const typeValue = typeInput.value;
    const bTypeValue = bTypeInput.value;
    if (bTypeValue !== 'Enum') {
        return;
    }
    setSelValue(typeInput, data, Val);
}
function changeBType(e, bType, type, data) {
    // Query all needed inputs
    const bTypeInput = e.target;
    const typeInput = bTypeInput.parentElement.querySelector('*[label="type"]');
    const selValInput = bTypeInput.parentElement.querySelector('scl-select[label="Val"]');
    const textValInput = bTypeInput.parentElement.querySelector('scl-text-field[label="Val"]');
    // Get necassary values
    const bTypeValue = bTypeInput.value;
    // Disable/enable inputs based on bType
    typeInput.disabled = !(bTypeValue === 'Enum' || bTypeValue === 'Struct');
    if (typeInput.disabled) {
        typeInput.value = '';
    }
    // Hide/show EnumType/DAType based on bType selection
    const enabledItems = [];
    Array.from(typeInput.children).forEach(child => {
        const childItem = child;
        childItem.disabled = !child.classList.contains(bTypeValue);
        childItem.style.display = !child.classList.contains(bTypeValue)
            ? 'none'
            : '';
        if (!childItem.disabled) {
            enabledItems.push(childItem);
        }
    });
    // Set the type input value to the first enabled item or empty if none
    if (type && bType === bTypeValue) {
        typeInput.value = type;
    }
    else {
        typeInput.value = enabledItems.length ? enabledItems[0].value : '';
    }
    // Hide/show Val input based on bType selection
    if (bTypeValue === 'Enum') {
        selValInput.style.display = '';
    }
    else {
        selValInput.style.display = 'none';
    }
    setSelValue(typeInput, data, null);
    // Hide/show Val input based on bType selection
    if (bTypeValue === 'Enum' || bTypeValue === 'Struct') {
        textValInput.style.display = 'none';
    }
    else {
        textValInput.style.display = '';
    }
    // Update inputs
    selValInput.requestUpdate();
    textValInput.requestUpdate();
    typeInput.requestUpdate();
}
function filterType(bType, tag) {
    if (bType === 'Enum' || tag === 'EnumType') {
        return '';
    }
    if (bType === 'Struct' || tag === 'DAType') {
        return '';
    }
    if (bType === 'Enum' || tag === 'DAType') {
        return 'none';
    }
    return 'none';
}
function renderAbstractDataAttributeContent(name, desc, bType, types, type, sAddr, valKind, valImport, Val, data) {
    return [
        b `<scl-text-field
      label="name"
      .value=${name}
      required
      pattern="${patterns.abstractDataAttributeName}"
      maxLength="${maxLength.abstracDaName}"
    ></scl-text-field>`,
        b `<scl-text-field
      label="desc"
      .value=${desc}
      nullable
      pattern="${patterns.normalizedString}"
    ></scl-text-field>`,
        b `<scl-select
      label="bType"
      .selectOptions=${predefinedBasicTypeEnum}
      .value=${bType}
      required
      @input=${(e) => changeBType(e, bType, type, data)}
    ></scl-select>`,
        b `<md-filled-select
      label="type"
      .value=${type}
      .disabled=${bType !== 'Enum' && bType !== 'Struct'}
      @change=${(e) => changeType(e, data, Val)}
      >${types.map(dataType => b `<md-select-option
            class="${dataType.tagName === 'EnumType' ? 'Enum' : 'Struct'}"
            style="display: ${filterType(bType, dataType.tagName)}"
            value=${dataType.id}
            >${dataType.id}</md-select-option
          >`)}</md-filled-select
    >`,
        b `<scl-text-field
      label="sAddr"
      .value=${sAddr}
      nullable
      pattern="${patterns.normalizedString}"
    ></scl-text-field>`,
        b `<scl-select
      label="valKind"
      .selectOptions=${valKindEnum}
      .value=${valKind}
      nullable
      required
    ></scl-select>`,
        b `<scl-checkbox
      label="valImport"
      .value=${valImport}
      nullable
      required
    ></scl-checkbox>`,
        b `<scl-select
      label="Val"
      .selectOptions=${Array.from(data.querySelectorAll(`:root > DataTypeTemplates > EnumType > EnumVal[id="${type}"]`)).map(enumVal => enumVal.textContent?.trim() ?? '')}
      .value=${Val}
      nullable
      style="display: ${bType === 'Enum' ? '' : 'none'}"
    ></scl-select>`,
        b `<scl-text-field
      label="Val"
      .value=${Val}
      nullable
      style="display: ${bType === 'Enum' || bType === 'Struct' ? 'none' : ''}"
    ></scl-text-field>`,
    ];
}
function getValAction(oldVal, Val, abstractda) {
    if (oldVal === null) {
        const element = createElement(abstractda.ownerDocument, 'Val', {});
        element.textContent = Val;
        return [
            {
                parent: abstractda,
                node: element,
                reference: getReference(abstractda, 'Val'),
            },
        ];
    }
    if (Val === null) {
        return [{ node: oldVal }];
    }
    const newVal = oldVal.cloneNode(false);
    newVal.textContent = Val;
    return [
        {
            parent: oldVal.parentElement,
            node: newVal,
            reference: getReference(oldVal.parentElement, 'Val'),
        },
        { node: oldVal },
    ];
}

export { getValAction, renderAbstractDataAttributeContent };
//# sourceMappingURL=abstractda.js.map
