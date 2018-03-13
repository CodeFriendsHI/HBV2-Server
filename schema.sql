CREATE TABLE images
  (
    id SERIAL PRIMARY KEY,
    date timestamp with time zone not null default current_timestamp,
    image bytea NOT NULL,
    roomId INT
  );

CREATE TABLE rooms
  (
    id SERIAL PRIMARY KEY,
    name VARCHAR(64),
    stream VARCHAR(256),
    token VARCHAR(256)
  );