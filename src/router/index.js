import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/Home.vue'
import SendSms from '../views/SendSms.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/sendsms/:code',
    name: 'SendSms',
    component: SendSms
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: {
      name: 'Home'
    }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
