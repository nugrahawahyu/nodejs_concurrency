# Concurrency in nodejs
Compare normal server vs server with dedicated child processes for heavy task

# Prerequisite
- docker
- docker-compose
- nodejs

# Setup
## Install dependencies
```
yarn
```

## Run servers
- Activate scenario (1-4)
  format:
  ```
  yarn run run-scenario-n
  ```
  example:
  ```
  yarn run run-scenario-1
  ```

## Container stats
Run this command in another terminal.
```
docker stats
```

# Load test
Run this command in another terminal.
format:
```
CONCURRENCY=N node load_test.js
```
example:
```
CONCURRENCY=100 node load_test.js
```
