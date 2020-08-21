exports.handler = (event, context, callback) => {
    
    const username = process.env.username;
    const password = process.env.password;
    const apiKey = process.env.apiKey;
    
    let formData = event["body"];
    
    formData = formData.split("&");
    
    const u_username = formData[0].split("=")[1];
    const u_password = formData[1].split("=")[1];
    
    if(username == u_username && password == u_password){
        const response = {
        statusCode: 301,
        headers: {
            Location: `http://184723g-emr.s3-website-ap-southeast-1.amazonaws.com/index.html?key=${apiKey}`,
        }
    };
    
    return callback(null, response);
    }
    
    else{
        const response = {
            statusCode: 301,
            headers: {
                Location: 'http://184723g-emr.s3-website-ap-southeast-1.amazonaws.com',
            }
        }
        return callback(null, response);
    }
}
