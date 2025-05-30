# Running
## Required environment variables
- `ROCKET_SECRET_KEY`
- `ADMIN_PASSWORD`
- `DB_PASSWORD`
- `UPLOADS_PATH`
## Commands
`surreal start --bind 0.0.0.0:5000 -u root -p $DB_PASSWORD`
`cargo run --release`
