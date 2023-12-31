import { WidgetService } from '../service/WidgetService'

const leftPanel = {
  icon: 'iconfont icon-shuru',
  label: 'desettingstorehouse.label',
  defaultClass: 'text-filter'
}

const dialogPanel = {
  options: {
    attrs: {
      placeholder: 'desettingstorehouse.placeholder',
      viewIds: [],
      parameters: [],
      fieldId: '',
      dragItems: []
    },
    value: '',
    manualModify: false
  },
  defaultClass: 'text-filter',
  component: 'de-setting-store-house',
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
  label: '自动义地址库位',
  component: 'de-setting-store-house'
}

class SettingStoreHouse extends WidgetService {
  constructor(options = {}) {
    Object.assign(options, { name: 'settingStoreHouse' })
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
const settingStoreHouse = new SettingStoreHouse()
export default settingStoreHouse
