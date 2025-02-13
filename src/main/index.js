import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

async function foo(event, data) {
  try {
    return null;
  } catch (e) {
    console.log(e);
  }
}

async function addMember(event, member) {
  const { ceo, age, post, organization, salary } = member;
  try {
    await global.dbclient.query(`INSERT INTO members (ceo, age, post, organization, salary) VALUES ($1, $2, $3, $4, $5)`,
      [ceo, age, post, organization, salary]);
    dialog.showMessageBox({ message: 'Member was created' });
  } catch (e) {
    console.log(e);
    dialog.showErrorBox('Error', e);
  }
}

async function updateMember(event, member) {
  const { id, ceo, age, post, organization, salary } = member;
  try {
    await global.dbclient.query(`UPDATE members SET ceo = $1, age = $2, post = $3, organization = $4, salary = $5 WHERE id = $6`,
      [ceo, age, post, organization, salary, id]);
    dialog.showMessageBox({ message: 'Member was updated' });
  } catch (e) {
    dialog.showErrorBox('Error', e);
    return e;
  }
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  ipcMain.handle('sendSignal', foo)

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
