import { WidgetService } from '../service/WidgetService'

const leftPanel = {
  icon: 'iconfont icon-shuru',
  label: 'destorehouse.label',
  defaultClass: 'text-filter'
}

const dialogPanel = {
  options: {
    attrs: {
      placeholder: 'destorehouse.placeholder',
      viewIds: [],
      parameters: [],
      fieldId: '',
      dragItems: []
    },
    value: '',
    manualModify: false
  },
  defaultClass: 'text-filter',
  component: 'de-store-house',
  miniSizex: 1,
  miniSizey: 1
}
const drawPanel = {
  type: 'custom',
  style: {
    width: 600,
    // height: 45.5,
    height: 560,
    fontSize: 14,
    fontWeight: 500,
    lineHeight: '',
    letterSpacing: 0,
    textAlign: '',
    color: ''
  },
  icon: 'iconfont icon-shuru',
  label: '库位',
  component: 'de-store-house'
}

class TextStoreHouse extends WidgetService {
  constructor(options = {}) {
    Object.assign(options, { name: 'textStoreHouse' })
    super(options)
    this.filterDialog = true
    this.showSwitch = false
  }

  initLeftPanel() {
    const value = JSON.parse(JSON.stringify(leftPanel))
    return value
  }

  initFilterDialog() {
    const value = JSON.parse(JSON.stringify(dialogPanel))
    return value
  }

  initDrawPanel() {
    const value = JSON.parse(JSON.stringify(drawPanel))
    return value
  }

  filterFieldMethod(fields) {
    return fields.filter(field => {
      return field['deType'] === 0
    })
  }
  getParam(element) {
    const value = this.fillValueDerfault(element)
    const param = {
      component: element,
      value: !value ? [] : Array.isArray(value) ? value : [value],
      operator: 'like'
    }
    return param
  }
  fillValueDerfault(element) {
    const defaultV = element.options.value === null ? '' : element.options.value.toString()
    if (defaultV === null || typeof defaultV === 'undefined' || defaultV === '' || defaultV === '[object Object]') return null
    return defaultV.split(',')[0]
  }
}
const textStoreHouse = new TextStoreHouse()
export default textStoreHouse
