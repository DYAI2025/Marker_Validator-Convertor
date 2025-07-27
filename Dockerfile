# Marker Validator Docker Image
FROM node:18-alpine

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/cli/package.json ./packages/cli/
COPY packages/gui/package.json ./packages/gui/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build CLI
RUN cd packages/cli && pnpm build

# Create volume for marker files
VOLUME /app/markers
VOLUME /app/out

# Expose port for GUI (if needed)
EXPOSE 3000

# Set default command
CMD ["node", "packages/cli/bin/cli.js", "--help"]
