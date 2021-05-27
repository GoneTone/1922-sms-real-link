<template>
  <div class="container mb-5">
    <h1 class="mt-5">生成</h1>

    <div class="alert alert-info" role="alert">
      本工具可以讓店家/場所自訂簡訊可修改的部分，並且會生成頁面網址、各種海報樣式和兩個 QR Code 版本 (分別是 "頁面 QR Code" 和 "簡訊 QR Code")，本工具開源至 <a href="https://github.com/GoneTone/1922-sms-real-link" target="_blank">GitHub</a>，歡迎貢獻。
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
        <input type="text" class="form-control" id="code" placeholder="請輸入您的場所代碼" pattern="(((\d{4})(\s)){3})(\d{3})" aria-describedby="codeHelp" v-model="data.code" required>
        <div id="codeHelp" class="form-text">格式為 0000 0000 0000 000。</div>
        <div class="invalid-feedback">
          請輸入完整的場所代碼。
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
        <button type="submit" class="btn btn-primary">{{ generate.status ? '重新生成' : '生成' }}</button>
      </div>
    </form>

    <div class="card mt-3" v-if="generate.status">
      <div class="card-body">
        <div class="alert alert-success" role="alert">
          {{ generate.msg }}
          <div class="row mt-3">
            <div class="col">
              <input class="form-control" type="text" id="smsRealLinkPageUrl" v-model="url" readonly>
            </div>
            <div class="col-auto">
              <button type="button" class="btn btn-outline-primary copy" data-clipboard-target="#smsRealLinkPageUrl">{{ copyButtonText }}</button>
            </div>
          </div>
        </div>

        <ul class="nav nav-tabs" id="myTab" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" id="page-tab" data-bs-toggle="tab" data-bs-target="#page" type="button" role="tab" aria-controls="page" aria-selected="true">頁面 QR Code</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="sms-tab" data-bs-toggle="tab" data-bs-target="#sms" type="button" role="tab" aria-controls="sms" aria-selected="false">簡訊 QR Code</button>
          </li>
        </ul>
        <div class="tab-content" id="myTabContent">
          <div class="tab-pane fade show active" id="page" role="tabpanel" aria-labelledby="page-tab">
            <div class="alert alert-info mt-2" role="alert">
              <span class="text-danger">此方法可以解決有些 QR Code 掃描器不支援簡訊 QR Code 的問題，並且可以填寫同行人數</span>，掃描後會開啟網頁，訪客/顧客可以在頁面上填寫同行人數，按下發送簡訊按鈕時會開啟簡訊應用程式並自動填入 1922 簡訊格式訊息。
              <br><br>如果您想提供海報樣式，歡迎 <a href="https://m.me/GoneToneDY/" target="_blank">聯絡我</a> 或者至 <a href="https://github.com/GoneTone/1922-sms-real-link/issues" target="_blank">GitHub 提交 Issue</a>！
            </div>

            <div class="row row-cols-1 row-cols-md-3 g-4">
              <div class="col">
                <div class="card h-100">
                  <img :src="qrcode_url.page" class="card-img-top" alt="簡訊實聯制 - 頁面 QR Code">
                  <div class="card-body">
                    <h5 class="card-title">QR Code</h5>
                    <p class="card-text">頁面 QR Code。</p>
                  </div>
                  <div class="card-footer d-grid">
                    <button type="button" class="btn btn-outline-primary" @click="downloadImage(qrcode_url.page)">下載</button>
                  </div>
                </div>
              </div>
              <div class="col" v-for="[index, poster] of posters.data.entries()" :key="index">
                <div class="card h-100">
                  <img :src="poster.image_url.page" class="card-img-top" :alt="`簡訊實聯制 - 頁面 QR Code 海報 | 作者：${poster.author_name}`">
                  <div class="card-body">
                    <h5 class="card-title">作者：{{ poster.author_name }}</h5>
                    <p class="card-text" v-html="poster.desc"></p>
                  </div>
                  <div class="card-footer d-grid">
                    <button type="button" class="btn btn-outline-primary" @click="downloadImage(poster.image_url.page)">下載</button>
                  </div>
                </div>
              </div>
              <div class="col" v-for="n in posters.count" :key="n">
                <div class="card h-100">
                  <svg class="card-img-top" width="100%" height="512" xmlns="http://www.w3.org/2000/svg" role="img" focusable="false"><title>Placeholder</title><rect width="100%" height="100%" fill="#868e96"></rect></svg>
                  <div class="card-body">
                    <div class="text-placeholder placeholder w-75"></div>
                    <div class="text-placeholder placeholder w-50"></div>
                    <div class="text-placeholder placeholder w-75"></div>
                    <div class="text-placeholder placeholder w-100"></div>
                    <div class="text-placeholder placeholder w-100"></div>
                  </div>
                  <div class="card-footer d-grid">
                    <button type="button" class="btn btn-outline-primary" disabled>
                      <span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
                      海報生成中...
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="tab-pane fade" id="sms" role="tabpanel" aria-labelledby="sms-tab">
            <div class="alert alert-info mt-2" role="alert">
              掃描後會直接開啟簡訊應用程式並自動填入 1922 簡訊格式訊息，但無法直接設定同行人數，除非了解簡訊格式 (<a href="https://g0v.hackmd.io/@au/HkmyoS-Fu#%E5%AF%A6%E4%BD%9C%E4%BE%8B" target="_blank">參考</a>)。
              <br><br>如果您想提供海報樣式，歡迎 <a href="https://m.me/GoneToneDY/" target="_blank">聯絡我</a> 或者至 <a href="https://github.com/GoneTone/1922-sms-real-link/issues" target="_blank">GitHub 提交 Issue</a>！
            </div>

            <div class="row row-cols-1 row-cols-md-3 g-4">
              <div class="col">
                <div class="card h-100">
                  <img :src="qrcode_url.sms" class="card-img-top" alt="簡訊實聯制 - 簡訊 QR Code">
                  <div class="card-body">
                    <h5 class="card-title">QR Code</h5>
                    <p class="card-text">簡訊 QR Code。</p>
                  </div>
                  <div class="card-footer d-grid">
                    <button type="button" class="btn btn-outline-primary" @click="downloadImage(qrcode_url.sms)">下載</button>
                  </div>
                </div>
              </div>
              <div class="col" v-for="[index, poster] of posters.data.entries()" :key="index">
                <div class="card h-100">
                  <img :src="poster.image_url.sms" class="card-img-top" :alt="`簡訊實聯制 - 簡訊 QR Code 海報 | 作者：${poster.author_name}`">
                  <div class="card-body">
                    <h5 class="card-title">作者：{{ poster.author_name }}</h5>
                    <p class="card-text" v-html="poster.desc"></p>
                  </div>
                  <div class="card-footer d-grid">
                    <button type="button" class="btn btn-outline-primary" @click="downloadImage(poster.image_url.sms)">下載</button>
                  </div>
                </div>
              </div>
              <div class="col" v-for="n in posters.count" :key="n">
                <div class="card h-100">
                  <svg class="card-img-top" width="100%" height="512" xmlns="http://www.w3.org/2000/svg" role="img" focusable="false"><title>Placeholder</title><rect width="100%" height="100%" fill="#868e96"></rect></svg>
                  <div class="card-body">
                    <div class="text-placeholder placeholder w-75"></div>
                    <div class="text-placeholder placeholder w-50"></div>
                    <div class="text-placeholder placeholder w-75"></div>
                    <div class="text-placeholder placeholder w-100"></div>
                    <div class="text-placeholder placeholder w-100"></div>
                  </div>
                  <div class="card-footer d-grid">
                    <button type="button" class="btn btn-outline-primary" disabled>
                      <span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
                      海報生成中...
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-placeholder {
  height: 8px;
  margin-bottom: 5px;
}

.placeholder {
  display: inline-block;
  background-color: #b0c0c7;
  animation-name: shine;
  animation-duration: 2.4s;
  animation-iteration-count: infinite;
}

@keyframes shine {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.35;
  }
  100% {
    opacity: 1;
  }
}
</style>

<script>
import Inputmask from 'inputmask'
import QRCode from 'qrcode'
import { createCanvas, loadImage } from 'canvas'
import ClipboardJS from 'clipboard'
import Autolinker from 'autolinker'
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
      qrcode_url: {
        page: '',
        sms: ''
      },
      copyButtonText: '複製',
      generate: {
        status: false,
        msg: ''
      },
      posters: {
        count: 0,
        data: []
      }
    }
  },
  mounted () {
    const _this = this

    Inputmask({
      mask: '9999 9999 9999 999',
      isComplete: function (buffer) {
        _this.data.code = buffer.join('')
      }
    }).mask(document.getElementById('code'))

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
            _this.generateData()
            _this.generate.status = true
            _this.generate.msg = `您的簡訊實聯制 (場所代碼 ${_this.data.code.toString()}) 頁面網址為：`
          }

          form.classList.add('was-validated')
        }, false)
      })
    })()
  },
  methods: {
    generateData () {
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
        errorCorrectionLevel: 'Q',
        width: 512
      }).then(url => {
        this.qrcode_url.page = url
      })

      QRCode.toDataURL(this.sms, {
        errorCorrectionLevel: 'Q',
        width: 512
      }).then(url => {
        this.qrcode_url.sms = url
      })

      this.generatePosters()
    },
    async generatePosters () {
      this.posters.data = []
      const posters = require('@/assets/images/poster_templates/data.json')
      this.posters.count = posters.length
      for (const poster of posters) {
        /* 背景圖 */
        // noinspection JSUnresolvedVariable
        const posterTemplates = await loadImage(require(`@/assets/images/poster_templates/${poster.author_name}/${poster.image_filename}`))

        /* 頁面 QR Code */
        const qrCodePageCanvas = createCanvas(posterTemplates.width, posterTemplates.height)
        const qrCodePageCtx = qrCodePageCanvas.getContext('2d')
        qrCodePageCtx.drawImage(posterTemplates, 0, 0)
        // noinspection JSUnresolvedVariable
        if (typeof poster.display.qrcode !== 'undefined') {
          const qrCodePage = await loadImage(this.qrcode_url.page)
          // noinspection JSUnresolvedVariable
          qrCodePageCtx.drawImage(qrCodePage, poster.display.qrcode.x, poster.display.qrcode.y, poster.display.qrcode.w, poster.display.qrcode.h)
        }
        if (typeof poster.display.code !== 'undefined') {
          // noinspection JSUnresolvedVariable
          qrCodePageCtx.font = `${poster.display.code.font_size_arial_px}px Arial`
          qrCodePageCtx.fillText(this.data.code.toString(), poster.display.code.x, poster.display.code.y)
        }
        if (typeof poster.display.place !== 'undefined') {
          // noinspection JSUnresolvedVariable
          qrCodePageCtx.font = `${poster.display.place.font_size_arial_px}px Arial`
          qrCodePageCtx.fillText(this.data.place.toString(), poster.display.place.x, poster.display.place.y)
        }

        /* 簡訊 QR Code */
        const qrCodeSmsCanvas = createCanvas(posterTemplates.width, posterTemplates.height)
        const qrCodeSmsCtx = qrCodeSmsCanvas.getContext('2d')
        qrCodeSmsCtx.drawImage(posterTemplates, 0, 0)
        // noinspection JSUnresolvedVariable
        if (typeof poster.display.qrcode !== 'undefined') {
          const qrCodeSms = await loadImage(this.qrcode_url.sms)
          // noinspection JSUnresolvedVariable
          qrCodeSmsCtx.drawImage(qrCodeSms, poster.display.qrcode.x, poster.display.qrcode.y, poster.display.qrcode.w, poster.display.qrcode.h)
        }
        if (typeof poster.display.code !== 'undefined') {
          // noinspection JSUnresolvedVariable
          qrCodeSmsCtx.font = `${poster.display.code.font_size_arial_px}px Arial`
          qrCodeSmsCtx.fillText(this.data.code.toString(), poster.display.code.x, poster.display.code.y)
        }
        if (typeof poster.display.place !== 'undefined') {
          // noinspection JSUnresolvedVariable
          qrCodeSmsCtx.font = `${poster.display.place.font_size_arial_px}px Arial`
          qrCodeSmsCtx.fillText(this.data.place.toString(), poster.display.place.x, poster.display.place.y)
        }

        /* 新增 */
        this.posters.count--
        this.posters.data.push({
          author_name: poster.author_name,
          desc: Autolinker.link(poster.desc, { stripPrefix: false, stripTrailingSlash: false }),
          image_url: {
            page: qrCodePageCanvas.toDataURL(),
            sms: qrCodeSmsCanvas.toDataURL()
          }
        })
      }
    },
    downloadImage (url) {
      saveAs(url, '1922-sms-real-link.jpg')
    }
  }
}
</script>
