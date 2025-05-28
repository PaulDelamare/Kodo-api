export const emailConfig = {
    // host: process.env.SMTP_HOST,
    // port: parseInt(process.env.SMTP_PORT),
    // secure: true,
    service: "gmail",
    auth: {
        // eslint-disable-next-line no-undef
        user: process.env.SMTP_USER,
        // eslint-disable-next-line no-undef
        pass: process.env.SMTP_PASSWORD,
    },
    // tls: {
    //      rejectUnauthorized: false
    // }
};