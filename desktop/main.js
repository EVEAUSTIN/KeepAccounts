'use strict';
const { app, BrowserWindow, dialog, Menu } = require('electron');
const { autoUpdater } = require('electron-updater');
const fs = require('fs');
const path = require('path');
const root = app.getPath('appData');
const profile = path.join(root, 'keepaccountsapp-v2');
app.setPath('userData', profile);
autoUpdater.autoDownload = false;
let win;
async function migrate() {
  const source = path.join(root, 'keepaccountsapp', 'Local Storage');
  const dest = path.join(profile, 'Local Storage');
  const marker = path.join(profile, 'migration-complete');
  if (fs.existsSync(marker) || fs.existsSync(dest) || !fs.existsSync(source)) return;
  const result = await dialog.showMessageBox({type:'question',buttons:['暂不导入','导入旧账本'],defaultId:1,cancelId:0,title:'导入旧账本',message:'检测到旧版账本数据',detail:'请先关闭旧版记账应用。新版会复制旧数据，不会删除旧目录。导入后请核对记录是否完整。'});
  if (result.response !== 1) return;
  const staging = path.join(profile, 'legacy-storage-copy');
  fs.mkdirSync(profile,{recursive:true});
  try {
    if (fs.existsSync(staging)) throw new Error('检测到之前未完成的导入，请保留文件并联系开发者。');
    fs.cpSync(source,staging,{recursive:true,errorOnExist:true,force:false});
    fs.renameSync(staging,dest);
    fs.writeFileSync(marker,'copied from keepaccountsapp/Local Storage\n',{flag:'wx'});
  } catch(e) { await dialog.showMessageBox({type:'error',message:'导入未完成，旧数据未删除。新版将退出。',detail:e.message}); app.quit(); throw e; }
}
async function checkUpdate(manual=false) {
  if (!app.isPackaged) { if(manual) dialog.showMessageBox({message:'打包安装后可检查更新。'}); return; }
  try { await autoUpdater.checkForUpdates(); }
  catch(e) { if(manual) dialog.showMessageBox({type:'error',message:'无法检查更新，请检查网络或稍后再试。',detail:e.message}); }
}
autoUpdater.on('error', () => {});
autoUpdater.on('update-available', async info => {
  const r=await dialog.showMessageBox({type:'info',buttons:['以后再说','下载更新'],defaultId:1,cancelId:0,message:`发现新版本 ${info.version}`,detail:'下载后可以选择安装。'});
  if(r.response===1) try { await autoUpdater.downloadUpdate(); } catch(e) { dialog.showMessageBox({type:'error',message:'更新下载失败。',detail:e.message}); }
});
autoUpdater.on('update-not-available',()=>{ if(global.manualCheck) dialog.showMessageBox({message:'当前已是最新版本。'}); global.manualCheck=false; });
autoUpdater.on('update-downloaded',async()=>{const r=await dialog.showMessageBox({buttons:['稍后安装','退出并安装'],defaultId:1,cancelId:0,message:'更新已下载，是否退出并安装？'});if(r.response===1)autoUpdater.quitAndInstall();});
if(!app.requestSingleInstanceLock()) app.quit(); else {
  app.whenReady().then(async()=>{
    try { await migrate(); } catch { return; }
    win=new BrowserWindow({width:1280,height:860,minWidth:800,minHeight:600,title:'记得记账',backgroundColor:'#f3f2ee',webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true}});
    Menu.setApplicationMenu(Menu.buildFromTemplate([{label:'应用',submenu:[{label:'检查更新',click:()=>{global.manualCheck=true;checkUpdate(true);}},{type:'separator'},{role:'quit',label:'退出'}]}]));
    await win.loadFile(path.join(__dirname,'index.html'));
    checkUpdate(false);
  });
  app.on('window-all-closed',()=>app.quit());
}
