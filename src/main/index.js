import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import connectDB from './db';

async function getMembers() {
  console.log("getMembers")
  try {
    const response = await global.dbclient.query(`SELECT T1. *,
      CASE WHEN sum(T2.production_quantity) > 300000 THEN 15
      WHEN sum(T2.production_quantity) > 50000 THEN 10
      WHEN sum(T2.production_quantity) > 10000 THEN 5
      ELSE 0
      END as discount
      from partners as T1
      LEFT JOIN sales as T2 on T1.id = T2.member_id
      GROUP BY T1.id`)
      return response.rows
  } catch (e) {
    console.log(e)
  }
}
async function createMember(event, member) {
  const { ceo, age, post, organization, salary } = member

  try {
    await global.dbclient.query(`INSERT into members (ceo, age, post, organization, salary) values('${ceo}', '${age}', '${post}', '${organization}', '${salary}')`)
    dialog.showMessageBox({ message: 'Успех! Member создан' })
  } catch (e) {
    console.log(e)
    dialog.showErrorBox('Ошибка', "Member с таким именем уже есть")
  }
}
async function updateMember(event, member) {
  const { ceo, age, post, organization, salary } = member;

  try {
    await global.dbclient.query(`UPDATE members
      SET ceo='${ceo}', age='${age}', post='${post}', organization='${organization}', salary='${salary}'
      WHERE members.id = ${id};`)
    dialog.showMessageBox({ message: 'Успех! Данные обновлены' })
    return;
  } catch (e) {
    dialog.showErrorBox('Невозможно создать пользователя', 'Такой пользователь уже есть')
    return ('error')
  }
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    icon: join(__dirname, '../../resources/icon.ico'),
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

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.electron')

  global.dbclient = await connectDB();

  ipcMain.handle('getMembers', getMembers)
  ipcMain.handle('createMember', createMember)
  ipcMain.handle('updateMember', updateMember)

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