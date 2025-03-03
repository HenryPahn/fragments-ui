# Dockerfile

# Stage 1 - base: Set up env variables 
FROM node:22.12.0-alpine AS base

LABEL maintainer="Henry Pahn <pphan-thanh-hoang@myseneca.ca>"
LABEL description="Fragments-ui node.js microservice"

# We default to use port 8080 in our service
ENV PORT=1234

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

###########################################################################
# Stage 2 - build: Build dependencies
FROM base AS build

# Option 2: relative path - Copy the package.json and package-lock.json
# files into the working dir (/app).  NOTE: this requires that we have
# already set our WORKDIR in a previous step.
COPY package*.json ./

# Install node dependencies defined in package-lock.json
RUN npm ci --production

###########################################################################
# Stage 3 - production: start app
FROM build AS production

# Copy only necessary files from the build stage
COPY --from=build /app/node_modules ./node_modules

# Copy package.json to final stage
COPY package*.json ./

# Copy src to /app/src/
COPY ./src ./src

# Start the container by running our server
CMD ["npm", "start"]

# We run our service on port 8080
EXPOSE 1234
