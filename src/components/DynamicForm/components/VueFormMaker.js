import componentObj from './utils'

export default {
  props: {
    options: {
      type: Object,
      required: true
    }
  },
  render(h) {
    const options = this.options
    const formData = options.formData
    const formItem = options.formItem

    if (!formItem) {
      return h('div')
    }

    const components = formItem.map(item => {
      const func = componentObj[item.type]
      const subComponent = func
        ? func.call(this, h, formData, item, this)
        : null
      const component = componentObj.formItem(h, item, subComponent)
      return componentObj.col(h, item, component)
    })

    console.log(components)
    return h(
      'el-form',
      {
        ref: 'form',
        props: {
          model: formData,
          ...options.formProps
        }
      },
      [h('el-row', { props: options.rowProps }, components)]
    )
  }
}
