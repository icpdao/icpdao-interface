import React, {useEffect} from 'react';
import {useLocation, useHistory} from "react-router-dom";
import request, {logic} from 'src/apis/index';


function AuthCallback() {
    const location = useLocation();
    const history = useHistory();
    useEffect(() => {
        let code = new URLSearchParams(location.search).get('code')
        request(logic.users.authCallback, code)
            .then(function (response) {
                localStorage.setItem('jwt', response.data.jwt);
                history.push('/home')
            })
            .catch(function (error) {
                console.log(error);
            });
    });
    return (
        <div>
            正在登陆，请稍后
        </div>
    );
}

export default AuthCallback;
