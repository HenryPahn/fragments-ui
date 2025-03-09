# fragments-ui
Fragments UI testing web app

## Important Commands

- Start the project: 

```sh 
npm start 
```

- Build the project: 

```sh 
npm run build 
```

> [!NOTE]
> Parcel is used to bundle JS, manage env variables, and provide hot-reloading(Same to nodemon). Running build command is mandatory for updating any change in the fragment ui project. Otherwise, it is only running the result from the last build. 

## Environtment file 
- Switch API URL between local host and AWS EC2 instance: 
    API_URL

## Docker 
- Build docker images: 
```sh 
docker build --build-arg AWS_COGNITO_POOL_ID=<AWS_COGNITO_POOL_ID>  --build-arg AWS_COGNITO_CLIENT_ID=<AWS_COGNITO_CLIENT_ID> --build-arg OAUTH_SIGN_IN_REDIRECT_URL=http://localhost:1234 -t fragments-ui .
```

> [!NOTE]
> The final layer of Docker is Nginx. When Docker container is running, Nginx can't read data from .env which contains AWS keys. Therefore, we must pass those secret as agrs to build stage, and Nginx will use it for production later. 


- Run docker containers: 
```sh
docker run --rm --name fragments-ui --env-file .env -p 1234:80 fragments-ui:latest
```

