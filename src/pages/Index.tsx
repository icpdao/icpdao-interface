import React from 'react';
import 'src/stylesheets/pages/Index.css'


function Index() {
  let github_app_client_id = process.env.REACT_APP_GITHUB_APP_CLIENT_ID || ''
  // callbackUrl 在 github app 设置中有白名单
  let callbackUrl = `${window.location.origin}/github/auth_callback`
  let params = new URLSearchParams()
  params.append('redirect_uri', callbackUrl)
  params.append('client_id', github_app_client_id)
  let github_login_url = `https://github.com/login/oauth/authorize?${params.toString()}`

  return (
    <div className="Index">
        <div>
            <a
                rel="noopener noreferrer"
                href={github_login_url}
            >
                github login
            </a>
        </div>
    </div>
  );
}

export default Index;
