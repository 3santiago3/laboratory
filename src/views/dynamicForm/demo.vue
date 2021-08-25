<template>
  <div class="dynamic-form-demo">
    {{ options.formData }}

    <vue-form-maker :options="options" />
  </div>
</template>

<script>
/* *****
整个结构是这样的
<el-form>
  <el-row>
    <el-col>
      <el-form-item>
        <el-input />
      </el-form-item>
    </el-col>
    <el-col>
      <el-select />
    </el-col>
  </el-row>
</el-form>
***** */

export default {
  name: 'DynamicFormDemo',
  data() {
    return {
      options: {
        formProps: {
          inline: true
        },
        rowProps: {
          gutter: 20
        },
        formItem: [
          {
            type: 'input',
            key: 'name',
            props: {
              placeholder: '请输入名称',
              clearable: true,
              'prefix-icon': 'el-icon-search'
            },
            formItemProps: {
              label: '名称'
            },
            colProps: {
              span: 12
            }
          },
          {
            type: 'input',
            key: 'code',
            props: {
              placeholder: '请输入编号',
              clearable: true
            },
            formItemProps: {},
            colProps: {
              sm: 12
            }
          }
        ],
        formData: {
          name: '',
          code: ''
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
