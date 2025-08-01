import { createRouter, createWebHistory } from 'vue-router'
import UploadView from '@/views/UploadView.vue'
import FileManagementView from '@/views/FileManagementView.vue'

const routes = [
  {
    path: '/',
    name: 'Upload',
    component: UploadView
  },
  {
    path: '/file-management',
    name: 'FileManagement',
    component: FileManagementView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 