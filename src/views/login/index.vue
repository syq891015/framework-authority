<template>
  <el-form :model="loginForm" :rules="loginRules" ref="loginForm" label-position="left" label-width="0" class="login-container">
    <h3 class="title">{{$t('login.title')}}</h3>
    <el-form-item prop="username">
      <el-input autofocus clearable type="text" v-model="loginForm.username" :placeholder="$t('login.username')"></el-input>
    </el-form-item>
    <el-form-item prop="password">
      <el-input clearable :type="passwordType" v-model="loginForm.password" :placeholder="$t('login.password')">
        <span slot="append" @click="showPwd" style="cursor: pointer;">
          <svg-icon icon-class="eye" />
        </span>
      </el-input>
    </el-form-item>
    <el-form-item prop="captcha">
      <el-input clearable type="text" v-model="loginForm.captcha" :placeholder="$t('login.captcha')" @keyup.enter.native="handleLogin"></el-input>
    </el-form-item>
    <div style="margin: -5px 0 10px;">
      <img :src="captcha" @click="getCaptcha" style="" :placeholder="$t('login.captcha')" :alt="$t('login.captcha')" />
      <a href="#" style="text-decoration: none;" @click="getCaptcha">{{$t('tips.reClickCaptcha')}}</a>
    </div>
    <el-form-item style="width:100%;">
      <el-button type="primary" style="width:100%;" @click.native.prevent="handleLogin" :loading="loading">{{$t('login.logIn')}}</el-button>
    </el-form-item>
  </el-form>
</template>
<script>
import { login } from '@/api/login'
import { setToken } from '@/utils/cookie'

export default {
  name: 'login',
  data () {
    return {
      loginForm: {
        username: '',
        password: '',
        captcha: ''
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', message: this.$t('tips.requireUserName') }],
        captcha: [{ required: true, trigger: 'blur', message: this.$t('tips.requireCaptcha') }]
      },
      passwordType: 'password',
      loading: false,
      captcha: undefined
    }
  },
  methods: {
    showPwd () {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
    },
    getCaptcha () {
      this.captcha = process.env.BASE_API + '/login/captcha?_t=' + new Date().getTime()
    },
    handleLogin () {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          login(this.loginForm).then((response) => {
            setToken(response.data)
            this.loading = false
            location.href = 'home.html'
          }).catch((response) => {
            this.loading = false
            this.$message.error(response.msg)
            if (response.code === 501) {
              this.loginForm.captcha = ''
            }
            this.getCaptcha()
          })
        } else {
          return false
        }
      })
    }
  },
  created () {
    this.getCaptcha()
  }
}

</script>
<style lang="less" scoped>
  @import '../../styles/public.less';
  .fade-enter-active,
  .fade-leave-active {
    transition: all .2s ease;
  }
  .fade-enter,
  .fade-leave-active{
    opacity: 0;
  }
  .login-container {
    -webkit-border-radius: 5px;
    border-radius: 5px;
    -moz-border-radius: 5px;
    background-clip: padding-box;
    margin: 180px auto;
    width: 350px;
    padding: 35px 35px 15px 35px;
    background: #fff;
    border: 1px solid #eaeaea;
    box-shadow: 0 0 25px #cac6c6;
    .title {
      margin: 0 auto 40px auto;
      text-align: center;
      color: #505458;
    }
  }
</style>
