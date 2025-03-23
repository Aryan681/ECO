
FROM node:18-alpine


ENV NODE_ENV=production
ENV PORT=3000


RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app


COPY package.json package-lock.json ./

# Install dependencies 
RUN npm install

# Copy the  application code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Change ownership of the app directory to the non-root user
RUN chown -R appuser:appgroup /app

# Switch to the non-root user
USER appuser

# Expose the port the app will run on
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]