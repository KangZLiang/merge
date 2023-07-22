import request from '@/utils/request'

export function blogLastActive() {
  return request({
    url: 'Reptile/lastActive',
    method: 'get'
  })
}

export function getGitPath() {
  return request({
    url: 'openapi/getGitPath',
    method: 'get'
  })
}
