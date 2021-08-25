<template>
  <div style="padding: 20px;">
    <el-form ref="form" label-position="left">
      <el-form-item
        v-for="(v, k) in data"
        :key="k"
      >
        <template v-slot:label>
          <div>{{ v.name }}</div>
          <div style="font-weight: normal;">{{ v.reg }}</div>
          <div style="font-weight: normal;">{{ v.remark }}</div>
        </template>
        <el-row>
          <el-col
            :sm="18"
          ><el-input
            v-model="v.value"
            clearable
            :disabled="v.disabled"
            @input="validate(v)"
          /></el-col>
          <el-col :sm="4" class="center">
            <el-button :disabled="v.disabled" @click="validate(v)">校验</el-button>
          </el-col>
          <el-col :sm="2" class="center">
            <i
              v-show="v.result === true"
              class="el-icon-success"
              style="color: #67C23A; font-size: 18px;"
            />
            <i
              v-show="v.result === false"
              class="el-icon-error"
              style="color: #F56C6C; font-size: 18px;"
            />
          </el-col>
        </el-row>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'CommonRegularExpression',
  data() {
    return {
      data: {
        email: {
          name: '邮箱',
          reg: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
          value: '',
          result: ''
        },
        mobilePhone: {
          name: '手机号码',
          reg: /^1[3-9]\d{9}$/,
          value: '',
          result: ''
        },
        phone: {
          name: '电话号码（包括手机和固话，固话格式 020-82196666）',
          reg: /^1[3-9]\d{9}$|^0\d{2,3}-\d{7,8}$|^0\d{2,3}-\d{7,8}-\d{3,5}$/,
          value: '',
          result: ''
        },
        password: {
          name: '密码（数字、英文、特殊字符、8 至 30 位）',
          // ^ 正则用来取反，要转义
          // - 要转义
          // [ 要转义
          // ] 要转义
          // \ 要转义
          reg: /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[`·~!！@#$￥%\^…&*(（)）_—\-+={}\[【\]】|\\、<《>》,，.。/?？]).{8,30}$/,
          value: '',
          result: ''
        },
        password2: {
          name: '密码2（密码长度是6-12位，由数字、小写字母和大写字母组成，但必须至少包括2种字符）',
          reg: /(((?=.*\d)((?=.*[a-z])|(?=.*[A-Z])))|(?=.*[a-z])(?=.*[A-Z]))^[a-zA-Z\d]{6,12}$/,
          value: '',
          result: ''
        },
        chinese: {
          name: '中文（输入内容全是中文）',
          remark: 'https://www.qqxiuzi.cn/zh/hanzi-unicode-bianma.php',
          reg: /^[\u4E00-\u9FA5]+$/,
          value: '',
          result: ''
        },
        identity: {
          name: '身份证',
          remark: '使用 idcard 库，链接：https://www.npmjs.com/package/idcard',
          reg: '',
          value: '',
          result: '',
          disabled: true
        },
        bankAccount: {
          name: '银行卡账号',
          remark: '微信支付 https://pay.weixin.qq.com/wiki/doc/api/xiaowei.php?chapter=22_1 验证是 8 至 30 位的数字即可',
          reg: /^[1-9]\d{7,29}$/,
          value: '',
          result: ''
        }
      }
    }
  },
  methods: {
    validate(item) {
      const result = item.reg.test(item.value)
      item.result = result
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-form-item__label {
  float: none;
  line-height: normal;
  div + div {
    margin-top: 6px;
  }
}
.el-col.center {
  text-align: center;
}
@media screen and (max-width: 768px) {
  .el-col + .el-col {
    margin-top: 10px;
  }
}
</style>
