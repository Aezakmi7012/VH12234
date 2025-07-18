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

    if (!allValidPackages.includes(package.toLowerCase())) {
        console.error(`Invalid package: ${package}`);
        return;
    }

    const logData = {
        "stack": stack.toLowerCase(),
        "level": level.toLowerCase(),
        "package": package.toLowerCase(),
        "message": message
    };
    try{
        const authToken = bearerToken || process.env.LOG_API_TOKEN;
        
        if (!authToken) {
            console.error('No authorization token available');
            return;
        }

     /*  const response = await axios.post('http://20.244.56.144/evaluation-service/logs', logData, {
            headers: {
                "Content-Type" : "application/json",
                'Authorization': `Bearer ${authToken}`
            },
        });
        console.log(response.data);        
        return response.data;  */
        console.log("logged");
        return; 
    }
    catch(e){
        console.error('Error logging data:', e.message);
        return { error: 'Failed to log data' };
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
            `Unhandled error`, 
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