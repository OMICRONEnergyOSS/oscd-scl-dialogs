import '../node_modules/@lit/reactive-element/reactive-element.js';
import { html as b } from '../node_modules/lit-html/lit-html.js';
import '../node_modules/lit-element/lit-element.js';
import { getReference } from '../node_modules/@openscd/scl-lib/dist/tBaseElement/getReference.js';
import { lnInstGenerator } from '../node_modules/@openscd/scl-lib/dist/generator/lnInstGenerator.js';
import '../node_modules/@openscd/scl-lib/dist/generator/macAddressGenerator.js';
import '../node_modules/@openscd/scl-lib/dist/generator/appIdGenerator.js';
import '../node_modules/@openscd/scl-lib/dist/tExtRef/extRefTypeRestrictions.js';
import '../node_modules/@openscd/scl-lib/dist/tDataTypeTemplates/nsdToJson.js';
import '../node_modules/@openscd/scl-lib/dist/tBaseElement/find.js';
import '../node_modules/@openscd/scl-lib/dist/tBaseElement/tags.js';
import { createElement } from '../foundation.js';

// global variables
const selectedIEDs = [];
let isLogicalNodeInstance = true;
let isIedListVisable = true;
function lNodeItems(doc) {
    return Array.from(doc.querySelectorAll(':root > DataTypeTemplates > LNodeType')).map(lNodeType => {
        const lnClass = lNodeType.getAttribute('lnClass');
        const id = lNodeType.getAttribute('id');
        return {
            headline: `${lnClass}`,
            supportingText: `#${id}`,
            attachedElement: lNodeType,
            selected: false,
            disabled: false,
        };
    });
}
function anyLnAttrs(anyLn) {
    const prefix = anyLn.getAttribute('prefix') ?? '';
    const lnClass = anyLn.getAttribute('lnClass') ?? '';
    const inst = anyLn.getAttribute('inst') ?? '';
    const lnType = anyLn.getAttribute('lnType') ?? '';
    const iedName = anyLn.closest('IED')?.getAttribute('name') ?? '';
    const ldInst = anyLn.closest('LDevice')?.getAttribute('inst') ?? '';
    return { prefix, lnClass, inst, iedName, ldInst, lnType };
}
function createSelectedItem(lNode) {
    const { iedName, ldInst, prefix, lnClass, inst } = anyLnAttrs(lNode.anyLn);
    return {
        headline: `${prefix}${lnClass}${inst}`,
        supportingText: `${iedName} | ${ldInst}`,
        attachedElement: lNode.anyLn,
        selected: lNode.existInScope,
        disabled: lNode.existOutOfScope || lNode.existInScope,
    };
}
function compare(a, b) {
    if (a.existInScope !== b.existInScope) {
        return a.existInScope ? -1 : 1;
    }
    if (a.existOutOfScope !== b.existOutOfScope) {
        return b.existOutOfScope ? -1 : 1;
    }
    return 0;
}
function lNodeCandidates(parent, anyLn) {
    const { iedName, ldInst, prefix, lnClass, inst } = anyLnAttrs(anyLn);
    // const title = `${prefix}${lnClass}${inst}`;
    const lNode = Array.from(parent.closest('Substation')?.querySelectorAll('LNode') ?? []).find(child => {
        if (child.tagName !== 'LNode') {
            return false;
        }
        return (child.getAttribute('iedName') === iedName &&
            child.getAttribute('ldInst') === ldInst &&
            (child.getAttribute('prefix') ?? '') === prefix &&
            child.getAttribute('lnClass') === lnClass &&
            (child.getAttribute('lnInst') ?? '') === inst);
    });
    const existInScope = !!lNode && lNode.parentElement === parent;
    const existOutOfScope = !!lNode && lNode.parentElement !== parent;
    return { anyLn, existInScope, existOutOfScope };
}
function anyLnItems(parent) {
    const ldSelector = ':scope > AccessPoint > Server > LDevice';
    return selectedIEDs.flatMap(ied => {
        const anyLns = ied.querySelectorAll(`${ldSelector} > LN0, ${ldSelector} > LN`);
        return Array.from(anyLns)
            .map(anyLn => lNodeCandidates(parent, anyLn))
            .sort(compare)
            .map(createSelectedItem);
    });
}
function lNodeList(target) {
    return target
        .closest('#createLNodeWizardContent')
        ?.querySelector('#lnList');
}
function iedContainer(target) {
    return target
        .closest('#createLNodeWizardContent')
        ?.querySelector('#iedContainer');
}
function showLogicalNodeTypes(evt, parent) {
    isLogicalNodeInstance = !isLogicalNodeInstance;
    const target = evt.target;
    if (isLogicalNodeInstance) {
        iedContainer(target).classList.remove('hidden');
    }
    else {
        iedContainer(target).classList.add('hidden');
    }
    const items = isLogicalNodeInstance
        ? anyLnItems(parent)
        : lNodeItems(parent.ownerDocument);
    lNodeList(target).items = []; // reset for better update performance
    lNodeList(target).items = items;
}
function addIED(evt, ied, sclParent) {
    const target = evt.target;
    if (selectedIEDs.includes(ied)) {
        const index = selectedIEDs.indexOf(ied);
        selectedIEDs.splice(index, 1);
        // Updated list items
        target.closest('md-list-item').activated = false;
    }
    else {
        selectedIEDs.push(ied);
        // Updated list items
        target.closest('md-list-item').activated = true;
    }
    lNodeList(target).items = [];
    lNodeList(target).items = anyLnItems(sclParent);
}
function renderIEDItems(parent) {
    const doc = parent.ownerDocument;
    return Array.from(doc.querySelectorAll(':root > IED')).map(ied => {
        const [iedName, manufacturer] = ['name', 'manufacturer'].map(value => ied.getAttribute(value));
        return b `<md-list-item
      .activated=${selectedIEDs.includes(ied)}
      type="button"
      @click="${(evt) => {
            addIED(evt, ied, parent);
        }}"
    >
      <div slot="headline">${iedName ?? 'unknown IED'}</div>
      <div slot="supporting-text">
        ${manufacturer ?? 'unknown manufacturer'}
      </div>
    </md-list-item>`;
    });
}
function showIEdFilterList(evt) {
    isIedListVisable = !isIedListVisable;
    const ieds = evt.target
        .closest('#createLNodeWizardContent')
        ?.querySelector('#iedList');
    if (!isIedListVisable) {
        ieds.classList.remove('hidden');
    }
    else {
        ieds.classList.add('hidden');
    }
}
function createAction(parent) {
    function createSingleLNode(lNode) {
        if (lNode.tagName === 'LNodeType') {
            const lnClass = lNode.getAttribute('lnClass');
            if (!lnClass) {
                return null;
            }
            const lnType = lNode.getAttribute('id');
            const lnInst = lnInstGenerator(parent, 'LNode')(lnClass);
            if (!lnInst) {
                return null;
            }
            const node = createElement(parent.ownerDocument, 'LNode', {
                iedName: 'None',
                lnClass,
                lnInst,
                lnType,
            });
            return {
                parent,
                node,
                reference: getReference(parent, 'LNode'),
            };
        }
        const { iedName, ldInst, prefix, lnClass, inst, lnType } = anyLnAttrs(lNode);
        const node = createElement(parent.ownerDocument, 'LNode', {
            iedName,
            ldInst,
            prefix,
            lnClass,
            lnInst: inst,
            lnType,
        });
        return {
            parent,
            node,
            reference: getReference(parent, 'LNode'),
        };
    }
    return (_, wizard) => {
        const list = wizard.querySelector('#lnList');
        const selectedLNs = list.items
            .filter(item => item.selected)
            .filter(item => !item.disabled)
            .map(item => item.attachedElement);
        return selectedLNs
            .map(lNode => createSingleLNode(lNode))
            .filter(insert => insert);
    };
}
function createLNodeWizard(parent) {
    // const iedNames = Array.from(parent.children)
    //   .filter(child => child.tagName === 'LNode' && child.getAttribute('iedName'))
    //   .map(lNode => lNode.getAttribute('iedName')!);
    return {
        title: 'Add LNode',
        primary: {
            icon: 'save',
            label: 'save',
            action: createAction(parent),
        },
        content: [
            b `<div id="createLNodeWizardContent" style="min-height: fit-content;">
        <style>
          .hidden {
            display: none;
          }
        </style>
        <div
          id="radioContainer"
          style="display: flex; align-items: center; gap: 16px;"
        >
          <label
            style="display: flex; align-items: center; cursor: pointer; font-size: 14px;"
          >
            <input
              type="radio"
              name="nodeType"
              value="type"
              style="margin-right: 8px; cursor: pointer;"
              @change="${(evt) => showLogicalNodeTypes(evt, parent)}"
              checked
            />
            Logical Node Type
          </label>
          <label
            style="display: flex; align-items: center; cursor: pointer; font-size: 14px;"
          >
            <input
              type="radio"
              name="nodeType"
              value="instance"
              style="margin-right: 8px; cursor: pointer;"
              @change="${(evt) => showLogicalNodeTypes(evt, parent)}"
            />
            Logical Node Instance
          </label>
        </div>
        <div style="display: flex; flex-direction: row;">
          <div id="iedContainer">
            s
            <div
              id="iedFilterButton"
              tabindex="0"
              style="cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 4px; border: 1px solid #ccc; border-radius: 4px; margin-top: 20px;"
              @click="${showIEdFilterList}"
              @keydown="${(evt) => {
                if (evt.key === 'Enter' || evt.key === ' ') {
                    evt.preventDefault();
                    showIEdFilterList(evt);
                }
            }}"
            >
              <md-icon>filter_list</md-icon>
            </div>
            <md-list id="iedList"> ${renderIEDItems(parent)} </md-list>
          </div>
          <selection-list
            id="lnList"
            multi
            .items=${anyLnItems(parent)}
            filterable
          ></selection-list>
        </div>
      </div>`,
        ],
    };
}

export { createLNodeWizard };
//# sourceMappingURL=lnode.js.map
