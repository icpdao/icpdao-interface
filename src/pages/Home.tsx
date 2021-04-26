import React, {useEffect, useState} from 'react';

import request, {logic} from 'src/apis/index';


function Home() {
    const [content, setContent] = useState('');
    useEffect(() => {
        let body = {
            "a": 1
        }
        if (!content) {
            request(logic.users.test, body)
                .then(function (response) {
                    setContent(JSON.stringify(response.data))
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
    });
  return (
    <div>
        content is {content}
    </div>
  );
}

export default Home;
