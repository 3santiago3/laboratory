const Mock = require('mockjs')

const tokens = {
  admin: {
    token: 'admin-token'
  },
  editor: {
    token: 'editor-token'
  }
}

const users = {
  'admin-token': {
    roles: ['admin'],
    introduction: 'I am a super administrator',
    avatar:
      'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    name: 'Super Admin'
  },
  'editor-token': {
    roles: ['editor'],
    introduction: 'I am an editor',
    avatar:
      'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    name: 'Normal Editor'
  }
}

module.exports = [
  // 登录
  {
    url: '/mock/zdp-auth/oauth/token',
    type: 'post',
    response: config => {
      return Mock.mock({
        access_token: 'mock_access_token',
        account: 'gem210',
        avatar: '@image',
        expires_in: 3600,
        license: 'powered by zenithsun',
        nick_name: '管理员',
        refresh_token: 'mock_refresh_token',
        role_id: '1123598816738675201',
        role_name: 'administrator',
        token_type: 'bearer',
        user_id: '1123598821738675201'
      })
    }
  },

  // get user info
  {
    url: '/mock/user/info.*',
    type: 'get',
    response: config => {
      const { token } = config.query
      const info = users[token]

      // mock error
      if (!info) {
        return {
          code: 50008,
          message: 'Login failed, unable to get user details.'
        }
      }

      return {
        code: 20000,
        data: info
      }
    }
  },

  // user logout
  {
<<<<<<< HEAD
    url: '/vue-element-admin/user/logout',
=======
    url: '/mock/user/logout',
>>>>>>> bd732106d4763f96cdbd764d183118ccd2d814da
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  }
]
