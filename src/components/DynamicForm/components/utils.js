function translateEvents(events = {}, vm) {
  const result = {}
  for (const event in events) {
    result[event] = events[event].bind(vm)
  }

  return result
}

function generateColComponent(h, obj, component) {
  return h(
    'el-col',
    {
      props: {
        ...obj.colProps
      }
    },
    [component]
  )
}

function generateFormItemComponent(h, obj, component) {
  return h(
    'el-form-item',
    {
      props: {
        ...obj.formItemProps
      }
    },
    [component]
  )
}

function generateInputComponent(h, formData = {}, obj, vm) {
  const key = obj.key ? obj.key : ''
  // let children = []

  // if (obj.children) {
  //   children = obj.children.map(item => {
  //     let component
  //     if (item.type === 'span') {
  //       component = h(
  //         'span',
  //         {
  //           slot: item.slot
  //         },
  //         [item.text]
  //       )
  //     } else {
  //       const func = componentObj[item.type]
  //       component = func ? func.call(vm, h, formData, item, vm) : null
  //     }
  //     return component
  //   })
  // }

  return h(
    'el-input',
    {
      props: {
        ...obj.props,
        value: key ? formData[key] : ''
      },
      style: obj.style,
      on: {
        // ...translateEvents(obj.events, vm),
        input(val) {
          if (key) {
            formData[key] = val
          }
        }
      }
      // slot: obj.slot
    }
    // children
  )
}

const componentObj = {
  col: generateColComponent,
  formItem: generateFormItemComponent,
  input: generateInputComponent
}

export default componentObj
