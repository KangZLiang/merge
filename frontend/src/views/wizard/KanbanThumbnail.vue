<template>
  <div class="common-layout">
    <el-container v-if="componentName !=='PanelEdit'" style="height: 100%;">
      <el-header class="Kanbantitle">
        <div class="title">
          看板标准化模板
        </div>
      </el-header>
      <el-main style="height: 100%;overflow: auto;padding: 0;">
        <el-row>
          <el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="6" v-for="(item, index) in imgUrlList" :key="index">
            <div class="grid-content">
              <el-card shadow="hover" class="card" @mouseenter.native="enterFun(item)"
                       @mouseleave.native="leaveFun(item)"
                       body-style="backgroundColor:rgba(255, 255, 255, 0.6);transition:height 0.3s ease-out;webkitTransition:height 0.3s ease-out;">
                <div class="jymmd" style="height: 100%; width: 100%;">
                  <img v-show="!item.fullscreen"
                       :src="item.blob" alt=""
                       :key="index" style="height: 100%; width: 100%;"/>
                </div>
              </el-card>
              <div class="btnBox">
                <el-button class="btn" size="small" @click="clickFullscreen(item)">预览</el-button>
                <el-button class="btn" size="small" type="primary"
                           @click="editPanel(item.id)">编辑
                </el-button>
              </div>
            </div>
          </el-col>
        </el-row>
        <el-row v-show="comData.fullscreen">
          <fullscreen ref="fullscreen" style="height: 100%;background: #ffffff;width: 100%;position: relative" @change="fullscreenChange">
            <Preview
              v-if="showMainFlag"
              ref="paneViewPreviewRef"
              :component-data="comData.componentData"
              :canvas-style-data="comData.canvasStyleData"
              :active-tab="activeTab"
              :in-screen="!fullscreen"
              :show-type="'width'"
              :panel-info="comData.poapanelInfo"
              :screen-shot="false"
            />
          </fullscreen>
        </el-row>
      </el-main>
    </el-container>
    <de-container v-else style="background-color: #f7f8fa">
      <de-main-container class="full-height">
        <panel-edit/>
      </de-main-container>
    </de-container>
  </div>
</template>

<script>

import {
  groupTree, initPanelData, updatePanelStatus, viewPanelLog,
} from '@/api/panel/panel'
import {getNowCanvasComponentData} from "@/components/canvas/utils/utils";
import {mapState} from "vuex";
import bus from "@/utils/bus";
import Preview from '@/components/canvas/components/editor/Preview'
import {starStatus} from "@/api/panel/enshrine";
import {DEFAULT_COMMON_CANVAS_STYLE_STRING} from "@/views/panel/panel";
import {siftTree} from '@/utils/kanban'
import DeMainContainer from '@/components/dataease/DeMainContainer'
import DeContainer from '@/components/dataease/DeContainer'
import PanelMain from '@/views/panel/list/PanelMain'
import PanelEdit from '@/views/panel/edit'
import {selectTableDate} from '@/api/dataset/dataset'

export default {
  name: 'KanbanThumbnail',
  props: {
    activeTab: {
      type: String,
      required: false
    },
  },
  components: {Preview, DeMainContainer, DeContainer, PanelMain, PanelEdit},
  data() {
    return {
      comData: {},
      showMain: false,
      imgList: [
        {
          isEditShow: false,
        },
      ],
      cardList: [
        {
          isEditShow: false,
        },
      ],
      groupForm: {
        name: null,
        pid: null,
        panelType: 'self',
        nodeType: null,
        children: [],
        sort: 'create_time desc,node_type desc,name asc'
      },
      expandedArray: [],
      activeTree: 'self',
      canvasId: 'canvas-main',
      activeTab: 'PanelList',
      comDataList: [],
      treeDataList: [],
      componentName: 'PanelMian',
      imgUrlList: [],
      fullscreen:false
    }
  },
  created() {
    // this.tree()
    bus.$on('CloseEditing', this.CloseEditing)
  },
  computed: {
    showMainFlag() {
      return this.showMain
    },
    ...mapState([
      'componentData',
      'canvasStyleData',
      'panelViewDetailsInfo'
    ]),
    mainCanvasComponentData() {
      return getNowCanvasComponentData(this.canvasId)
    },
    panelInfo() {
      return this.$store.state.panel.panelInfo
    },
    refreshStarList(isStar) {
      if (this.activeTab !== 'PanelList') {
        bus.$emit('panle_start_list_refresh', isStar)
      }
    }
  },
  watch: {
    panelInfo(newVal, oldVla) {
      // 刷新 进行重新渲染
      this.showMain = false
      this.$nextTick(() => {
        this.showMain = true
        this.initHasStar()
      })
    },
    fullscreen(newVal, oldVla) {
      // 刷新 进行重新渲染
      this.showMain = true
      this.$nextTick(() => {
        this.showMain = false
        this.initHasStar()
      })
    }
  },
  beforeDestroy() {
    bus.$off('CloseEditing', this.CloseEditing)
  },
  mounted() {
    this.tree()
  },
  methods: {
    fullscreenChange(e) {
      this.fullscreen = e
      this.comData.fullscreen = e
    },
    CloseEditing() {
      this.componentName = 'PanelMian'
    },
    //  编辑
    editPanel(id) {
      let data = siftTree(this.treeDataList, id)
      this.$store.commit('setComponentData', [])
      this.$store.commit('setCanvasStyle', DEFAULT_COMMON_CANVAS_STYLE_STRING)
      this.$store.dispatch('panel/setPanelInfo', {
        id: data.id,
        name: data.name,
        privileges: data.privileges,
        sourcePanelName: data.sourcePanelName,
        status: data.status,
        createBy: data.createBy,
        createTime: data.createTime,
        updateBy: data.updateBy,
        updateTime: data.updateTime,
        watermarkOpen: data.watermarkOpen
      })
      this.componentName = 'PanelEdit'
      // bus.$emit('PanelSwitchComponent', { name: 'PanelEdit' })
    },

    //  全屏
    clickFullscreen(item) {
      const _this = this
      this.comData.poapanelInfo = this.$store.state.panel.panelInfo
      initPanelData(item.id, false, function (response) {
        _this.comData.componentData = _this.mainCanvasComponentData
        _this.comData.canvasStyleData = _this.canvasStyleData
        viewPanelLog({panelId: item.id}).then((res) => {
          bus.$emit('set-panel-show-type', 0)
          _this.comData.mobileLayout = response.data.mobileLayout
        })
      })
      this.fullscreen = true
      this.comData.fullscreen = true
      this.$refs['fullscreen'].toggle()
      this.showMain = true
    },
    initHasStar() {
      this.panelInfo && this.panelInfo.id && starStatus(this.panelInfo.id).then(res => {
        // console.log(res.data)
        this.hasStar = res.data
      })
    },
    //tree数据
    tree(cache = false) {
      const modelInfo = localStorage.getItem('panel-main-tree')
      const userCache = modelInfo && cache
      groupTree(this.groupForm, !userCache).then((res) => {
        this.treeDataList = res.data
        this.imgUrl(res.data)
      })
    },
    imgUrl(lists) {
      selectTableDate({tableName: 'images'}).then(res => {
        let l = res.data.list
        let list = []
        for (let i = 0; i < lists.length; i++) {
          let res = lists[i].children
          for (let j = 0; j < res.length; j++) {
            let a = res[j]
            l.some(item => {
              if (item.id == a.id) {
                list.push(item)
                return true
              } else {
                return false
              }
            })
          }
        }
        this.imgUrlList.splice(0, this.imgUrlList.length, ...list)
      })
    },
    // 鼠标移入
    enterFun(item) {
      item.isEditShow = true
    },
    // 鼠标移出
    leaveFun(item) {
      item.isEditShow = false
    },
    updatePublishStatus(newStatus) {
      this.panelInfo.status = newStatus
      updatePanelStatus(this.panelInfo.id, {'status': this.panelInfo.status})
      this.$emit('editPanelBashInfo', {
        'operation': 'status',
        'value': this.panelInfo.status
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.common-layout {
  height: 100%;
}

.cardtitle {
  font-family: "PingFang SC";
  font-style: normal;
  color: #1f2329;
  display: inline-block;
  width: 90%;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  margin-right: 10px;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  transition: height 0.3s ease-out
}

.btnBox {
  width: 80%;
  padding-top: 10px;
  display: flex;
  align-content: space-around;
  justify-content: space-around;
}

.btn {
  width: 45%;
  padding: 9px 15px;
  font-size: 12px;
}

.Kanbantitle {
  display: flex;
  align-items: center;
  font-size: xx-large;
  font-weight: 500;
  //padding-top: 20px;
  //padding-left: 20px;
}

.eldrawer .el-drawer {
}

.title {
  height: 60px;
  //line-height: height;
  display: flex;
  align-items: center;
  font-family: "楷体";
}

/*img {*/
/*  padding-left: 5px;*/
/*  padding-right: 5px;*/
/*}*/

.el-col {
  /*border-radius: 4px;*/
}

.grid-content {
  display: flex;
  text-align: center;
  justify-content: center;
  /*border-radius: 4px;*/
  min-height: 36px;
  padding-bottom: 20px;
  flex-direction: column;
  align-items: center;
}

.card {
  /*background-image: url(../../../static/img/download.jpg);*/
  /*background-size: contain;*/
  width: 388px;
  height: 250px;
  display: flex;
}

/*.card {*/
/*  !*background-image: url(../../../static/img/download.jpg);*!*/
/*  !*background-size: contain;*!*/
/*  width: 388px;*/
/*  height: 250px;*/
/*  display: flex;*/
/*}*/

::v-deep .el-card__body {
  padding: 0px !important;
}

::v-deep.v-text {
  padding: 0px;
  margin: 0px;
}

#preview-main-canvas-main {
  padding: 0px !important;
  margin: 0px;
  width: 100%;
  height: 100%;
}

.eldrawer ::v-deep .el-drawer {
  width: 85% !important;
}

.full-height {
  height: 100vh !important;
}
</style>
