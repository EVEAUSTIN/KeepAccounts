# Windows 桌面版（测试版）

本项目根据仓库的网页构建。首次打开时可复制 `%APPDATA%\keepaccountsapp\Local Storage` 到独立的新目录。请先退出旧应用并备份整个旧数据目录。导入基于 Electron 文件来源的本地存储，尚未在实际 Windows 旧账本上验证；必须检查旧记录是否完整，再决定使用。请保留旧应用和备份。

GitHub Actions 的 Build Windows app 工作流可手动运行并下载生成的安装包 artifact。安装包未签名。不要使用它覆盖旧应用。

应用中的“检查更新”使用本仓库的 GitHub Releases。仅上传代码或构建 artifact 不会发布更新；需要单独发布含 electron-builder 生成的安装程序及 latest.yml 的正式 Release，且提升 package.json 版本号。自动更新尚未端到端验证。不要将私人账本数据上传到仓库。
