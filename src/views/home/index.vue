<template>
  <el-row class="container">
    <el-col class="header" :span="collapsed ? 1 : 3">
      <div class="logo">
        {{collapsed ? 'A':'Admin'}}
      </div>
    </el-col>
    <el-col class="header" :span="collapsed ? 23 : 21">
      <div class="tools">
        <i class="fa fa-align-justify" @click.prevent="collapse"></i>
        <el-tooltip effect="light" :content="$t('navbar.screenlock')" placement="bottom">
          <span @click="lockScreen">
            <svg-icon class="tool" icon-class="lock"></svg-icon>
          </span>
        </el-tooltip>
        <el-tooltip effect="light" :content="$t('navbar.screenfull')" placement="bottom">
          <screenfull class="screenfull"></screenfull>
        </el-tooltip>

        <el-tooltip effect="light" :content="$t('navbar.updatePwd')" placement="bottom">
          <span @click="handleUpdatePwd">
            <svg-icon class="tool" icon-class="updatePwd"></svg-icon>
          </span>
        </el-tooltip>

        <lockscreen v-if="locked">
          <div class="lockScreen-div">
            <div class="unlock-container">
              <img alt :src="userInfo.avatar" class="head"/>
              <p class="user-name">{{userInfo.name}}</p>
              <el-form class="login-form" ref="loginForm" label-position="left">
                <el-form-item prop="password">
                  <el-input autofocus clearable class="passwd" name="password" v-model="password" type="password" :placeholder="$t('navbar.inputPassWd')" @keyup.enter.native="unlockScreen">
                    <el-button slot="append" @click="unlockScreen">{{$t('navbar.unlockscreen')}}</el-button>
                  </el-input>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </lockscreen>

        <el-tooltip effect="light" :content="$t('navbar.logOut')" placement="bottom">
          <span @click="logout">
            <svg-icon class="tool" icon-class="logout"></svg-icon>
          </span>
        </el-tooltip>

        <div class="userInfo">
          <img alt :src="userInfo.avatar" /><span>你好，{{userInfo.name}}</span><span>{{date}} {{time}}</span>
        </div>
      </div>
    </el-col>
    <el-col class="center" :span="collapsed ? 1 : 3">
      <el-menu :collapse="collapsed">
        <MenuTree :menuData="this.menuList" @clickMenu="clickMenu"/>
      </el-menu>
    </el-col>
    <el-col class="center" :span="collapsed ? 23 : 21">
      <iframe frameborder="0" :src="menuUrl" style="width: 100%; height: 100%;"></iframe>
    </el-col>

    <el-dialog :close-on-click-modal="false" :title="dialogTitle" :visible.sync="dialogFormVisible">
      <el-form :rules="rules" ref="updPwdForm" :model="updPwd" label-position="right" label-width="120px" style='width: 90%;'>
        <el-form-item :label="$t('updPwd.oldPasswd')" prop="oldPasswd">
          <el-input type="password" v-model="updPwd.oldPasswd" clearable></el-input>
        </el-form-item>
        <el-form-item :label="$t('updPwd.passwd')" prop="passwd">
          <el-input type="password" v-model="updPwd.passwd" clearable></el-input>
        </el-form-item>
        <el-form-item :label="$t('updPwd.confirmPwd')" prop="confirmPwd">
          <el-input type="password" v-model="updPwd.confirmPwd" clearable></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{$t('common.cancel')}}</el-button>
        <el-button type="primary" @click="updatePwd">{{$t('common.edit')}}</el-button>
      </div>
    </el-dialog>
  </el-row>
</template>
<script>
import MenuTree from './MenuTree'
import Screenfull from '@/components/Screenfull'
import lockscreen from 'vue-lockscreen'
import { getToken, removeToken, setCookie, removeCookie, getCookie } from '@/utils/cookie'
import { logout, getUserInfo, unlock } from '@/api/login'
import { updatePwd } from '@/api/user'
import { setUserPerms, removeUserPerms } from '@/utils/permission'

export default {
  components: {
    MenuTree,
    Screenfull,
    lockscreen
  },
  data () {
    const validNewPwd = (rule, value, callback) => {
      if (this.updPwd.passwd !== value) {
        callback(new Error('两次密码不一样'))
      } else {
        callback()
      }
    }
    return {
      collapsed: false,
      locked: false,
      userInfo: {
        avatar: 'https://avatars2.githubusercontent.com/u/22773901?v=4'
      },
      menuList: [],
      menuUrl: '',
      week: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
      date: undefined,
      time: undefined,
      password: undefined,
      dialogTitle: '',
      dialogFormVisible: false,
      updPwd: {
        oldPasswd: undefined,
        passwd: undefined,
        confirmPwd: undefined
      },
      rules: {
        oldPasswd: [
          { required: true, message: '请填写原密码', trigger: 'change' }
        ],
        passwd: [
          { required: true, message: '请填写密码', trigger: 'change' },
          { max: 64, message: '小于64个字符', trigger: 'change' }
        ],
        confirmPwd: [
          { required: true, message: '请确认密码', trigger: 'change' },
          { validator: validNewPwd, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    collapse () {
      this.collapsed = !this.collapsed
    },
    lockScreen () {
      this.password = ''
      setCookie('SCREEN_IS_LOCK', 1)
      this.locked = true
    },
    unlockScreen () {
      unlock(this.password).then(() => {
        removeCookie('SCREEN_IS_LOCK')
        this.locked = false
        location.href = 'home.html'
      }, err => {
        if (err.code === 502) {
          location.reload()
        }
      })
    },
    isLocked () {
      return !!getCookie('SCREEN_IS_LOCK')
    },
    logout () {
      this.__confirm({message: 'tips.confirmLogOut'}).then(() => {
        logout().then(() => {
          removeUserPerms()
          removeToken()
          location.href = 'login.html'
        }).catch((response) => {
          console.log(response.msg)
        })
      })
    },
    handleUpdatePwd () {
      this.updPwd = {
        oldPasswd: undefined,
        passwd: undefined,
        confirmPwd: undefined
      }
      this.dialogFormVisible = true
      this.dialogTitle = this.$t('navbar.updatePwd')
      this.$nextTick(() => {
        this.$refs.updPwdForm.clearValidate()
      })
    },
    updatePwd () {
      const fm = this.$refs.updPwdForm
      fm.validate(valid => {
        console.log(valid)
        if (valid) {
          updatePwd(this.updPwd).then(() => {
            this.dialogFormVisible = false
            this.$message.success({
              message: '修改成功！'
            })
          })
        }
      })
    },
    getUserInfo () {
      getUserInfo().then((response) => {
        this.menuList = response.menuTree
        Object.assign(this.userInfo, response.userInfo)
        setUserPerms(response.perms)
      }).catch((e) => {
        console.log(e)
      })
    },
    clickMenu (data) {
      this.menuUrl = data
    },
    updateTime () {
      const cd = new Date()
      this.time = this.zeroPadding(cd.getHours(), 2) + ':' + this.zeroPadding(cd.getMinutes(), 2) + ':' + this.zeroPadding(cd.getSeconds(), 2)
      this.date = this.zeroPadding(cd.getFullYear(), 4) + '-' + this.zeroPadding(cd.getMonth() + 1, 2) + '-' + this.zeroPadding(cd.getDate(), 2) + ' ' + this.week[cd.getDay()]
    },
    zeroPadding (num, digit) {
      let zero = ''
      for (var i = 0; i < digit; i++) {
        zero += '0'
      }
      return (zero + num).slice(-digit)
    }
  },
  beforeCreate () {
    if (!getToken()) {
      location.href = 'login.html'
    }
  },
  created () {
    this.locked = this.isLocked()
    setInterval(this.updateTime, 1000)
    this.getUserInfo()
  }
}
</script>
<style lang="less">
  @import '../../styles/public.less';
  .container {
    height: 99%;
    .header {
      height: 6%;
      min-height: 60px;
      line-height: 60px;
      background-color: @primary-color;
      color: #fff;
      .logo {
        height: 100%;
        font-size: 22px;
        border-color: rgba(238, 241, 146, .3);
        border-right-style: solid;
        border-right-width: 1px;
        cursor: pointer;
        text-align: center;
      }
      .tools {
        padding: 0 23px;
        height: 60px;
        cursor: pointer;
        width: 96%;
        letter-spacing: 3px;
        float: left;
        .tool {
          height: 16px;
          width: 16px;
        }
        .screenfull {
          height: 16px;
          width: 16px;
          vertical-align: -0.16em;
        }
        .lockScreen {
          .lockScreen-div {
            position: fixed;
            width: 100%;
            height: 100%;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: #1c2b36;
            .unlock-container {
              width: 300px;
              height: 150px;
              position: relative;
              top: 50%;
              left: 50%;
              margin-left: -150px;
              margin-top: -100px;
              .head {
                margin-left: 100px;
                width: 100px;
                height: 100px;
                text-align: center;
                border-radius: 50%;
              }
              .user-name {
                height: 20px;
                text-align: center;
                color: #7793A7;
                margin: 0;
                font-size: 18px;
                line-height: 2px;
              }
              .passwd {
                width: 250px;
                margin-left: 25px;
              }
            }
          }
        }
        .userInfo {
          display: inline-block;
          float: right;
          letter-spacing: 1px;
          img {
            width: 40px;
            height: 40px;
            border-radius: 20px;
            float: right;
            margin-top: 10px;
          }
          span {
            float: right;
            margin-right: 10px;
          }
        }
      }
    }
    .center {
      position: relative;
      top: 0;
      bottom: 0;
      height: 94%;
      .el-menu {
        width: 99%;
        height: 100%;
        background-color: #eef1f6;
        .el-menu-item {
          background-color: white;
        }
        .el-menu-item:hover {
          background-color: rgb(236, 245, 255);
        }
      }
    }
  }
  .el-dialog {
    width: 550px;
  }
</style>
