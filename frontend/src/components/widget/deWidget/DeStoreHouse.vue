<template>
  <div style="width: 100%;height: 100%">
    <div class="stroeHouse">
      <header>
        <div style="color: #fff;"> {{ headerName }}区</div>
        <ul>
          <li style="background-color: #0a7be0">静置</li>
          <li style="background-color: #ffff00">无框</li>
          <li style="background-color: #ff8800">占用(陈化中)</li>
          <li style="background-color: #ff0000">陈化超时</li>
          <li style="background-color: #008800">陈化完成</li>
          <li style="background-color: #cccccc">禁用</li>
        </ul>
      </header>
      <main style="height: 95%">
        <div style="height: 80%">
          <div v-for="(item,index) in StoreHouseList" :key="index" style="height: 33.3%;">
            <header style="height: 10%;display: flex;align-content: center; color: #fff;"><span>{{ index + 1 }} 排</span>
            </header>
            <div class="grid">
              <div class="stroeHouse-one" v-for="val in item" :key="val.wareId" @click="warehouseClick(val)"
                   :style="{'grid-column-start':SplitLocation(val.wareName)[2] ,'grid-row-start': SplitLocation(val.wareName)[3]}">
                <div class="constant"
                     :class="[{'AgingComplete': val.boxPro == 1 && timeHandle(val.timeSl,val.timeSu) == 'Aging' },{'AgingOvertime': val.boxPro == 1 && timeHandle(val.timeSl,val.timeSu) == 'AgingEnd' },{'occupy': val.boxPro == 1 && timeHandle(val.timeSl,val.timeSu) == 'NoAging' },{'free':val.boxPro == 0|| !val.boxPro},{'warning':val.boxPro == 2}]">
                  <div style="position: absolute;top: 50%;left: 50%;transform: translate(-50%,-50%)">{{ val.wareName }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style="height: 20%">
          <header style="height: 20%;display: flex;align-content: center;color: #fff;margin: 5px 4px; ">
            <span>超时预警</span>
          </header>
          <div style="height: 80%;">
            <div style="height: 100%;display: flex" v-if="timeoutList.length<=5">
              <div
                style="color: orange;width: 20%;height:100%;display: flex;justify-content: center;align-items: center; "
                v-for="(item,index) in timeoutList" :key="index" @click="warehouseClick(item)">
                <div class="wares" >
                  <div>
                    {{ item.wareName }}
                  </div>
                  <div>
                    {{ item.wareNum }}
                  </div>
                  <div style="color:blue">
                    {{ item.alert }}
                  </div>
                </div>
              </div>
            </div>
            <div style="height: 100%;display: flex" v-else>
              <div style="flex: 1;width: 95%;height:100%;display: flex;justify-content: center;align-items: center; "
                   v-for="(item,index) in timeoutList" :key="index" @click="warehouseClick(item)">
                <div
                  class="wares"
                  >
                  <div>
                    {{ item.wareName }}
                  </div>
                  <div>
                    {{ item.wareNum }}
                  </div>
                  <div style="color:blue">
                    {{ item.alert }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    <el-dialog
      append-to-body
      :visible.sync="addressVsible"
      :before-close="beforeClose"
      :title="title"
    >
      <div>
        <el-row>
          <el-col :span="10">库位</el-col>
          <el-col :span="14">{{ details.wareName }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="10">条码</el-col>
          <el-col :span="14">{{ details.version }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="10">型号</el-col>
          <el-col :span="14">{{ details.wareMaterielType }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="10">静置上下限</el-col>
          <el-col :span="14">{{ details.wareStewTime2 }} -- {{ details.wareStewTime1 }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="10">入库时间</el-col>
          <el-col :span="14">{{ details.wareUpdateTime }}</el-col>
        </el-row>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'
import bus from '@/utils/bus'

export default {
  name: 'DeStoreHouse',
  data() {
    return {
      timer: null,
      count: 0,
      StoreHouseList: [],
      addressVsible: false,
      addressValue: '',
      topage: 0,
      area: 0,
      total: null,
      headerName: null,
      title: '',
      details: {},
      timeoutList: []
    }
  },
  created() {
    bus.$on('Interval', this.loopRound)
    bus.$on('loop', this.loop)
  },
  beforeDestroy() {
    bus.$off('Interval', this.loopRound)
    bus.$off('loop', this.loop)
  },
  mounted() {
    this.loop()
  },
  methods: {
    loopRound() {
      clearInterval(this.timer)
      this.count = 0
      this.loop()
      this.setTime()
    },
    setTime() {
      this.timer = setInterval(() => {
        this.count++
        if (this.count > this.total) {
          clearInterval(this.timer)
          bus.$emit('fromNew')
        } else {
          this.loop()
        }
      }, 10 * 1000)
    },
    SplitLocation(wareName) {
      return wareName.split('-')
    },
    timeHandle(start, end) {
      let timeStart = new Date(start.replace(/-/g, "/"))
      let timeEnd = new Date(end.replace(/-/g, "/"))
      let dateEnd = new Date()
      if (dateEnd.getTime() >= timeStart.getTime() && dateEnd.getTime() <= timeEnd.getTime()) {
        return 'Aging'
      } else if (dateEnd.getTime() < timeStart.getTime()) {
        return 'NoAging'
      } else if (dateEnd.getTime() > timeEnd.getTime()) {
        return 'AgingEnd'
      }
    },
    loop() {
      axios({
        method: 'POST',
        url: 'http://192.168.8.100:9092/depot/makerwit/reservoirAreaInformation',
      }).then(resp => {
        let res = resp.data.data
        let arr = this.sift(res)
        this.total = arr.length - 1
        let area = arr[this.count]
        let temp = {};
        for (let i = 0; i < arr.length; i++) {
          if (area == arr[i]) {
            let list = res[arr[i]]
            for (let j = 0; j < list.length; j++) {
              let result = this.SplitLocation(list[j].wareName)
              let key = result[1]
              if (temp[key] == undefined) {
                temp[key] = [list[j]];
              } else {
                temp[key].push(list[j]);
              }
            }
          }
        }
        this.headerName = area
        this.StoreHouseList.splice(0, this.StoreHouseList.length)
        for (let i in temp) {
          this.StoreHouseList.push(temp[i])
        }
      })
      axios({
        method: 'POST',
        url: 'http://192.168.8.100:9092/makerwit/desc/getWareTimeOut',
      }).then(res => {
        let com = res.data.data
        let arr = this.siftList(com)
        console.log(arr)
        let area = arr[this.count]
        let list = []
        for (let i = 0; i < com.length; i++) {
          let result = this.SplitLocation(com[i].wareName)
          if (area == result[0]) {
            list.push(com[i])
          }
        }
        this.timeoutList.splice(0, this.timeoutList.length, ...list)
      })
    },
    siftList(list) {
      let listArea = []
      for (let i = 0; i < list.length; i++) {
        let result = this.SplitLocation(list[i].wareName)
        if (!listArea.includes(result[0])) {
          listArea.push(result[0])
        }
      }
      return listArea
    },
    sift(item) {
      let listArea = []
      // let name;
      for (let i in item) {
        if (!listArea.includes(i)) {
          listArea.push(i)
        }
      }
      return listArea
    },
    warehouseClick(item) {
      let explorer = document.fullscreenElement
      if (explorer) {//webkit
        bus.$emit('ClickHouse', item)
      } else {
        this.addressVsible = true
        this.title = item.wareName + '库位详情'
        clearInterval(this.timer)
        axios({
          method: 'POST',
          url: 'http://192.168.8.100:9092/makerwit/desc/localDetails',
          data: {
            wareId: item.wareId
          }
        }).then(res => {
          this.details = res.data.data
        })
      }
    },
    beforeClose() {
      this.addressVsible = false
      this.setTime()
    }
  }
}
</script>

<style lang="scss" scoped>
.wares {
  width: 90%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: orange;
  font-size: 12px;
}

header {
  display: flex !important;
  justify-content: space-between;
  padding: 0 10px;
  align-content: center;
  width: 100%;
  height: 5%;

  ul {
    display: flex;
    width: 75%;
    justify-content: flex-end;

    li {
      width: 20%;
      height: 20px;
      margin: 0 10px;
      display: flex;
      justify-content: center;
      align-content: center;
    }
  }
}

.stroeHouse {
  width: 100%;
  height: 100%;
}

.grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(3, 1fr);
  grid-gap: 10px;
  margin: 0 0 4%;
  width: 100%;
  //border: 1px solid #ccc;
  height: 90%;
}

.stroeHouse-one {
  background-color: #fff;
  border: 1px solid #8000ff;
}

.constant {
  width: 100%;
  height: 100%;
  padding: 10px;
  position: relative;
}

.houseOne {
  width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #cc8500;
  height: 50px;
  display: inline-block;
  margin: 5px;
}

.AgingOvertime {
  background-color: #ff0000;
}

.warning {
  background-color: #ffff00;
}

.free {
  background-color: #0a7be0;
}

.occupy {
  background-color: #ff8800;
}

.AgingComplete {
  background-color: #008800;
}
</style>
