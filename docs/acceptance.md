# iStoreOS 驗收紀錄

2026-10-26（Asia/Shanghai），`luci-theme-trackly 0.1.0-1` 完成下列主題驗收。

## 候選與環境

- IPK SHA-256：`bab4d6b237ef5a52eb74f89966a8802efe40f1dd31486b1e8553ddf58f1601ed`。
- iStoreOS `24.10.8 / 2026073111`，x86/64，QEMU TCG，2 CPU／2 GiB。
- `luci-base 26.209.18626~2e45965`；對照主題為 `luci-theme-bootstrap 26.103.28985~08ac473`。
- Arc CDP，Chrome `150.0.7871.187`；真實 LuCI／rpcd／opkg，沒有以靜態 mockup 替代後台。
- 從已停止的既有測試 VM 轉換出獨立 qcow2 磁碟；只在複本中安裝、切換與移除套件。測試複本的 LAN 調整為啟動器轉發目標 `192.168.101.1`。
- 使用專屬 localhost 名稱隔離其他本機 LuCI 測試的 Cookie；此環境為本機測試 VM，沒有提供公開線上 demo。

## 最終版面矩陣：25／25 通過

| 頁面 | 1440×1000 亮色 | 1440×1000 暗色 | 390×844 亮色 | 390×844 暗色 | 320×740 暗色 |
| --- | --- | --- | --- | --- | --- |
| 系統設定 | PASS | PASS | PASS | PASS | PASS |
| 狀態總覽 | PASS | PASS | PASS | PASS | PASS |
| 網路介面 | PASS | PASS | PASS | PASS | PASS |
| 防火牆 | PASS | PASS | PASS | PASS | PASS |
| 軟體包 | PASS | PASS | PASS | PASS | PASS |

每個情境均等待真實內容與選單載入，再讀取 DOM、樣式、畫面寬度與 JavaScript 例外。最終 25 個情境的文件寬度均與指定視窗寬度一致，沒有可見元素超出右界；亮色畫布為 `rgb(255,255,255)`、暗色為 `rgb(0,0,0)`，正向流程沒有 JavaScript 例外。

已人工查看桌面與手機截圖，核對中性色、字體層級、細線分區、表單、按鈕、表格與換行。公開的代表畫面見[桌面亮色](images/desktop-light.png)與[手機暗色](images/mobile-dark.png)。完整 DOM 結果及截圖保存在本機 `.runtime/evidence/final-matrix.json` 與同目錄的 `final-*.png`。

## 實際操作

| 操作 | 結果與證據 |
| --- | --- |
| IPK 安裝 | 真實 `opkg install` 成功，模板、CSS、選單與授權文件存在；安裝只註冊 Trackly，保留當前選用的 Argon／Bootstrap。 |
| 從後台啟用 | 在「系统 → 系统 → 语言和界面」選 Trackly 並保存套用；重新開頁載入 `/luci-static/trackly/`，SSH 讀回 `luci.main.mediaurlbase` 一致。 |
| 解除安裝 | 使用中移除會明確拒絕（opkg 回傳 255，保留檔案）；先選 Bootstrap 後移除成功，資產與主題註冊均清除；重新安裝仍保留 Bootstrap。 |
| 登入 | 原生 POST 登入成功；錯誤密碼顯示原生錯誤提示；桌面／手機亮暗外觀均已檢查。 |
| 保存／套用 | 從 UI 將設備描述改為測試文字；重新開頁與 SSH UCI 讀回一致，之後透過 UI 恢復原空白描述。 |
| 表單驗證 | 無效主機名被拒絕，紅色欄位與可讀錯誤彈窗存在；SSH 證實主機名仍為 `iStoreOS`。修正後可正常保存。 |
| 網路編輯彈窗 | 320px 可開啟、捲動與關閉 LAN 編輯彈窗；取消後 LAN 位址仍為 `192.168.101.1`，沒有待提交的 network 變更。 |
| 手機導覽 | 抽屜可開啟、點遮罩關閉；Shift+Tab 在抽屜內循環，Escape 關閉並將焦點還給按鈕；關閉側欄設為 inert，焦點外框可見。 |
| 軟體包篩選 | 在「已安装」篩選 `luci-theme-trackly`，顯示正確套件與版本 `0.1.0-1`。 |
| iStore 頁面 | 已登入的 iStore Vue 頁面載入，側欄選中狀態正確；從已安裝頁切換到手動安裝頁，出現原生上傳區，沒有水平溢出。未執行商店軟體安裝。 |
| 上層高亮色 | 暫時提供 `--accent`，值維持原樣，選中線跟隨該值，畫布保持黑白；移除測試值後恢復中性。 |
| 減少動態 | `prefers-reduced-motion: reduce` 下，狀態頁進度條的 transition duration 全部為 `0s`。 |
| 建置與交付一致 | `scripts/check.sh` 通過；重複建置 SHA 相同，VM 內 IPK、CSS、選單 JavaScript 與交付來源的 SHA 相符。 |

最終 CSS SHA：`ac7098c18b2d28062ca53352f9d71a6e44481988f2b975ba2e711dbc00701640`。

最終選單 JavaScript SHA：`b60e363881d232d4b83de4c4f8f392828d127d192fb1d4d4f1025defcfc69e44`。

## 測試中修正的問題

- 首次 IPK 缺少 tar 目錄項目，opkg 無法寫入新目錄。已補齊目錄並完成實際安裝／移除回驗。
- 原生「保存并应用」下拉按鈕被一般輸入元件背景覆蓋。已區分按鈕與輸入下拉樣式。
- 介面操作按鈕被擠成直排、320px 的動態 action 欄最小寬度造成溢出。已保留短標籤並讓操作群組換行。
- 手機進度條文字與 320px 工具列溢出。已讓真實進度說明和控制群組自然換行。
- 手機遮罩受到通用按鈕樣式影響。已使用專屬選擇器，確認矩形半透明遮罩與關閉行為。
- 保留錯誤欄位的語意色，改善暗色核取方塊辨識度，移除原生控制項的藍色焦點光暈。

## 環境問題、既有問題與限制

- 最初共用 `127.0.0.1` 入口時，瀏覽器的 LuCI Cookie 不屬於本 VM，而本 VM 的 session 仍有效。改用 `trackly.localhost` 後完成最終 25／25 矩陣；沒有修改主題的認證或 session 行為。
- 部分硬重新載入曾因 `luci.js` 的 `ERR_CONNECTION_RESET`／`ERR_SOCKET_NOT_CONNECTED` 失敗。當次不列為通過；同檔案經 HTTP 與瀏覽器 fetch 均為 200，之後正常重載及完整矩陣通過。沒有新增產品自動重試或替代載入邏輯。
- 在 LAN 的 IPv4 欄位填入非法地址時，韌體 `protocol/static.js` 的 `calculateBroadcast` 會拋出讀取 null 的例外；已在官方 Bootstrap 主題交叉重現。主題未修改協定驗證程式。
- 未登入直接開啟 iStore 路徑時，曾出現原生 `uci/get Access denied`；Bootstrap 亦可重現。正常系統登入頁及已登入 iStore 頁面可用。
- 韌體也會請求缺失的可選 protocol 模組而收到 404；未以主題補造這些協定模組。
- `0.1.0-1` 只查看 localClash 的介面外殼與選單，沒有驗收內嵌表格；後續確認其表格問題包含主題的 CSS 優先級衝突，修正與回驗見下節。未驗證 localClash 的啟動、接管或更新業務。
- 未在實體路由器安裝，未驗證其他 OpenWrt／LuCI 版本、APK、SDK 編譯、Firefox 或 Safari。手機結果來自 Chrome 裝置模擬。

## 0.1.1-3：表格相容性修正與回驗

2026-10-26，在使用者指定的 `http://127.0.0.1:18090` iStoreOS VM 安裝 `luci-theme-trackly 0.1.1-3`，保留 Trackly 為預設主題。此次結果不代表將上方初版的 25 組檢查全部重跑。

- IPK SHA-256：`45a3889a61d36d4eadf67009e3307795d61d3a458d2f2a9101f98d99d5112515`。
- 韌體與 LuCI 版本同上；內建瀏覽器驗證真實頁面，localClash LuCI `0.1.0-86`、Core `v0.1.104`。
- 原因：主題的 `body.trackly-theme` 提高了區塊、儲存格及按鈕規則的優先級，覆蓋插件的手機排列、內距與間距；繼承的 15% 操作欄寬也讓桌面按鈕換行。
- 修正：通用區塊與表格以 `:where()` 降低範圍選擇器的優先級，操作欄採自然寬度。手機的直接操作按鈕分行，保留原生 action wrapper 的換行群組。
- Bootstrap 手機基底改用 760px 視窗條件，與主題的媒體查詢一致，讓窄桌面視窗與手機使用同一組原生表格規則。
- 獨立打包器的資源版本加入 `PKG_RELEASE`，套件修訂也會更新 CSS／JS URL，避免載入舊樣式。

| 頁面 | 實際檢查尺寸與外觀 | 結果 |
| --- | --- | --- |
| localClash 概覽 | 1440×1000、641×899、390×844 的亮／暗色，以及 320×740 暗色 | 7／7 PASS |
| 原生網路介面 | 1440×1000 亮色、641×899 暗色、390×844 亮色、320×740 暗色 | 4／4 PASS |
| 原生防火牆 | 1440×1000 亮色、641×899 暗色、390×844 亮色、320×740 暗色 | 4／4 PASS |

所有情境均保存實際截圖與 DOM 尺寸，確認頁面寬度不超過視窗，操作按鈕沒有重疊、裁切或超出頁面。概覽的手機儲存格保留插件的緊湊排列與 18px 區塊內距；320px 的狀態文字可正常橫排。由摘要表格開啟「查看最近任务」彈窗，641px 下寬度為 585px 並可正常關閉；原生網路介面編輯彈窗在 320px 下寬度為 296px，也可開啟並關閉，全程未儲存網路變更。

語法與打包檢查通過，已核對 IPK 內 CSS 與來源一致。正常套件升級保留目前主題；對啟用中套件執行強制重裝仍被既有移除保護阻止，沒有強制移除。測試期間初次登入曾出現原生 `uci/get Access denied` 與重載時的 XHR 中斷；有效登入後的原生頁面回查沒有新的 console error／warning。

本節結果來自 `18090` 測試 VM；後續實機升級結果見下節。原始截圖與矩陣保留於本機 Codex visualization 目錄，沒有將測試 VM、登入資料或原始診斷資料加入 Git。

## v0.1.1：實體路由器升級回驗

2026-10-26，將 FriendlyElec NanoPi R5C 上的 `luci-theme-trackly 0.1.0-1` 升級為 `0.1.1-3`，並選用 Trackly 作為預設主題。安裝包與上節驗收候選相同，對應公開版本為 [v0.1.1](https://github.com/qoli/luci-theme-trackly/releases/tag/v0.1.1)。

- OpenWrt `24.10.0-rc5 r28304-6dacba30a7`，`luci-base 25.001.48925~f5c1806`，localClash LuCI `0.1.0-86`。
- 正常 `opkg install` 升級成功，SSH 讀回版本為 `0.1.1-3`，預設為 `/luci-static/trackly`，LuCI 沒有未提交設定。
- 原生網路介面頁正常載入；主題三個 CSS 及選單 JavaScript 均回應 HTTP 200，頁面載入 67 個導覽連結。
- localClash 概覽完成 1548px 桌面暗色、641px 暗色、390px 亮色與 320px 暗色回查，頁面均無水平溢出，操作按鈕無裁切或超出頁面。
- 瀏覽器確認資源 URL 已更新為 `?v=0.1.1-3`；路由器 CSS 雜湊與已驗收來源一致。兩個已載入頁面沒有新的 console error／warning。
- 測試結束後移除尺寸與外觀覆蓋，保留實際概覽頁。設定備份、畫面及安裝回條留在忽略的本機 `.runtime/`，未加入公開專案。
