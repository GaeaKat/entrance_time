import dotenv from "dotenv";

dotenv.config();

const { DISCORD_TOKEN, WELCOME_CHANNEL, STAFF_CHANNEL, MEMBER_ROLE } = process.env;

if (!DISCORD_TOKEN || !WELCOME_CHANNEL || !STAFF_CHANNEL || !MEMBER_ROLE) {
    throw new Error("Missing environment variables");
}

export const config = {
    DISCORD_TOKEN,
    WELCOME_CHANNEL,
    STAFF_CHANNEL,
    MEMBER_ROLE
};
