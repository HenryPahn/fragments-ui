# Dockerfile

# Stage 1 - base: Set up env variables 
FROM node:22.12.0-alpine AS build

LABEL maintainer="Henry Pahn <pphan-thanh-hoang@myseneca.ca>"
LABEL description="Fragments-ui node.js microservice"

# Define build arguments
ARG AWS_COGNITO_POOL_ID
ARG AWS_COGNITO_CLIENT_ID
ARG OAUTH_SIGN_IN_REDIRECT_URL

# Set them as environment variables for the build process
ENV AWS_COGNITO_POOL_ID=$AWS_COGNITO_POOL_ID
ENV AWS_COGNITO_CLIENT_ID=$AWS_COGNITO_CLIENT_ID
ENV OAUTH_SIGN_IN_REDIRECT_URL=$OAUTH_SIGN_IN_REDIRECT_URL

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# Optimizae Node.js apps for production
ENV NODE_ENV=production

# Use /app as our working directory
WORKDIR /app

# Option 2: relative path - Copy the package.json and package-lock.json
# files into the working dir (/app).  NOTE: this requires that we have
# already set our WORKDIR in a previous step.
COPY package*.json ./

# Install node dependencies defined in package-lock.json
RUN npm ci --production

# Copy src to /app/src/
COPY ./src ./src

RUN npm run build

# ###########################################################################
# # Stage 2 - production: start app
FROM nginx:alpine AS production

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

# Copy only necessary files from the build stage
COPY --from=build /app/dist .

# We run our service on port 8080
EXPOSE 80

# Start the container by running our server
CMD ["nginx", "-g", "daemon off;"]

