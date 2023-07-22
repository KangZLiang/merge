<template>
  <div style="width: 99%;height: 100%">
    <div class="h100 flex flex-column">
      <header>
        <ul>
          <li style="background-color: #66ff33;">良品</li>
          <li style="background-color: #ff0000;">不良品</li>
          <li style="background-color: #33ff33;">有料</li>
          <li style="background-color: #ff8800;">无料</li>
          <li style="background-color: #66ccff;">空闲</li>
          <li style="background-color: #ff3333;">占用</li>
          <li style="background-color: #000000;color: #CCCCCC">无状态</li>
        </ul>
      </header>
      <div class="h100 flex flex-column flex-1">
        <div class="flex flex-column" v-for="(item,i) in list" :key="i">
          <h4 style="padding-top: 5px;color: #CCCCCC;">{{ title(item.label) }}</h4>
          <div class="h100 flex-1 flex" style="flex-wrap: wrap;">
            <div style="width: 24%;margin: 5px 0 5px 1%;" v-for="(val,index) in item.list" :key="index">
              <div style="box-sizing: border-box;border: 1px solid #CCCCCC;">
                <div class="flex" style="flex-direction: row-reverse;padding-right: 3px;height: 1.5em"
                     :style="{color: colorIsGood(val)}">
                  <span v-show="isShow(item,val)">{{ val.isGood == 1 ? "良品" : "不良品" }}</span>
                </div>
                <div class="flex flex-column justify-center align-center">
                  <div class="flex justify-center align-center"
                       :style="{color: colorWareId(item,val),lineHeight: '2em'}">
                    {{ val.wareId }}
                  </div>
                  <!--                    <div style="display: flex;justify-content: center;align-content: center">{{-->
                  <!--                        val.materialnickname-->
                  <!--                      }}-->
                  <!--                    </div>-->
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
    <el-dialog
      v-if="isEdit"
      append-to-body
      :visible.sync="ruleForm.is_show"
      :title="settingTitle"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >

      <el-form label-position="left" :model="ruleForm" :rules="rules" ref="ruleForm" label-width="150px"
               class="demo-ruleForm">
        <el-form-item prop="address" required>
          <template v-slot:label>
            <span>请求数据地址</span>
            <el-tooltip class="item" effect="dark" content="Top Left 提示文字" placement="top-start">
              <div slot="content">
                http://终端地址:端口号/请求接口
              </div>
              <i class="el-icon-info" style="cursor: pointer;"/>
            </el-tooltip>
          </template>
          <el-input v-model="ruleForm.address" placeholder="http://127.0.0.1:8081/openApi/getCode"></el-input>
        </el-form-item>
        <el-form-item label="请求方式" prop="methods" required>
          <el-radio-group v-model="ruleForm.methods">
            <el-radio label="POST"></el-radio>
            <el-radio label="GET"></el-radio>
            <el-radio label="PUT"></el-radio>
            <el-radio label="DELETE"></el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="data">
          <template v-slot:label>
            <span>请求传参</span>
            <el-tooltip class="item" effect="dark" placement="top-start">
              <div slot="content">
                {
                "name":"名称",
                "age":"12"
                }
              </div>
              <i class="el-icon-info" style="cursor: pointer;"/>
            </el-tooltip>
          </template>
          <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 15 }" v-model="ruleForm.data"></el-input>
        </el-form-item>
        <el-form-item label="是否循环请求(秒)" prop="is_loop">
          <el-switch
            v-model="ruleForm.is_loop"
            active-color="#13ce66"
            inactive-color="#ff4949">
          </el-switch>
          <el-input-number v-show="ruleForm.is_loop" v-model="ruleForm.time" :min="1" label="库位图刷新间隔"></el-input-number>
        </el-form-item>
      </el-form>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="settingVsible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="confirm"
        >确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'
import bus from '@/utils/bus'
import {updateTableData, addTableData, selectTableDate} from '@/api/dataset/dataset'

export default {
  name: 'DeSettingStoreHouse',
  props: {
    element: {
      type: Object,
      default: null
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isExist: false,
      settingTitle: '地址设置',
      settingVsible: false,
      ruleForm: {
        address: '',
        methods: '',
        data: '{}',
        is_show: false,
        time: 1,
        is_loop: false
      },
      rules: {
        methods: [
          {required: true, message: '请选择请求方式', trigger: 'change'}
        ],
        address: [
          {required: true, message: '请输入请求地址', trigger: 'blur'}
        ]
      },
      list: [],
      timer: null
    }
  },
  computed: {
    title() {
      return (item) => {
        if (item == 2) {
          return "分条区"
        } else if (item == 1) {
          return "辊压区"
        }
      }
    },
    colorIsGood() {
      return (val) => {
        if (val.vtype == 2) {
          return val.isGood == 1 ? '#66ff33' : '#ff0000'
        }
        return false
      }
    },
    colorWareId() {
      return (item, val) => {
        return val.wareIsCalled == 0 ? '#66ccff' : (val.wareIsCalled == 3 ? '#ff3333' : (val.vtype == 2 ? '#33ff33' : (val.vtype == 1 ? '#ff8800' : '#000000')))
      }
    },
    isShow() {
      return (item, val) => {
        if (item.label == 1 && val.isGood != 3) {
          return true
        } else {
          return false
        }
      }
    }
  },
  created() {
    bus.$on('house-dialog', this.addEidt)
    bus.$on('del-house-map', this.delmap)
  },
  beforeDestroy() {
    bus.$off('house-dialog', this.addEidt)
    bus.$off('del-house-map', this.delmap)
  },
  mounted() {
    this.getListData()
  },
  methods: {
    getListData() {
      selectTableDate({tableName: 'ware_house_address'}).then(res => {
        for (let i = 0; i < res.data.list.length; i++) {
          let a = res.data.list[i]
          if (a.id == this.element.id) {
            let show = null;
            let loop = null;
            this.isExist = true
            show = a.is_show == '0' ? false : true
            loop = a.is_loop == '0' ? false : true
            this.ruleForm = {...a, is_show: show, is_loop: loop}
            this.getData()
            break
          }
        }
      })
    },
    addEidt() {
      this.ruleForm.is_show = !this.ruleForm.is_show
    },
    confirm() {
      this.ruleForm.is_show = false
      this.getData()
      let list = []
      for (let i in this.ruleForm) {
        list.push({
          name: i,
          value: this.ruleForm[i]
        })
      }
      if (this.isExist) {
        updateTableData({
          "tableName": "ware_house_address",
          "updateList": [{
            "name": "id",
            "value": this.element.id
          }, ...list],
          "whereList": [{
            "name": "id",
            "value": this.element.id
          }]
        }).then(res => {
          this.$message({
            message: '修改成功',
            type: 'success'
          })
        }).catch(err => {
          this.$message({
            message: '修改失败',
            type: 'error'
          })
        })
      } else {
        addTableData({
          "tableName": "ware_house_address",
          "addList": [{
            "name": "id",
            "value": this.element.id
          }, ...list],
        }).then(res => {
          this.isExist = true
          this.$message({
            message: '添加成功',
            type: 'success'
          })
        }).catch(err => {
          this.$message({
            message: '添加失败',
            type: 'error'
          })
        })
      }
      clearInterval(this.timer)
      if (this.ruleForm.is_loop) {
        this.timer = setInterval(() => {
          this.getData()
        }, 1000 * this.ruleForm.time)
      }
    },
    getData() {
      axios({
        method: this.ruleForm.methods,
        url: this.ruleForm.address,
        data: JSON.parse(this.ruleForm.data)
      }).then(res => {
        this.filterList(res.data.data)
      }).catch(err => {
        this.$message({
          message: '请求错误',
          type: 'error'
        })
      })
    },
    filterList(list) {
      let nameList = []
      for (let i = 0; i < list.length; i++) {
        let a = list[i]
        if (!nameList.includes(a.wareType)) {
          nameList.push(a.wareType)
        }
      }
      let arr = []
      for (let i = 0; i < nameList.length; i++) {
        let n = nameList[i]
        let l = []
        for (let j = 0; j < list.length; j++) {
          let b = list[j]
          if (n == b.wareType) {
            l.push(b)
          }
        }
        arr.push({label: n, list: l})
      }
      this.list.splice(0, this.list.length, ...arr)
    },
    delmap(id) {
      if (id == this.element.id) {
        this.$store.dispatch('task/delHouseAdress', {id: this.element.id})
      }
    }
  }

}
</script>

<style lang="scss" scoped>
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

.h100 {
  width: 100%;
  height: 100%;
}

.flex-1 {
  flex: 1;
}

.flex {
  display: flex;
}

.flex-column {
  flex-direction: column;
}

.justify-center {
  justify-content: center;
}

.align-center {
  align-content: center;
}
</style>
