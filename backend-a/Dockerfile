# Use official Node.js LTS image
FROM node:18

# Set workdir
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy app code
COPY . .

# Expose port
EXPOSE 3001

# Start app
CMD ["node", "index.js"]