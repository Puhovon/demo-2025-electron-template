import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  getMembers: () => ipcRenderer.invoke('getMembers'),
  addMember: (member) => ipcRenderer.invoke('addMember', member),
  updateMember: (member) => ipcRenderer.invoke('updateMember', member),
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
