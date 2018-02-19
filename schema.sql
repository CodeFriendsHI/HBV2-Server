CREATE TABLE images
  (
    id SERIAL PRIMARY KEY,
    date timestamp with time zone not null default current_timestamp,
    image VARBINARY(max) NOT NULL,
    roomId INT
  );
