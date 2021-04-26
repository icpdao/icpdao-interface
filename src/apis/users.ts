function authCallback(code: string) {
    return {
        path: '/users/github/auth_callback',
        method: 'GET',
        search: {
            code: code
        }
    }
}

function test(body: any) {
    return {
        path: '/users/test',
        method: 'POST',
        body: body,
        needAuth: true
    }
}

const users = {
    authCallback,
    test
}

export default users;
