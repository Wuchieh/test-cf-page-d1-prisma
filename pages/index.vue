<template>
  <div>
    <div>
      <label for="username">username</label>
      <input id="username" type="text" v-model="formData.username" />
    </div>
    <div>
      <label for="password">password</label>
      <input id="password" type="text" v-model="formData.password" />
    </div>
    <div>
      <label for="name">name</label>
      <input id="name" type="text" v-model="formData.name" />
    </div>

    <div>
      <button @click="login">login</button>
      <button @click="register">register</button>
      <button @click="getInfo">getInfo</button>
    </div>

    <div>
      <div>token:{{ token }}</div>
      <div>data:{{ userinfo }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import axios from 'axios'
  import type { WResponse } from '~/utils/api'

  const token = ref('')
  const userinfo = ref<any>({})
  const formData = ref({
    username: '',
    password: '',
    name: '',
  })

  const login = () => {
    axios({
      method: 'post',
      url: '/api/account/login',
      data: formData.value,
    })
      .then((res) => {
        token.value = (res.data as WResponse).data
      })
      .catch((err) => {
        console.log(err)
      })
  }
  const register = () => {
    axios({
      method: 'post',
      url: '/api/account/register',
      data: formData.value,
    })
      .then((res) => {
        console.log(res)
      })
      .catch((err) => {
        console.log(err)
      })
  }
  const getInfo = () => {
    axios({
      method: 'get',
      url: '/api/account/info',
      headers: {
        Authorization: token.value,
      },
    })
      .then((res) => {
        userinfo.value = (res.data as WResponse).data
      })
      .catch((err) => {
        console.log(err)
      })
  }
</script>

<style scoped></style>
