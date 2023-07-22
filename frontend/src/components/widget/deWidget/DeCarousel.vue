<template>
  <el-carousel
    ref="deCarousel"
    direction="vertical"
    :height="height"
    :style="{ '--CarouselLineHeight': height, 'visibility': datas.length > 0 ? 'visible' : 'hidden'} "
    style="white-space:pre-wrap"
    indicator-position="none"
    :autoplay="false"
  >
    <el-carousel-item v-for="(item,index) in requestData" :key="index" :name="item.content">
      <h3
        class="small"
        :style="{'font-size':element.style.fontSize,'font-weight':element.style.fontWeight,'color':element.style.color}"
      >{{ item.content }}</h3>
    </el-carousel-item>
  </el-carousel>
</template>

<script>
  import {multFieldValues, linkMultFieldValues} from '@/api/dataset/dataset'
  import bus from '@/utils/bus'
  import {$ as _$} from '@/components/canvas/utils/utils'
  import {carouselWidget} from '@/components/widget/deWidget/serviceNameFn.js'
  import {getLinkToken, getToken} from "@/utils/auth";
  import {isSameVueObj} from "@/utils";
  import {isChange} from "@/utils/conditionUtil";
  import {mapState} from 'vuex'
  import request from '@/utils/request'
  import DeCarouselAudio from "@/utils/audio"
  // import axios from 'axios'

  export default {
    name: "DeCarousel",
    props: {
      element: {
        type: Object,
        default: () => {
        }
      },
      inDraw: {
        type: Boolean,
        default: true
      },
      inScreen: {
        type: Boolean,
        required: false,
        default: true
      },
    },

    data() {
      return {
        paramList: [1],
        datas: [],
        cloneData: [],
        height: '',
        timer: null,
        mess: [],
        requestData: []
      }
    },
    computed: {
      ...mapState([
        'canvasStyleData',
        'curComponent'
      ]),
      defaultValueStr() {
        if (!this.element || !this.element.options || !this.element.options.value) return ''
        return this.element.options.value.toString()
      },
      viewIds() {
        if (!this.element || !this.element.options || !this.element.options.attrs.viewIds) return ''
        return this.element.options.attrs.viewIds.toString()
      },
      manualModify() {
        return !!this.element.options.manualModify
      },
      panelInfo() {
        return this.$store.state.panel.panelInfo
      }
    },

    watch: {
      'viewIds': function (value, old) {
        if (typeof value === 'undefined' || value === old) return
        this.setCondition()
      },
      'defaultValueStr': function (value, old) {
        if (value === old) return
        this.value = this.fillValueDerfault()
        this.changeValue(value)
      },
      'element.options.attrs.fieldId': function (value, old) {
        if (value === null || typeof value === 'undefined' || value === old) return
        this.datas = []
        let method = multFieldValues
        const token = this.$store.getters.token || getToken()
        const linkToken = this.$store.getters.linkToken || getLinkToken()
        if (!token && linkToken) {
          method = linkMultFieldValues
        }
        const param = {fieldIds: this.element.options.attrs.fieldId.split(','), sort: this.element.options.attrs.sort}
        if (this.panelInfo.proxy) {
          param.userId = this.panelInfo.proxy
        }
        this.element.options.attrs.fieldId &&
        this.element.options.attrs.fieldId.length > 0 &&
        method(param).then(res => {
          this.datas = this.optionDatas(res.data)
          this.$emit("selectDatas", this.datas)
          bus.$emit('valid-values-change', true)
        }).catch(e => {
          bus.$emit('valid-values-change', false)
        }) || (this.element.options.value = '')
      },
      'element.options.attrs.multiple': function (value, old) {
        if (typeof old === 'undefined' || value === old) return
        if (!this.inDraw) {
          this.value = value ? [] : null
          this.element.options.value = ''
        }

        this.show = false
        this.$nextTick(() => {
          this.show = true
          // this.handleCoustomStyle()
        })
      },
      'element.options.attrs.sort': function (value, old) {
        if (value === null || typeof value === 'undefined' || value === old || isSameVueObj(value, old)) return
        this.show = false

        this.datas = []

        let method = multFieldValues
        const token = this.$store.getters.token || getToken()
        const linkToken = this.$store.getters.linkToken || getLinkToken()
        if (!token && linkToken) {
          method = linkMultFieldValues
        }
        const param = {fieldIds: this.element.options.attrs.fieldId.split(','), sort: this.element.options.attrs.sort}
        if (this.panelInfo.proxy) {
          param.userId = this.panelInfo.proxy
        }
        this.element.options.attrs.fieldId &&
        this.element.options.attrs.fieldId.length > 0 &&
        method(param).then(res => {
          this.datas = this.optionDatas(res.data)
          this.$nextTick(() => {
            this.show = true
            // this.handleCoustomStyle()
          })
          bus.$emit('valid-values-change', true)
        }).catch(e => {
          bus.$emit('valid-values-change', false)
        }) || (this.element.options.value = '')
      },
      'element.style.height': function (value, old) {
        this.height = (value - 20) + 'px'
      },
      'element.style.fontSize': function (value, old) {
      }

    },

    created() {
      if (!this.element.options.attrs.sort) {
        this.element.options.attrs.sort = {}
      }
      let times = 0
      if (this.canvasStyleData.refreshUnit == "minute") {
        times = this.canvasStyleData.refreshTime * 60
      } else if (this.canvasStyleData.refreshUnit == "second") {
        times = this.canvasStyleData.refreshTime
      }
      this.initLoad()

      this.timer = setInterval(() => {
        this.initLoad()
      }, times * 1000)

      bus.$on('getCarouselFontSize', this.getCarouselFontSize)
      bus.$on('getCarouselFontWeight', this.getCarouselFontWeight)
      bus.$on('getCarouselFontColor', this.getCarouselFontColor)

    },

    mounted() {
      if (this.inDraw) {
        bus.$on('reset-default-value', this.resetDefaultValue)
      }
    },

    beforeDestroy() {
      bus.$off('reset-default-value', this.resetDefaultValue)
      bus.$off('getCarouselFontSize', this.getCarouselFontSize)
      bus.$off('getCarouselFontWeight', this.getCarouselFontWeight)
      bus.$off('getCarouselFontColor', this.getCarouselFontColor)
      clearInterval(this.timer)
      DeCarouselAudio.clear()

    },

    methods: {
      change(item) {
        // DeCarouselAudio.plays([this.requestData[item].voiceName])
      },

      getYYmsg(data) {
        return request({
          url: '/openapi/generatevoice',
          method: 'post',
          loading: true,
          data
        })
      },
      judeg(arr1, arr2) {
        let res = JSON.stringify(arr1) == JSON.stringify(arr2)
        return res
      },
      speak() {
        let res = this.judeg(this.cloneData, this.datas)
        let arr = []
        if (res) return
        this.cloneData = JSON.parse(JSON.stringify(this.datas))
        this.datas.forEach(item => {
          arr.push(item.text)
        })
        let method = this.getYYmsg
        if (arr.length > 0) {
          method({"speed": -2, "contents": arr}).then((res) => {
            this.requestData = res.data
            DeCarouselAudio.plays(this.requestData, (current) => {
              this.$nextTick(() => this.$refs["deCarousel"].setActiveItem(current.content))
            })
          }).catch((e) => {
            console.log('error', e)
          })
        }else{
          DeCarouselAudio.clear()
          this.requestData = []
        }
      },
      getCarouselFontSize(id, fontSize) {
        const dom = _$(`#component${id}`)
        let ele = dom.querySelectorAll('.el-carousel__item')
        for (let i = 0; i < ele.length; i++) {
          let sizeEle = ele[i].getElementsByTagName('h3')[0].style
          sizeEle.setProperty("font-size", fontSize + "px", "important")
        }

      },
      getCarouselFontWeight(id, fontWeight) {
        const dom = _$(`#component${id}`)
        let ele = dom.querySelectorAll('.el-carousel__item')
        for (let i = 0; i < ele.length; i++) {
          let sizeEle = ele[i].getElementsByTagName('h3')[0].style
          sizeEle.setProperty("font-weight", fontWeight, "important")
        }

      },
      getCarouselFontColor(id, fontColor) {
        const dom = _$(`#component${id}`)
        let ele = dom.querySelectorAll('.el-carousel__item')
        for (let i = 0; i < ele.length; i++) {
          let sizeEle = ele[i].getElementsByTagName('h3')[0].style
          sizeEle.setProperty("color", fontColor, "important")
        }

      },
      resetDefaultValue(id) {
        if (this.inDraw && this.manualModify && this.element.id === id) {
          this.value = this.fillValueDerfault()
          this.changeValue(this.value)
        }
      },

      initLoad() {
        this.value = this.fillValueDerfault()

        if (this.element.options.attrs.fieldId) {
          let method = multFieldValues
          const token = this.$store.getters.token || getToken()
          const linkToken = this.$store.getters.linkToken || getLinkToken()
          if (!token && linkToken) {
            method = linkMultFieldValues
          }
          method({
            fieldIds: this.element.options.attrs.fieldId.split(','),
            sort: this.element.options.attrs.sort
          }).then(res => {
            this.datas = this.optionDatas(res.data)
            bus.$emit('valid-values-change', true)
          }).catch(e => {
            bus.$emit('valid-values-change', false)
          })
        }
        if (this.element.options.value) {
          this.value = this.fillValueDerfault()
          this.changeValue(this.value)
        }
        this.speak()
      },

      fillValueDerfault() {
        const defaultV = this.element.options.value === null ? '' : this.element.options.value.toString()
        if (this.element.options.attrs.multiple) {
          if (defaultV === null || typeof defaultV === 'undefined' || defaultV === '' || defaultV === '[object Object]') return []
          return defaultV.split(',')
        } else {
          if (defaultV === null || typeof defaultV === 'undefined' || defaultV === '' || defaultV === '[object Object]') return null
          return defaultV.split(',')[0]
        }
      },

      optionDatas(datas) {
        if (!datas) return null
        return datas.filter(item => !!item).map(item => {
          return {
            id: item,
            text: item
          }
        })
      },

      changeValue(value) {
        if (!this.inDraw) {
          if (value === null) {
            this.element.options.value = ''
          } else {
            this.element.options.value = Array.isArray(value) ? value.join() : value
          }
          this.element.options.manualModify = false
        } else {
          this.element.options.manualModify = true
        }
        this.setCondition()
        this.showNumber = false

        this.$nextTick(() => {
          if (!this.element.options.attrs.multiple || !this.$refs.deSelect || !this.$refs.deSelect.$refs.tags) {
            return
          }
          const kids = this.$refs.deSelect.$refs.tags.children[0].children
          let contentWidth = 0
          kids.forEach(kid => {
            contentWidth += kid.offsetWidth
          })
          this.showNumber = contentWidth > ((this.$refs.deSelect.$refs.tags.clientWidth - 30) * 0.9)
          this.handleElTagStyle()
        })
      },

      filter() {
        const filter = {}
        filter.filter = this.isFirstLoad ? this.filters : this.cfilters
        filter.linkageFilters = this.element.linkageFilters
        filter.outerParamsFilters = this.element.outerParamsFilters
        filter.drill = this.drillClickDimensionList
        filter.resultCount = this.resultCount
        filter.resultMode = this.resultMode
        filter.queryFrom = 'panel'
        return filter
      },
      cfilters() {
        // 必要 勿删勿该  watch数组，哪怕发生变化 oldValue等于newValue ，深拷贝解决
        if (!this.element.filters) return []
        return JSON.parse(JSON.stringify(this.element.filters))
      },
    }
  }
</script>

<style scoped>
  .el-carousel__item h3 {
    color: #475669;
    opacity: 0.75;
    line-height: var(--CarouselLineHeight, 50px);
    margin: 0;
  }

  .el-carousel__item:nth-child(2n) {
    /*background-color: #99a9bf;*/
  }

  .el-carousel__item:nth-child(2n+1) {
    /*background-color: #d3dce6;*/
  }
</style>
