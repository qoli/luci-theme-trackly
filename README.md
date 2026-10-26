# Trackly for LuCI

一套面向 OpenWrt 的獨立 LuCI 主題：黑白畫布、圓潤標題、細線分區，以及適合管理後台的資訊密度。視覺依循 Trackly 網站的中性色系統，介面內容、權限、表單驗證與設定套用沿用 LuCI。

## 功能

- 跟隨系統的亮色／暗色外觀，完整使用白／黑背景。
- 桌面側欄與手機導覽抽屜，使用 LuCI 原有、經權限篩選的選單。
- 原生表單、表格、動態列表、分頁、提示與彈窗樣式。
- 可見鍵盤焦點、手機抽屜的 Escape／焦點管理與 reduced-motion 適配。
- 系統字體、本地靜態資源，不載入 CDN、網頁字體或額外輪詢。
- 安裝後由使用者選擇啟用；移除前需先切換到其他主題。

## 建置

需要 Python 3；語法檢查另外使用 Node.js。無需 Docker 或 OpenWrt SDK。

```sh
./scripts/check.sh
```

產物：`dist/luci-theme-trackly_0.1.0-1_all.ipk`。

也可只建置：

```sh
python3 scripts/build-ipk.py
```

打包使用固定時間戳、檔案排序與擁有者，相同來源會得到相同 IPK。`SOURCE_DATE_EPOCH` 可指定建置時間戳。

## 安裝與啟用

在使用 `opkg` 的 OpenWrt 後台進入「系统 → 软件包」，上傳 IPK 並安裝。或將安裝包傳入測試設備後執行：

```sh
opkg install /tmp/luci-theme-trackly_0.1.0-1_all.ipk
```

接著到「系统 → 系统 → 语言和界面」，選擇 **Trackly**，按「保存并应用」。重新載入後台。

解除安裝時，先在同一頁切換到其他已安裝主題，再執行：

```sh
opkg remove luci-theme-trackly
```

套件不會自行變更目前使用的主題；移除使用中的 Trackly 會明確報錯，讓使用者先選定替代主題。

## OpenWrt SDK

將 `openwrt/luci-theme-trackly` 放進 OpenWrt buildroot 的 `package/` 後，可從「LuCI → Themes」選擇主題。原始碼提供標準 LuCI Makefile；本專案直接輸出的安裝包格式為 IPK。

## 相容性與驗收

主題使用 ucode 模板與 LuCI 原生 JavaScript 元件。已在 iStoreOS 24.10.8（OpenWrt 24.10 系列）完成安裝、主題切換、登入、保存／套用及移除驗證，並通過 25 組桌面／手機／亮暗版面檢查。實際測試範圍與限制記錄於 [驗收紀錄](docs/acceptance.md)。

第三方插件若自行固定背景、字體或版面，仍可能保有其專屬外觀；主題不覆寫插件的功能程式。其他 OpenWrt／LuCI 版本需各自驗證，尚未驗收的版本不列為支援保證。

## 結構與設計

- `openwrt/luci-theme-trackly/`：LuCI 套件、模板、樣式與選單。
- `scripts/`：可重現 IPK 建置與語法檢查。
- `docs/design.md`：視覺來源、元件規則與產品邊界。

LuCI Bootstrap 的原始元件樣式保留於 `base.css`／`base-mobile.css`，Trackly 的外觀定義於 `cascade.css`。這讓原生元件維持完整行為，也方便後續跟進 LuCI。

Apache-2.0；來源與版權見 [NOTICE](NOTICE)。
