<template>
  <div class="license">
    <el-card>
      <div slot="header">
        <span>基础信息</span>
      </div>
      <div v-for="(value, key) in serverInfo" :key="key">
        <strong>{{ key }}</strong>
        :
        <span>{{ value }}</span>
      </div>
    </el-card>

    <el-card>
      <div slot="header">
        <span>生成证书</span>
      </div>

      <el-collapse v-model="activeNames">
        <el-collapse-item name="basic">
          <template v-slot:title>
            <i class="el-icon-s-order" style="margin-right: 6px;" /> 基本信息
          </template>
          <el-form
            ref="form"
            :model="form"
            :rules="rules"
            :validate-on-rule-change="false"
            inline
            label-width="120px"
            @submit.native.prevent
          >
            <el-row>
              <el-col>
                <el-form-item label="证书名称" prop="subject">
                  <el-input
                    v-model="form.subject"
                    clearable
                    placeholder="请输入证书名称"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="私钥别名" prop="privateAlias">
                  <el-input
                    v-model="form.privateAlias"
                    clearable
                    placeholder="请输入私钥别名"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="私钥密码" prop="keyPass">
                  <el-input
                    v-model="form.keyPass"
                    type="password"
                    auto-complete="new-password"
                    clearable
                    placeholder="请输入私钥密码"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="私钥库密码" prop="storePass">
                  <el-input
                    v-model="form.storePass"
                    type="password"
                    auto-complete="new-password"
                    clearable
                    placeholder="请输入私钥库密码"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="证书生成地址" prop="licensePath">
                  <el-input
                    v-model="form.licensePath"
                    clearable
                    placeholder="请输入证书生成地址"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="授权日期" prop="issuedTime">
                  <el-date-picker
                    v-model="form.issuedTime"
                    type="date"
                    value-format="yyyy-MM-dd"
                    placeholder="请选择授权日期"
                    :picker-options="issuedTimePickerOptions"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="失效日期" prop="expiryTime">
                  <el-date-picker
                    v-model="form.expiryTime"
                    type="date"
                    value-format="yyyy-MM-dd"
                    placeholder="请选择失效日期"
                    :picker-options="expiryTimePickerOptions"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="授权用户数量" prop="consumerAmount">
                  <el-input-number v-model="form.consumerAmount" :min="0" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col>
                <el-form-item label="证书描述信息" prop="description">
                  <el-input
                    v-model="form.description"
                    :rows="5"
                    type="textarea"
                    placeholder="请输入证书描述信息"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-collapse-item>
        <el-collapse-item name="extra">
          <template v-slot:title>
            <i class="el-icon-s-order" style="margin-right: 6px;" /> 额外验证信息
          </template>
          <div v-for="(value, key) in extraForm" :key="key">
            <strong>{{ key }}</strong>
            :
            <span>{{ value }}</span>
          </div>
          <el-form
            ref="extraForm"
            :model="extraForm"
            :rules="extraRules"
            :validate-on-rule-change="false"
            inline
            label-width="120px"
            @submit.native.prevent
          >
            <el-row>
              <el-col :span="12">
                <el-form-item
                  label="是否验证IP地址列表"
                  prop="ipCheck"
                  class="fix-label-line-height"
                >
                  <el-radio-group v-model="extraForm.ipCheck">
                    <el-radio :label="true">是</el-radio>
                    <el-radio :label="false">否</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col v-if="extraForm.ipCheck" :span="12">
                <el-form-item
                  label="可被允许的IP地址列表"
                  prop="ipAddress"
                  class="fix-label-line-height"
                >
                  <el-select
                    v-model="extraForm.ipAddress"
                    multiple
                    filterable
                    allow-create
                    default-first-option
                    placeholder="请输入可被允许的IP地址列表，回车键确认"
                    popper-class="hidden-popper"
                    :popper-append-to-body="false"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item
                  label="是否验证MAC地址列表"
                  prop="macCheck"
                  class="fix-label-line-height"
                >
                  <el-radio-group v-model="extraForm.macCheck">
                    <el-radio :label="true">是</el-radio>
                    <el-radio :label="false">否</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col v-if="extraForm.macCheck" :span="12">
                <el-form-item
                  label="可被允许的MAC地址列表"
                  prop="macAddress"
                  class="fix-label-line-height"
                >
                  <el-select
                    v-model="extraForm.macAddress"
                    multiple
                    filterable
                    allow-create
                    default-first-option
                    placeholder="请输入可被允许的MAC地址列表，回车键确认"
                    popper-class="hidden-popper"
                    :popper-append-to-body="false"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item
                  label="是否验证CPU序列号"
                  prop="isCpuCheck"
                  class="fix-label-line-height"
                >
                  <el-radio-group v-model="extraForm.isCpuCheck">
                    <el-radio :label="true">是</el-radio>
                    <el-radio :label="false">否</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col v-if="extraForm.isCpuCheck" :span="12">
                <el-form-item
                  label="可被允许的CPU序列号"
                  prop="cpuSerial"
                  class="fix-label-line-height"
                >
                  <el-input
                    v-model="extraForm.cpuSerial"
                    clearable
                    placeholder="请输入可被允许的CPU序列号"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item
                  label="是否验证主板号"
                  prop="isBoardCheck"
                >
                  <el-radio-group v-model="extraForm.isBoardCheck">
                    <el-radio :label="true">是</el-radio>
                    <el-radio :label="false">否</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col v-if="extraForm.isBoardCheck" :span="12">
                <el-form-item
                  label="可被允许的主板序列号"
                  prop="mainBoardSerial"
                  class="fix-label-line-height"
                >
                  <el-input
                    v-model="extraForm.mainBoardSerial"
                    clearable
                    placeholder="请输入可被允许的主板序列号"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item
                  label="是否验证注册人数"
                  prop="registerCheck"
                  class="fix-label-line-height"
                >
                  <el-radio-group v-model="extraForm.registerCheck">
                    <el-radio :label="true">是</el-radio>
                    <el-radio :label="false">否</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col v-if="extraForm.registerCheck" :span="12">
                <el-form-item
                  label="可被允许的最大注册人数限制"
                  prop="registerAmount"
                  class="fix-label-line-height"
                >
                  <el-input-number
                    v-model="extraForm.registerAmount"
                    :min="0"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-collapse-item>
      </el-collapse>

      <el-row>
        <el-col style="text-align: center; margin-top: 22px;">
          <el-button
            type="primary"
            @click="submitAndDownload"
          >生成并下载证书</el-button>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import moment from 'moment'
import { getLicenseServerInfos, postLicenseGenerate } from '@/api/license'

export default {
  name: 'License',
  data() {
    return {
      serverInfo: {},
      form: {
        subject: '', // 证书名称，非空
        privateAlias: '', // 私钥别名，非空
        keyPass: '', // 私钥密码，非空
        storePass: '', // 私钥库密码，非空
        licensePath: '', // 证书生成地址，非空
        issuedTime: '', // 授权日期，非空
        expiryTime: '', // 失效日期，非空
        consumerType: '1', // 授权用户类型（默认1），非空
        consumerAmount: 0, // 授权用户数量
        description: '', // 证书描述信息
        licUrl: '' // 许可证书的（服务器）下载地址
      },
      // 证书额外验证信息 licenseCheck
      extraForm: {
        ipCheck: true, // 是否验证IP地址列表
        ipAddress: [], // 可被允许的IP地址列表
        macCheck: true, // 是否验证MAC地址列表
        macAddress: [], // 可被允许的MAC地址列表
        isCpuCheck: true, // 是否验证CPU序列号
        cpuSerial: '', // 可被允许的CPU序列号
        isBoardCheck: true, // 是否验证主板号
        mainBoardSerial: '', // 可被允许的主板序列号
        registerCheck: true, // 是否验证注册人数
        registerAmount: 0 // 可被允许的最大注册人数限制
      },
      rules: {
        subject: [
          { required: true, message: '证书名称不能为空', trigger: 'blur' }
        ],
        privateAlias: [
          { required: true, message: '私钥别名不能为空', trigger: 'blur' }
        ],
        keyPass: [
          { required: true, message: '私钥密码不能为空', trigger: 'blur' }
        ],
        storePass: [
          { required: true, message: '私钥库密码不能为空', trigger: 'blur' }
        ],
        licensePath: [
          { required: true, message: '证书生成地址不能为空', trigger: 'blur' }
        ],
        issuedTime: [
          {
            required: true,
            message: '授权日期不能为空',
            trigger: ['blur', 'change']
          }
        ],
        expiryTime: [
          {
            required: true,
            message: '失效日期不能为空',
            trigger: ['blur', 'change']
          }
        ],
        consumerType: [
          { required: true, message: '授权用户类型不能为空', trigger: 'change' }
        ]
      },
      extraRules: {},
      activeNames: ['basic', 'extra'],
      issuedTimePickerOptions: {
        disabledDate: (time) => {
          const oneDayMs = 24 * 60 * 60 * 1000
          if (!this.form.expiryTime) {
            // 只能选当天以及当天之后
            return time.getTime() < moment().valueOf() - oneDayMs
          } else {
            // 当天以及当天之后
            // 并且不得晚于失效日期
            return time.getTime() < moment().valueOf() - oneDayMs || time.getTime() > moment(this.form.expiryTime).valueOf()
          }
        }
      },
      expiryTimePickerOptions: {
        disabledDate: (time) => {
          if (!this.form.issuedTime) {
            // 只能选当天以及当天之后
            const oneDayMs = 24 * 60 * 60 * 1000
            return time.getTime() < moment().valueOf() - oneDayMs
          } else {
            // 不得早于授权日期
            return time.getTime() < moment(this.form.issuedTime).valueOf()
          }
        }
      }
    }
  },
  watch: {
    'extraForm.ipCheck': {
      handler() {
        this.initExtraRules()
      }
    },
    'extraForm.macCheck': {
      handler() {
        this.initExtraRules()
      }
    },
    'extraForm.isCpuCheck': {
      handler() {
        this.initExtraRules()
      }
    },
    'extraForm.isBoardCheck': {
      handler() {
        this.initExtraRules()
      }
    },
    'extraForm.registerCheck': {
      handler() {
        this.initExtraRules()
      }
    }
  },
  mounted() {
    this.initExtraRules()
    this.initServerInfo()
  },
  methods: {
    initExtraRules() {
      const rules = {
        ipCheck: [
          {
            required: true,
            message: '请选择是否验证IP地址列表',
            trigger: 'change'
          }
        ],
        macCheck: [
          {
            required: true,
            message: '请选择是否验证MAC地址列表',
            trigger: 'change'
          }
        ],
        isCpuCheck: [
          {
            required: true,
            message: '请选择是否验证CPU序列号',
            trigger: 'change'
          }
        ],
        isBoardCheck: [
          {
            required: true,
            message: '请选择是否验证主板号',
            trigger: 'change'
          }
        ],
        registerCheck: [
          {
            required: true,
            message: '请选择是否验证注册人数',
            trigger: 'change'
          }
        ]
      }

      if (this.extraForm.ipCheck) {
        rules.ipAddress = [
          {
            required: true,
            message: '可被允许的IP地址列表不能为空',
            trigger: ['blur', 'change']
          }
        ]
      }

      if (this.extraForm.macCheck) {
        rules.macAddress = [
          {
            required: true,
            message: '可被允许的MAC地址列表不能为空',
            trigger: ['blur', 'change']
          }
        ]
      }

      if (this.extraForm.isCpuCheck) {
        rules.cpuSerial = [
          {
            required: true,
            message: '可被允许的CPU序列号不能为空',
            trigger: 'blur'
          }
        ]
      }

      if (this.extraForm.isBoardCheck) {
        rules.mainBoardSerial = [
          {
            required: true,
            message: '可被允许的主板序列号不能为空',
            trigger: 'blur'
          }
        ]
      }

      if (this.extraForm.registerCheck) {
        rules.registerAmount = [
          {
            required: true,
            message: '可被允许的最大注册人数限制不能为空',
            trigger: ['blur', 'change']
          }
        ]
      }

      this.extraRules = rules
    },
    initServerInfo() {
      // getLicenseServerInfos().then((res) => {
      //   const data = this.lodashGet(res, 'data', {})
      //   this.serverInfo = data
      // })
      setTimeout(() => {
        const data = {
          ipAddress: ['192.168.1.103'],
          macAddress: ['00-50-56-BD-54-BE'],
          cpuSerial: '564d90d1-baff-8747-80ef-1c32318df424',
          mainBoardSerial: 'Not',
          registerAmount: null,
          registerCheck: false,
          cpuCheck: false,
          boardCheck: false,
          ipCheck: false,
          macCheck: false
        }
        this.serverInfo = data
      }, 500)
    },
    getParams() {
      const params = {
        ...this.form,
        licenseCheck: this.extraForm
      }
      return params
    },
    async validateForm() {
      let result = true
      try {
        await this.$refs.form.validate()
      } catch (e) {
        result = false
      }
      return result
    },
    async validateExtraForm() {
      let result = true
      try {
        await this.$refs.extraForm.validate()
      } catch (e) {
        result = false
      }
      return result
    },
    async submitAndDownload() {
      const valid = await this.validateForm()
      const extraValid = await this.validateExtraForm()
      if (valid && extraValid) {
        const params = this.getParams()
        console.log(params)
        this.$message({
          message: params,
          showClose: true,
          duration: 10000
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.license {
  padding: 20px;
}

.el-card + .el-card {
  margin-top: 20px;
}

::v-deep .el-collapse-item__header {
  padding-left: 20px;
  font-size: 14px;
  color: #606266;
}

.el-form {
  .el-form-item {
    width: 100%;
    ::v-deep .el-form-item__content {
      width: calc(100% - 120px);
      .el-date-editor {
        width: 100%;
      }
      .el-select {
        width: 100%;
        .el-input__suffix {
          display: none;
        }
      }
    }
  }
  .el-form-item.fix-label-line-height {
    ::v-deep .el-form-item__label {
      line-height: 20px;
    }
  }
}

::v-deep .hidden-popper {
  display: none;
}
</style>
