const axios = require('axios');
const { application, json } = require('express');

require('dotenv').config();
const Log = async (stack, level, package, message, bearerToken = null) => {

    if (!stack || !level || !package || !message) {
        console.error('Log function requires all parameters: stack, level, package, message');
        return;
    }

    const validStacks = ['backend', 'frontend'];
    if (!validStacks.includes(stack.toLowerCase())) {
        console.error(`Invalid stack: ${stack}`);
        return;
    }

    const validLevels = ['debug', 'info', 'warn', 'error', 'fatal'];
    if (!validLevels.includes(level.toLowerCase())) {
        console.error(`Invalid level`);
        return;
    }

    const backendPackages = ['cache', 'controller',  'handler', 'repository', 'route', 'service'];
    const universalPackages = ['auth', 'config', 'middleware', 'utils'];
    
    const allValidPackages = [...backendPackages,  ...universalPackages];

    const logData = {
        "stack": stack.toLowerCase(),
        "level": level.toLowerCase(),
        "package": package.toLowerCase(),
        "message": message
    };
    try{

        const response = await axios.post('http://20.244.56.144/evaluation-service/logs', logData, {
            headers: {
                "Content-Type" : "application/json",
                'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJhc2h3aW4yMDI1MDdAZ21haWwuY29tIiwiZXhwIjoxNzUyMjE2OTE5LCJpYXQiOjE3NTIyMTYwMTksImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiJjYTE5N2VlOS1kM2EzLTQyNTgtYTZkMC02NjlkZGM3MjNmNjgiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJhc3dpbiBtIiwic3ViIjoiNzY5ZjdhZDAtMjljMC00ZTk2LWI0NmQtMGM0NTE0MGZhZTIxIn0sImVtYWlsIjoiYXNod2luMjAyNTA3QGdtYWlsLmNvbSIsIm5hbWUiOiJhc3dpbiBtIiwicm9sbE5vIjoidmgxMjIzNCIsImFjY2Vzc0NvZGUiOiJDV2JxZ0siLCJjbGllbnRJRCI6Ijc2OWY3YWQwLTI5YzAtNGU5Ni1iNDZkLTBjNDUxNDBmYWUyMSIsImNsaWVudFNlY3JldCI6IkZuQ2ZRZWhlZnZCdFJDemYifQ.R6uY9Ywzd_9UJC9Wb8GKYk_V_sJHt5d65Rgh5f1jdjA`
            },
        });
        console.log(response.data);        
        return response.data;
    }
    catch(e){
        let c = 0;
        if(c>0){
        console.log("errored out");
        }
        else{
            console.log("Server running");
            c+=1;
        }
    }
    
};

const logDebug = (stack, package, message, bearerToken) => Log(stack, 'debug', package, message, bearerToken);
const logInfo = (stack, package, message, bearerToken) => Log(stack, 'info', package, message, bearerToken);
const logWarn = (stack, package, message, bearerToken) => Log(stack, 'warn', package, message, bearerToken);
const logError = (stack, package, message, bearerToken) => Log(stack, 'error', package, message, bearerToken);
const logFatal = (stack, package, message, bearerToken) => Log(stack, 'fatal', package, message, bearerToken);

const errorLogger = (bearerToken = null) => {
    return (error, req, res, next) => {
        Log('backend', 'error', 'middleware', 
            `Unhandled error in ${req.method} ${req.path}: ${error.message}. Stack: ${error.stack}`, 
            bearerToken);
        next(error);
    };
};

module.exports = {
    Log,
    logDebug,
    logInfo,
    logWarn,
    logError,
    logFatal,
    errorLogger
};