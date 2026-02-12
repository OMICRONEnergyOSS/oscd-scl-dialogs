import '../node_modules/@lit/reactive-element/reactive-element.js';
import { html as b } from '../node_modules/lit-html/lit-html.js';
import '../node_modules/lit-element/lit-element.js';
import { getReference } from '../node_modules/@openscd/scl-lib/dist/tBaseElement/getReference.js';
import '../node_modules/@openscd/scl-lib/dist/generator/lnInstGenerator.js';
import { macAddressGenerator } from '../node_modules/@openscd/scl-lib/dist/generator/macAddressGenerator.js';
import { appIdGenerator } from '../node_modules/@openscd/scl-lib/dist/generator/appIdGenerator.js';
import '../node_modules/@openscd/scl-lib/dist/tExtRef/extRefTypeRestrictions.js';
import '../node_modules/@openscd/scl-lib/dist/tDataTypeTemplates/nsdToJson.js';
import '../node_modules/@openscd/scl-lib/dist/tBaseElement/find.js';
import '../node_modules/@openscd/scl-lib/dist/tBaseElement/tags.js';
import { identity } from '../node_modules/@openscd/scl-lib/dist/tBaseElement/identity.js';
import { compareNames, getTypes, createElement, getValue } from '../foundation.js';
import { contentAddress, updateAddress } from './address.js';

function initSMVElements(doc, connectedAp, options) {
    const actions = [];
    const ied = doc.querySelector(`IED[name="${connectedAp.getAttribute('iedName')}"]`);
    Array.from(ied?.querySelectorAll('SampledValueControl') ?? [])
        .filter(sampledValueControl => {
        const id = identity(sampledValueControl);
        if (options.unconnectedSampledValueControl.has(id)) {
            options.unconnectedSampledValueControl.delete(id);
            return true;
        }
        return false;
    })
        .forEach(sampledValueControl => {
        const cbName = sampledValueControl.getAttribute('name');
        const ldInst = sampledValueControl.closest('LDevice')?.getAttribute('inst') ?? null;
        const sMV = createElement(connectedAp.ownerDocument, 'SMV', {
            cbName,
            ldInst,
        });
        actions.push({
            parent: connectedAp,
            node: sMV,
            reference: getReference(connectedAp, 'SMV'),
        });
        const address = createElement(connectedAp.ownerDocument, 'Address', {});
        actions.push({
            parent: sMV,
            node: address,
            reference: getReference(sMV, 'Address'),
        });
        const pMac = createElement(connectedAp.ownerDocument, 'P', {
            type: 'MAC-Address',
        });
        pMac.textContent = options.macGeneratorSmv();
        actions.push({
            parent: address,
            node: pMac,
            reference: getReference(address, 'P'),
        });
        const pAppId = createElement(connectedAp.ownerDocument, 'P', {
            type: 'APPID',
        });
        pAppId.textContent = options.appidGeneratorSmv();
        actions.push({
            parent: address,
            node: pAppId,
            reference: getReference(address, 'P'),
        });
        const pVlanId = createElement(connectedAp.ownerDocument, 'P', {
            type: 'VLAN-ID',
        });
        pVlanId.textContent = '000';
        actions.push({
            parent: address,
            node: pVlanId,
            reference: getReference(address, 'P'),
        });
        const pVlanPrio = createElement(connectedAp.ownerDocument, 'P', {
            type: 'VLAN-PRIORITY',
        });
        pVlanPrio.textContent = '4';
        actions.push({
            parent: address,
            node: pVlanPrio,
            reference: getReference(address, 'P'),
        });
    });
    return actions;
}
function initGSeElements(doc, connectedAp, options) {
    const actions = [];
    const ied = doc.querySelector(`IED[name="${connectedAp.getAttribute('iedName')}"]`);
    Array.from(ied?.querySelectorAll('GSEControl') ?? [])
        .filter(gseControl => {
        const id = identity(gseControl);
        if (options.unconnectedGseControl.has(id)) {
            options.unconnectedGseControl.delete(id);
            return true;
        }
        return false;
    })
        .forEach(gseControl => {
        const cbName = gseControl.getAttribute('name');
        const ldInst = gseControl.closest('LDevice')?.getAttribute('inst') ?? null;
        const gSE = createElement(connectedAp.ownerDocument, 'GSE', {
            cbName,
            ldInst,
        });
        actions.push({
            parent: connectedAp,
            node: gSE,
            reference: getReference(connectedAp, 'GSE'),
        });
        const address = createElement(connectedAp.ownerDocument, 'Address', {});
        actions.push({
            parent: gSE,
            node: address,
            reference: getReference(gSE, 'Address'),
        });
        const pMac = createElement(connectedAp.ownerDocument, 'P', {
            type: 'MAC-Address',
        });
        pMac.textContent = options.macGeneratorGse();
        actions.push({
            parent: address,
            node: pMac,
            reference: getReference(address, 'P'),
        });
        const pAppId = createElement(connectedAp.ownerDocument, 'P', {
            type: 'APPID',
        });
        pAppId.textContent = options.appidGeneratorGse();
        actions.push({
            parent: address,
            node: pAppId,
            reference: getReference(address, 'P'),
        });
        const pVlanId = createElement(connectedAp.ownerDocument, 'P', {
            type: 'VLAN-ID',
        });
        pVlanId.textContent = '000';
        actions.push({
            parent: address,
            node: pVlanId,
            reference: getReference(address, 'P'),
        });
        const pVlanPrio = createElement(connectedAp.ownerDocument, 'P', {
            type: 'VLAN-PRIORITY',
        });
        pVlanPrio.textContent = '4';
        actions.push({
            parent: address,
            node: pVlanPrio,
            reference: getReference(address, 'P'),
        });
        const minTime = createElement(connectedAp.ownerDocument, 'MinTime', {
            unit: 's',
            multiplier: 'm',
        });
        minTime.textContent = '10';
        actions.push({
            parent: gSE,
            node: minTime,
            reference: getReference(gSE, 'MinTime'),
        });
        const maxTime = createElement(connectedAp.ownerDocument, 'MaxTime', {
            unit: 's',
            multiplier: 'm',
        });
        maxTime.textContent = '10000';
        actions.push({
            parent: gSE,
            node: maxTime,
            reference: getReference(gSE, 'MaxTime'),
        });
    });
    return actions;
}
function unconnectedGseControls(doc) {
    const allGseControl = Array.from(doc.querySelectorAll('GSEControl'));
    const unconnectedGseControl = allGseControl
        .filter(gseControl => {
        const iedName = gseControl.closest('IED')?.getAttribute('name');
        const ldInst = gseControl.closest('LDevice')?.getAttribute('inst');
        const cbName = gseControl.getAttribute('name');
        return !doc.querySelector(`ConnectedAP[iedName="${iedName}"] ` +
            `> GSE[ldInst="${ldInst}"][cbName="${cbName}"]`);
    })
        .map(gseControl => identity(gseControl));
    const mySet = new Set(unconnectedGseControl);
    return mySet;
}
function unconnectedSampledValueControls(doc) {
    const allSmvControl = Array.from(doc.querySelectorAll('SampledValueControl'));
    const unconnectedSmvControl = allSmvControl
        .filter(gseControl => {
        const iedName = gseControl.closest('IED')?.getAttribute('name');
        const ldInst = gseControl.closest('LDevice')?.getAttribute('inst');
        const cbName = gseControl.getAttribute('name');
        return !doc.querySelector(`ConnectedAP[iedName="${iedName}"] ` +
            `> SMV[ldInst="${ldInst}"][cbName="${cbName}"]`);
    })
        .map(gseControl => identity(gseControl));
    const mySet = new Set(unconnectedSmvControl);
    return mySet;
}
function createConnectedApAction(parent) {
    return (_, wizard) => {
        const doc = parent.ownerDocument;
        // generators ensure unique MAC-Address and APPID across the project
        const macGeneratorSmv = macAddressGenerator(doc, 'SMV');
        const appidGeneratorSmv = appIdGenerator(doc, 'SMV');
        const macGeneratorGse = macAddressGenerator(doc, 'GSE');
        const appidGeneratorGse = appIdGenerator(doc, 'GSE');
        // track GSE and SMV for multiselect access points connection
        const unconnectedGseControl = unconnectedGseControls(doc);
        const unconnectedSampledValueControl = unconnectedSampledValueControls(doc);
        const list = wizard.querySelector('#apList');
        if (!list) {
            return [];
        }
        const actions = list.selectedElements.map(accP => {
            const id = `${identity(accP)}`;
            const [iedName, apName] = id.split('>');
            const connAPactions = [];
            const connectedAp = createElement(parent.ownerDocument, 'ConnectedAP', {
                iedName,
                apName,
            });
            connAPactions.push({
                parent,
                node: connectedAp,
                reference: getReference(parent, 'ConnectedAP'),
            });
            connAPactions.push(...initSMVElements(doc, connectedAp, {
                macGeneratorSmv,
                appidGeneratorSmv,
                unconnectedSampledValueControl,
            }));
            connAPactions.push(...initGSeElements(doc, connectedAp, {
                macGeneratorGse,
                appidGeneratorGse,
                unconnectedGseControl,
            }));
            return connAPactions;
        });
        return actions;
    };
}
/** Sorts connected `AccessPoint`s to the bottom. */
function compareAccessPointConnection(a, b) {
    if (a.connected !== b.connected) {
        return b.connected ? -1 : 1;
    }
    return 0;
}
function existConnectedAp(accessPoint) {
    const iedName = accessPoint.closest('IED')?.getAttribute('name');
    const apName = accessPoint.getAttribute('name');
    const connAp = accessPoint.ownerDocument.querySelector(`ConnectedAP[iedName="${iedName}"][apName="${apName}"]`);
    return !!connAp;
}
/** @returns single page  [[`Wizard`]] for creating SCL element ConnectedAP. */
function createConnectedApWizard(element) {
    const doc = element.ownerDocument;
    const accessPoints = Array.from(doc.querySelectorAll(':root > IED'))
        .sort(compareNames)
        .flatMap(ied => Array.from(ied.querySelectorAll(':root > IED > AccessPoint')))
        .map(accesspoint => ({
        element: accesspoint,
        connected: existConnectedAp(accesspoint),
    }))
        .sort(compareAccessPointConnection);
    const items = accessPoints.map(appP => ({
        headline: `${identity(appP.element)}`,
        supportingText: appP.connected ? 'AccessPoint already connected!' : '',
        selected: !appP.connected,
        disabled: appP.connected,
        attachedElement: appP.element,
    }));
    return {
        title: 'Add ConnectedAP',
        primary: {
            icon: 'save',
            label: 'save',
            action: createConnectedApAction(element),
        },
        content: [
            b `<selection-list
        id="apList"
        multi
        .items=${items}
        filterable
      ></selection-list>`,
        ],
    };
}
function updateAction(element) {
    return (inputs, wizard) => {
        const instType = wizard.querySelector('#instType').value === 'true';
        const addressContent = {};
        inputs.forEach(input => {
            const key = input.label;
            const value = getValue(input);
            addressContent[key] = value;
        });
        return updateAddress(element, addressContent, instType);
    };
}
/** @returns single page [[`Wizard`]] to edit SCL element ConnectedAP. */
function editConnectedApWizard(element) {
    return {
        title: 'Edit ConnectedAP',
        primary: {
            icon: 'save',
            label: 'save',
            action: updateAction(element),
        },
        content: [...contentAddress({ element, types: getTypes(element) })],
    };
}

export { createConnectedApWizard, editConnectedApWizard };
//# sourceMappingURL=connectedap.js.map
