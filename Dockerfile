# Stage 1: The Builder
# This stage installs all dependencies (prod and dev), builds the app,
# and then prunes the dev dependencies to create a clean 'node_modules' folder.
FROM node:22-alpine3.21 AS builder
 
# Default to 'production' if not specified
ARG PROFILE=production
 
WORKDIR /app
 
COPY package*.json ./
 
RUN npm ci --prefer-offline --no-audit --progress=false \
    && npm cache clean --force
 
COPY . .
 
RUN npm run "build:ssr:${PROFILE}"  
RUN npm prune --production 
# RUN node-prune
 
# Stage 2: The Runner
# This stage creates the final, lean, and secure production image.
# It uses a slim Node.js image and runs as a non-root user.
FROM node:22-alpine3.21 AS runner
 
WORKDIR /app
 
ENV NODE_ENV=production
ENV PORT=60003
 
RUN addgroup -S angular && adduser -S angular -G angular
 
COPY --from=builder --chown=angular:angular /app/node_modules ./node_modules
COPY --from=builder --chown=angular:angular /app/dist ./dist
COPY --from=builder --chown=angular:angular /app/package.json ./package.json
 
USER angular
 
EXPOSE 60003
 
CMD ["npm", "run", "serve:ssr"]