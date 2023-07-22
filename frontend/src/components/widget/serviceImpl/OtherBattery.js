import { WidgetService } from "@/components/widget/service/WidgetService"
const leftPanel = {
  icon: 'iconfont icon-xialakuang',
  label: 'debattery.label',
  defaultClass: 'text-filter'
}

const dialogPanel = {
  options: {
    attrs: {
      placeholder: 'debattery.placeholder',
      viewIds: [],
      parameters: [],
      fieldId: '',
      dragItems: [],
      datas: [],
      key: 'id',
      label: '',
      value: 'id',
      title: 'battery'
    },
    value: '',
    manualModify: false
  },
  defaultClass: 'text-filter',
  component: 'de-battery',
  miniSizex: 1,
  miniSizey: 1
}

const drawPanel = {
  type: 'custom',
  style: {
    width: 300,
    height: 90,
    fontSize: 14,
    fontWeight: 500,
    lineHeight: '',
    letterSpacing: 0,
    textAlign: '',
    color: '',
    hPosition: 'left',
    vPosition: 'center'
  },
  icon: 'iconfont icon-xialakuang',
  label: '电池',
  component: 'de-battery'
}

class BatteryWidget extends WidgetService{
  constructor(options = {}) {
    Object.assign(options,{name: 'batteryWidget'})
    super(options);
    this.filterDialog = true
    this.showSwitch = true
    //      this.showVisual = true
  }

  initLeftPanel(){
    const value = JSON.parse(JSON.stringify(leftPanel))
    return value
  }

  initFilterDialog(){
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

  optionDatas(datas) {
    if (!datas) return null
    return datas.filter(item => !!item).map(item => {
      return {
        id: item,
        text: item
      }
    })
  }

  getParam(element) {
    const value = this.fillValueDerfault(element)
    const param = {
      component: element,
      value: !value ? [] : Array.isArray(value) ? value : value.toString().split(','),
      operator: element.options.attrs.multiple ? 'in' : 'eq'
    }
    return param
  }
  isSortWidget() {
    return true
  }

  fillValueDerfault(element) {
    const defaultV = element.options.value === null ? '' : element.options.value.toString()
    if (element.options.attrs.multiple) {
      if (defaultV === null || typeof defaultV === 'undefined' || defaultV === '' || defaultV === '[object Object]') return []
      return defaultV.split(',')
    } else {
      if (defaultV === null || typeof defaultV === 'undefined' || defaultV === '' || defaultV === '[object Object]') return null
      return defaultV.split(',')[0]
    }
  }
}

const  batteryWidget = new BatteryWidget()
export default batteryWidget
