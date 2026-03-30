import '../node_modules/@lit/reactive-element/reactive-element.js';
import { html as b } from '../node_modules/lit-html/lit-html.js';
import '../node_modules/lit-element/lit-element.js';
import { getValue } from '../foundation.js';

function fcdaLabel(fcda) {
    const parts = [];
    const ldInst = fcda.getAttribute('ldInst');
    if (ldInst)
        parts.push(ldInst);
    const prefix = fcda.getAttribute('prefix') ?? '';
    const lnClass = fcda.getAttribute('lnClass') ?? '';
    const lnInst = fcda.getAttribute('lnInst') ?? '';
    if (lnClass)
        parts.push(`${prefix}${lnClass}${lnInst}`);
    const doName = fcda.getAttribute('doName');
    if (doName)
        parts.push(doName);
    const daName = fcda.getAttribute('daName');
    if (daName)
        parts.push(daName);
    const fc = fcda.getAttribute('fc');
    if (fc)
        parts.push(`[${fc}]`);
    return parts.join('.');
}
function render(options) {
    return [
        b `<scl-text-field
      label="name"
      .value=${options.name}
      disabled
      dialogInitialFocus
    ></scl-text-field>`,
        b `<scl-text-field
      label="desc"
      .value=${options.desc}
      nullable
    ></scl-text-field>`,
        b `<selection-list
      id="fcda-list"
      .items=${options.fcdas.map(fcda => ({
            headline: fcdaLabel(fcda),
            attachedElement: fcda,
            selected: true,
        }))}
    ></selection-list>`,
    ];
}
function updateAction(element) {
    return (inputs, wizard) => {
        const name = getValue(inputs.find(i => i.label === 'name'));
        const desc = getValue(inputs.find(i => i.label === 'desc'));
        const edits = [];
        // Collect FCDA removals from the selection list
        const list = wizard.querySelector('#fcda-list');
        if (list) {
            const selectedFcdas = new Set(list.selectedElements);
            const allFcdas = Array.from(element.querySelectorAll('FCDA'));
            for (const fcda of allFcdas) {
                if (!selectedFcdas.has(fcda)) {
                    edits.push({ node: fcda });
                }
            }
        }
        // Collect attribute changes
        if (name !== element.getAttribute('name') ||
            desc !== element.getAttribute('desc')) {
            edits.push({ element, attributes: { name, desc } });
        }
        return edits;
    };
}
function editDataSetWizard(element) {
    return {
        title: 'Edit DataSet',
        primary: {
            icon: 'edit',
            label: 'save',
            action: updateAction(element),
        },
        content: render({
            name: element.getAttribute('name') ?? '',
            desc: element.getAttribute('desc'),
            fcdas: Array.from(element.querySelectorAll('FCDA')),
        }),
    };
}

export { editDataSetWizard };
//# sourceMappingURL=dataset.js.map
