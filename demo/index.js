import '@webcomponents/scoped-custom-element-registry';
import '@omicronenergy/oscd-shell/oscd-shell.js';
import OscdEditorSource from '@omicronenergy/oscd-editor-source';
import DemoEditorPlugin from './demo-editor-plugin.js';

const originalDefine = customElements.define.bind(customElements);
customElements.define = (name, constructor) => {
  if (customElements.get(name)) {
    console.info(
      `Custom element ${name} is already defined, skipping definition.`,
    );
    return;
  }
  return originalDefine(name, constructor);
};

const plugins = {
  menu: [
    {
      name: 'Open File',
      translations: { de: 'Datei öffnen' },
      icon: 'folder_open',
      requireDoc: false,
      src: 'https://openscd.github.io/oscd-open/oscd-open.js',
    },
  ],
  editor: [
    {
      name: 'Trigger Wizard',
      translations: { de: 'Wizard Triggern' },
      icon: 'folder_open',
      requireDoc: true,
      tagName: 'demo-editor-plugin',
    },
    {
      name: 'Source Editor',
      translations: { de: 'Source Editor' },
      icon: 'code',
      requireDoc: true,
      tagName: 'oscd-editor-source',
    },
  ],
};

const oscdShell = document.querySelector('oscd-shell');
oscdShell.registry.define('demo-editor-plugin', DemoEditorPlugin);
oscdShell.registry.define('oscd-editor-source', OscdEditorSource);

const params = new URL(document.location).searchParams;
for (const [name, value] of params) {
  oscdShell.setAttribute(name, value);
}
oscdShell.plugins = plugins;

const filename = 'sample.scd';
const sample = await fetch(filename).then(r => r.text());
oscdShell.docs = {
  [filename]: new DOMParser().parseFromString(sample, 'application/xml'),
};
oscdShell.docName = filename;
