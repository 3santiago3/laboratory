import request from '@/utils/request'

export function getLicenseServerInfos() {
  return request({
    url: '/license/getServerInfos',
    method: 'get'
  })
}

export function postLicenseGenerate(params) {
  return request({
    url: '/license/generate',
    method: 'post',
    data: params
  })
}
