CREATE TABLE images
  (
    id SERIAL PRIMARY KEY,
    date timestamp with time zone not null default current_timestamp,
    image bytea NOT NULL,
    roomId INT
  );
