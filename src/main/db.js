import { Client } from "pg";

export default async () => {
    const client = new Client({
        user: "postgres",
        host: "localhost",
        database: "postgres",
        password: "123",
        port: 5432,
    })

    await client.connect();
    console.log("Connected to PostgreSQL");
    return client;
}

