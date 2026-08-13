const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

const developmentUrl = process.env.ELECTRON_DEV_URL;
const smokeTest = process.argv.includes('--smoke-test');

function createWindow() {
  const window = new BrowserWindow({
    width: 1240,
    height: 820,
    minWidth: 900,
    minHeight: 640,
    backgroundColor: '#09090b',
    title: 'JSON DevTools Local',
    show: !smokeTest,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });

  if (developmentUrl) {
    window.loadURL(developmentUrl);
  } else {
    window.loadFile(path.join(__dirname, '..', 'dist', 'json-devtools-local', 'browser', 'index.html'));
  }

  window.once('ready-to-show', () => {
    if (!smokeTest) window.show();
  });

  if (smokeTest) runSmokeTest(window);
}

function runSmokeTest(window) {
  window.webContents.once('did-finish-load', async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const result = await window.webContents.executeJavaScript(`(async () => {
        const pause = () => new Promise((resolve) => setTimeout(resolve, 60));
        const setValue = (selector, value) => {
          const element = document.querySelector(selector);
          const prototype = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
          Object.getOwnPropertyDescriptor(prototype, 'value').set.call(element, value);
          element.dispatchEvent(new Event('input', { bubbles: true }));
        };
        const click = (selector) => {
          const root = document.querySelector(selector);
          const button = root.matches('button') ? root : root.querySelector('button');
          button.click();
        };

        const angular = Boolean(document.querySelector('app-root .app-shell'));
        setValue('#json-input', '{"nome":"DevKit","itens":[1,2]}');
        await pause();
        click('#format-json');
        await pause();
        const formatted = document.querySelector('#json-output').value.includes('  "nome": "DevKit"');

        const navigation = document.querySelectorAll('.nav-item');
        navigation[1].click();
        await pause();
        const uuid = /^[0-9a-f-]{36}$/m.test(document.querySelector('#uuid-output').value);

        navigation[2].click();
        await pause();
        setValue('#base64-input', 'Olá, mundo!');
        await pause();
        click('#encode-base64');
        await pause();
        const encoded = document.querySelector('#base64-output').value === 'T2zDoSwgbXVuZG8h';
        setValue('#base64-input', 'T2zDoSwgbXVuZG8h');
        await pause();
        click('#decode-base64');
        await pause();
        const decoded = document.querySelector('#base64-output').value === 'Olá, mundo!';

        navigation[3].click();
        await pause();
        setValue('#hash-input', 'abc');
        await pause();
        const md5 = document.querySelector('#hash-output').value === '900150983cd24fb0d6963f7d28e17f72';

        return { angular, formatted, uuid, encoded, decoded, md5 };
      })()`);
      const passed = Object.values(result).every(Boolean);
      console.log(`SMOKE_TEST ${passed ? 'PASS' : 'FAIL'} ${JSON.stringify(result)}`);
      app.exit(passed ? 0 : 1);
    } catch (error) {
      console.error('SMOKE_TEST ERROR', error);
      app.exit(1);
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
