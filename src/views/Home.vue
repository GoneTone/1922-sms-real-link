<template>
  <div class="container mb-5" v-if="!generate_status">
    <h1 class="mt-5">生成</h1>

    <div class="alert alert-info" role="alert">
      本工具可以讓店家/場所自訂簡訊可修改的部分，並且會生成頁面網址和兩個 QR Code，兩個 QR Code 分別是 "頁面 QR Code" 和 "簡訊 QR Code"，本工具開源至 <a href="https://github.com/GoneTone/1922-sms-real-link" target="_blank">GitHub</a>，歡迎貢獻。
      <br><br>請填寫下方必要資訊。
    </div>

    <div class="alert alert-warning" role="alert">
      如果還沒有場所代碼，請至「<a href="https://emask.taiwan.gov.tw/real/" target="_blank">簡訊實聯制 場所 QR Code 登記作業</a>」系統申請。
    </div>

    <form class="row g-3 needs-validation" novalidate>
      <div class="col-md-4">
        <label for="code" class="form-label">您的場所名稱</label>
        <input type="text" class="form-control" id="place" placeholder="請輸入您的場所名稱" v-model="data.place" required>
        <div class="invalid-feedback">
          請輸入您的場所名稱。
        </div>
      </div>

      <div class="col-md-4">
        <label for="code" class="form-label">您的場所代碼</label>
        <input type="text" class="form-control" id="code" placeholder="請輸入您的場所代碼" pattern="(((\d{4})(\s)){3})(\d{3})|(\d{15})" aria-describedby="codeHelp" v-model="data.code" required>
        <div id="codeHelp" class="form-text">格式為 0000 0000 0000 000，或者刪除空白 000000000000000。</div>
        <div class="invalid-feedback">
          請輸入正確的場所代碼格式 (格式為 0000 0000 0000 000，或者刪除空白 000000000000000)。
        </div>
      </div>

      <div class="col-md-4">
        <label for="branchNumber" class="form-label">分店識別號碼 <span class="text-danger">(可不填)</span></label>
        <input type="number" class="form-control" id="branchNumber" placeholder="請輸入您的分店識別號碼 (可不填)" v-model="data.branch_number">
      </div>

      <div class="col-12">
        <label for="smsMsg" class="form-label">簡訊內文 <span class="text-danger">(可不填)</span></label>
        <input type="text" class="form-control" id="smsMsg" maxlength="30" aria-describedby="smsMsgHelp" v-model="data.sms_msg">
        <div id="smsMsgHelp" class="form-text">限制最多 30 個字。</div>
      </div>

      <div class="col-12">
        <button type="submit" class="btn btn-primary">生成</button>
      </div>
    </form>
  </div>

  <div class="container mb-5" v-else>
    <h1 class="mt-5">生成</h1>

    <div class="alert alert-success" role="alert">
      生成成功！ (<a href="javascript:" @click="this.$router.go(0)">重新生成</a>)
    </div>

    <div class="alert alert-info" role="alert">
      您的簡訊實聯制頁面網址為：
      <div class="row mt-3">
        <div class="col">
          <input class="form-control" type="text" id="smsRealLinkPageUrl" v-model="url" readonly>
        </div>
        <div class="col-auto">
          <button type="button" class="btn btn-outline-primary copy" data-clipboard-target="#smsRealLinkPageUrl">{{ copyButtonText }}</button>
        </div>
      </div>
    </div>

    <div class="row row-cols-1 row-cols-md-3 g-4">
      <div class="col">
        <div class="card h-100">
          <img :src="qrcodeUrl.page" class="card-img-top" alt="簡訊實聯制 - 頁面 QR Code">
          <div class="card-body">
            <h5 class="card-title">頁面 QR Code</h5>
            <p class="card-text"><span class="text-danger">此方法可以解決有些 QR Code 掃描器不支援簡訊 QR Code 的問題，並且可以填寫同行人數</span>，掃描後會開啟網頁，訪客/顧客可以在頁面上填寫同行人數，按下發送簡訊按鈕時會開啟簡訊應用程式並自動填入 1922 簡訊格式訊息。</p>
          </div>
          <div class="card-footer d-grid">
            <button type="button" class="btn btn-outline-primary" @click="downloadPageQrcode">下載</button>
          </div>
        </div>
      </div>

      <div class="col">
        <div class="card h-100">
          <img :src="qrcodeUrl.sms" class="card-img-top" alt="簡訊實聯制 - 簡訊 QR Code">
          <div class="card-body">
            <h5 class="card-title">簡訊 QR Code</h5>
            <p class="card-text">掃描後會直接開啟簡訊應用程式並自動填入 1922 簡訊格式訊息，但無法直接設定同行人數，除非了解簡訊格式 (<a href="https://g0v.hackmd.io/@au/HkmyoS-Fu#%E5%AF%A6%E4%BD%9C%E4%BE%8B" target="_blank">參考</a>)。</p>
          </div>
          <div class="card-footer d-grid">
            <button type="button" class="btn btn-outline-primary" @click="downloadSmsQrcode">下載</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import QRCode from 'qrcode'
import ClipboardJS from 'clipboard'
import { saveAs } from 'file-saver'

export default {
  name: 'Home',
  data () {
    return {
      data: {
        place: '',
        code: '',
        branch_number: '',
        sms_msg: '本簡訊是簡訊實聯制發送，限防疫目的使用。'
      },
      url: '',
      sms: '',
      qrcodeUrl: {
        page: '',
        sms: ''
      },
      copyButtonText: '複製',
      generate_status: false
    }
  },
  mounted () {
    const _this = this

    const clipboard = new ClipboardJS('.copy')
    clipboard.on('success', function () {
      _this.copyButtonText = '已複製'
    })

    ;(function () {
      'use strict'

      const forms = document.querySelectorAll('.needs-validation')

      Array.prototype.slice.call(forms).forEach(function (form) {
        form.addEventListener('submit', function (event) {
          event.preventDefault()
          event.stopPropagation()

          if (form.checkValidity()) {
            _this.generate()
            _this.generate_status = true
          }

          form.classList.add('was-validated')
        }, false)
      })
    })()
  },
  methods: {
    generate () {
      // noinspection JSCheckFunctionSignatures
      scrollTo({
        top: 0,
        behavior: 'instant'
      })

      const urlAppend = new URL(`${(process.env.NODE_ENV === 'production') ? 'https' : 'http'}://${(process.env.NODE_ENV === 'production') ? process.env.VUE_APP_HOST : `${window.location.hostname}:${window.location.port}`}${process.env.BASE_URL}sendsms/${this.data.code.toString()}`)
      let msg = `場所代碼：${this.data.code.toString()}`

      urlAppend.searchParams.append('place', this.data.place.toString())
      if (this.data.branch_number !== '') {
        urlAppend.searchParams.append('branch_number', this.data.branch_number.toString())
        msg += ` ${this.data.branch_number.toString()}`
      }
      if (this.data.sms_msg !== '') {
        urlAppend.searchParams.append('sms_msg', this.data.sms_msg.toString())
        msg += `\n${this.data.sms_msg.toString()}`
      }

      this.url = urlAppend.href
      this.sms = `smsto:1922:${msg}`

      QRCode.toDataURL(this.url, {
        errorCorrectionLevel: 'Q'
      }).then(url => {
        this.qrcodeUrl.page = url
      })

      QRCode.toDataURL(this.sms, {
        errorCorrectionLevel: 'Q'
      }).then(url => {
        this.qrcodeUrl.sms = url
      })
    },
    downloadPageQrcode () {
      saveAs(this.qrcodeUrl.page, 'page-qrcode.png')
    },
    downloadSmsQrcode () {
      saveAs(this.qrcodeUrl.sms, 'sms-qrcode.png')
    }
  }
}
</script>
