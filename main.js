// src/main.js - VERSÃO PARA PRODUÇÃO
const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const url = require('url');

// Configurações de produção
const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');
const isWindows = process.platform === 'win32';

let mainWindow;

function createWindow() {
    // Configurações da janela
    const windowOptions = {
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        show: false,
        backgroundColor: '#0f172a',
        icon: path.join(__dirname, 'src/assets/icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'src/preload.js'),
            webSecurity: !isDev,
            devTools: isDev,
            enableRemoteModule: false,
            spellcheck: false
        },
        frame: true,
        titleBarStyle: 'default',
        autoHideMenuBar: true,
        useContentSize: true,
        center: true,
        movable: true,
        resizable: true,
        maximizable: true,
        fullscreenable: true,
        hasShadow: true,
        thickFrame: true,
        enableLargerThanScreen: false
    };

    // Criar janela
    mainWindow = new BrowserWindow(windowOptions);

    // Desabilitar zoom
    mainWindow.webContents.setZoomFactor(1.0);
    mainWindow.webContents.setVisualZoomLevelLimits(1, 1);
    mainWindow.webContents.on('zoom-changed', (event, zoomDirection) => {
        event.preventDefault();
    });

    // Carregar aplicação
    const startUrl = isDev
        ? 'http://localhost:3000'
        : url.format({
              pathname: path.join(__dirname, 'renderer/pages/index.html'),
              protocol: 'file:',
              slashes: true
          });

    mainWindow.loadURL(startUrl).catch(err => {
        console.error('Erro ao carregar URL:', err);
        // Fallback para file://
        mainWindow.loadFile(path.join(__dirname, 'renderer/pages/index.html'));
    });

    // Mostrar quando pronto
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        if (isDev) {
            mainWindow.webContents.openDevTools();
        }
    });

    // Eventos da janela
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Abrir links externos no navegador
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    // Prevenir navegação não autorizada
    mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        if (parsedUrl.protocol !== 'file:' && !parsedUrl.hostname.includes('localhost')) {
            event.preventDefault();
            shell.openExternal(navigationUrl);
        }
    });

    // Criar menu (opcional)
    createMenu();
}

// Criar menu da aplicação
function createMenu() {
    const template = [
        {
            label: 'Arquivo',
            submenu: [
                {
                    label: 'Sair',
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => app.quit()
                }
            ]
        },
        {
            label: 'Editar',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'selectAll' }
            ]
        },
        {
            label: 'Visualizar',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Ajuda',
            submenu: [
                {
                    label: 'Sobre',
                    click: () => {
                        shell.openExternal('https://github.com/rafaelgwg/fafanet-ip-tracker')
                    }
                }
            ]
        }
    ];

    if (isWindows) {
        template.unshift({
            label: app.name,
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        });
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// Eventos do aplicativo
app.whenReady().then(() => {
    console.log('🚀 Iniciando FAFANET IP Tracker v2.0.0');
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Manipuladores de erro
process.on('uncaughtException', (error) => {
    console.error('Erro não tratado:', error);
});

// Desabilitar hardware acceleration em sistemas antigos
if (process.platform === 'linux') {
    app.disableHardwareAcceleration();
}

// Configurações de linha de comando
app.commandLine.appendSwitch('disable-features', 'CrossOriginOpenerPolicy');
app.commandLine.appendSwitch('disable-pinch');
app.commandLine.appendSwitch('disable-accelerated-2d-canvas');