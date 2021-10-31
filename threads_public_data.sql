create table data
(
    id uuid
);

alter table data
    owner to postgres;

create unique index data_id_uindex
    on data (id);

INSERT INTO data
SELECT md5(random()::text || clock_timestamp()::text)::uuid
FROM generate_series(1, 1000000) s(i);
