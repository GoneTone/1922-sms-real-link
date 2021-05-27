# 1922 簡訊實聯制 - 生成工具
本工具可以讓店家/場所自訂簡訊可修改的部分，並且會生成頁面網址、各種海報樣式和兩個 QR Code 版本 (分別是 "頁面 QR Code" 和 "簡訊 QR Code")。

工具網址：[https://1922sms.reh.tw/](https://1922sms.reh.tw/)

### 頁面網址

可直接給無法掃描 QR Code 的訪客/顧客。

### 頁面 QR Code

此方法可以解決有些 QR Code 掃描器不支援簡訊 QR Code 的問題，並且可以填寫同行人數，掃描後會開啟網頁，訪客/顧客可以在頁面上填寫同行人數，按下發送簡訊按鈕時會開啟簡訊應用程式並自動填入 1922 簡訊格式訊息。

### 簡訊 QR Code

掃描後會直接開啟簡訊應用程式並自動填入 1922 簡訊格式訊息，但無法直接設定同行人數，除非了解簡訊格式 ([參考](https://g0v.hackmd.io/@au/HkmyoS-Fu#%E5%AF%A6%E4%BD%9C%E4%BE%8B)) 。

## 功能
- 可添加分店識別號碼
- 可自訂簡訊內文
- 發送簡訊頁面
- 生成自訂資料 QR Code
- 如果使用頁面 QR Code，可填寫同行人數
- 生成各種海報樣式 (如果您想提供海報樣式，歡迎 [聯絡我](https://m.me/GoneToneDY/) 或者 [提交 Issue](https://github.com/GoneTone/1922-sms-real-link/issues))

## Development

### Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
```

### Lints and fixes files

```
npm run lint
```
