<template>
  <div class="container mb-5">
    <h1 class="mt-5">發送簡訊</h1>

    <div class="alert alert-info" role="alert">
      本工具開源至 <a href="https://github.com/GoneTone/1922-sms-real-link" target="_blank">GitHub</a>，歡迎貢獻。
    </div>

    <div class="alert alert-warning" role="alert">
      請確認下方資訊正確在按下發送按鈕，如果不正確請勿發送。
      <br>簡訊發送至 1922，費用由電信商全額負擔，完全免費，請安心使用。
    </div>

    <form class="row g-3 needs-validation" novalidate>
      <div class="col-md-4">
        <label for="code" class="form-label">場所名稱</label>
        <input type="text" class="form-control" id="place" :value="$route.query.place" readonly>
      </div>

      <div class="col-md-4">
        <label for="code" class="form-label">場所代碼</label>
        <input type="text" class="form-control" id="code" :value="$route.params.code" readonly>
      </div>

      <div class="col-md-4">
        <label for="branchNumber" class="form-label">分店識別號碼</label>
        <input type="number" class="form-control" id="branchNumber" :value="$route.query.branch_number" readonly>
      </div>

      <div class="col-12">
        <label for="peopleCount" class="form-label">同行人數</label>
        <input type="number" class="form-control" id="peopleCount" min="1" v-model="data.people_count" required>
        <div class="invalid-feedback">
          請輸入同行人數。
        </div>
      </div>

      <div class="col-12">
        <button type="submit" class="btn btn-primary" :disabled="error.status">發送簡訊</button>
        <div class="alert alert-danger mt-3" role="alert" v-if="error.status">
          {{ error.msg }}
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import platform from 'platform'

export default {
  name: 'SendSms',
  data () {
    return {
      data: {
        people_count: 1
      },
      error: {
        status: false,
        msg: ''
      }
    }
  },
  mounted () {
    const _this = this

  ;(function () {
      'use strict'

      const forms = document.querySelectorAll('.needs-validation')

      Array.prototype.slice.call(forms).forEach(function (form) {
        form.addEventListener('submit', function (event) {
          event.preventDefault()
          event.stopPropagation()

          if (form.checkValidity()) {
            let body = `場所代碼：${_this.$route.params.code}`
            if (typeof _this.$route.query.branch_number !== 'undefined') {
              body += ` ${_this.$route.query.branch_number}`
            }
            if (_this.data.people_count !== 1) {
              body += ` ${encodeURIComponent(encodeURIComponent('+'))}${_this.data.people_count}`
            }
            if (typeof _this.$route.query.sms_msg !== 'undefined') {
              body += `${encodeURIComponent(encodeURIComponent('\n'))}${_this.$route.query.sms_msg}`
            }

            // noinspection JSUnresolvedVariable
            const os = platform.os.toString()
            if (os.match(/Android/i)) {
              location.href = `sms:1922?body=${body}`
            } else if (os.match(/iOS/i)) {
              location.href = `sms:1922&body=${body}`
            } else {
              _this.error.status = true
              _this.error.msg = '您的系統無法發送簡訊，請使用 Android 或 iOS 系統。'
            }
          }

          form.classList.add('was-validated')
        }, false)
      })
    })()
  }
}
</script>
