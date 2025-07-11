const axios = require("axios");
const response =async() =>{
    const res = await axios.post('http://20.244.56.144/evaluation-service/logs', {
"stack": "backend",
"level": "error",
"package": "handler",
"message": "received string, expected bool"
}, {
            headers: {
                "Content-Type" : "application/json",
                'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJhc2h3aW4yMDI1MDdAZ21haWwuY29tIiwiZXhwIjoxNzUyMjE2OTE5LCJpYXQiOjE3NTIyMTYwMTksImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiJjYTE5N2VlOS1kM2EzLTQyNTgtYTZkMC02NjlkZGM3MjNmNjgiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJhc3dpbiBtIiwic3ViIjoiNzY5ZjdhZDAtMjljMC00ZTk2LWI0NmQtMGM0NTE0MGZhZTIxIn0sImVtYWlsIjoiYXNod2luMjAyNTA3QGdtYWlsLmNvbSIsIm5hbWUiOiJhc3dpbiBtIiwicm9sbE5vIjoidmgxMjIzNCIsImFjY2Vzc0NvZGUiOiJDV2JxZ0siLCJjbGllbnRJRCI6Ijc2OWY3YWQwLTI5YzAtNGU5Ni1iNDZkLTBjNDUxNDBmYWUyMSIsImNsaWVudFNlY3JldCI6IkZuQ2ZRZWhlZnZCdFJDemYifQ.R6uY9Ywzd_9UJC9Wb8GKYk_V_sJHt5d65Rgh5f1jdjA`
            },
        });
        console.log(res.data);
        return res;

    }
response();
