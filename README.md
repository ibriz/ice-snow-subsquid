# ice-snow-subsquid

## Prerequisites

-   node 16.x
-   docker
-   npm -- note that `yarn` package manager is not supported

## Quickly running the sample

Example commands below use [make(1)](https://www.gnu.org/software/make/).
Please, have a look at commands in [Makefile](Makefile) if your platform doesn't support it.
On Windows we recommend to use [WSL](https://docs.microsoft.com/en-us/windows/wsl/).

```bash
# 1. Run Archive
cd archive
docker-compose up -d

# 2. Install dependencies
npm ci

# 3. Compile typescript files
make build

# 4. Start target Postgres database and detach
make up

# 5. Start the processor
make process

# 6. The command above will block the terminal
#    being busy with fetching the chain data,
#    transforming and storing it in the target database.
#
#    To start the graphql server open the separate terminal
#    and run
make serve
```
