// src/preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Expor APIs seguras para o renderer
contextBridge.exposeInMainWorld('electronAPI', {
    // Informações da plataforma
    platform: process.platform,
    appVersion: '2.0.0',
    
    // Sistema de arquivos (limitado)
    showItemInFolder: (path) => {
        ipcRenderer.invoke('show-item-in-folder', path);
    },
    
    // Dialogos
    showOpenDialog: (options) => {
        return ipcRenderer.invoke('show-open-dialog', options);
    },
    
    showSaveDialog: (options) => {
        return ipcRenderer.invoke('show-save-dialog', options);
    },
    
    // Notificações
    showNotification: (title, body) => {
        ipcRenderer.send('show-notification', { title, body });
    },
    
    // Controle de janela
    minimizeWindow: () => ipcRenderer.send('minimize-window'),
    maximizeWindow: () => ipcRenderer.send('maximize-window'),
    closeWindow: () => ipcRenderer.send('close-window'),
    
    // Estado da janela
    isWindowMaximized: () => ipcRenderer.invoke('is-window-maximized'),
    
    // Sistema
    getSystemInfo: () => {
        return {
            platform: process.platform,
            arch: process.arch,
            version: process.getSystemVersion(),
            memory: process.getSystemMemoryInfo(),
            cpu: process.getCPUUsage()
        };
    },
    
    // Aplicação
    relaunch: () => ipcRenderer.send('relaunch-app'),
    
    // Versão
    versions: {
        node: process.versions.node,
        chrome: process.versions.chrome,
        electron: process.versions.electron
    }
});

// Log para debug
console.log('🔧 Preload carregado - Ambiente:', process.env.NODE_ENV || 'production');