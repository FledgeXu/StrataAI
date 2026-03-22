CREATE TABLE IF NOT EXISTS app_users (
	id BIGSERIAL PRIMARY KEY,
	email VARCHAR(320) NOT NULL UNIQUE,
	password_hash VARCHAR(100) NOT NULL,
	display_name VARCHAR(120) NOT NULL,
	role VARCHAR(40) NOT NULL,
	status VARCHAR(40) NOT NULL,
	created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refresh_sessions (
	id BIGSERIAL PRIMARY KEY,
	user_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
	token_hash VARCHAR(64) NOT NULL UNIQUE,
	expires_at TIMESTAMP(3) NOT NULL,
	revoked_at TIMESTAMP(3),
	created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_refresh_sessions_user_id ON refresh_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_sessions_expires_at ON refresh_sessions(expires_at);
