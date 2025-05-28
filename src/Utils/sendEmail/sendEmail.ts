import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';
import { emailConfig } from '../../../config/email-config';

interface EmailData {
    [key: string]: any;
}

export async function sendEmail(
    to: string,
    sender: string,
    subject: string,
    templateName: string,
    data: EmailData
): Promise<void> {
    const transporter = nodemailer.createTransport(emailConfig);
    const headerTemplate = handlebars.compile(fs.readFileSync(`./src/Email/layout/header.hbs`, 'utf8'));
    const footerTemplate = handlebars.compile(fs.readFileSync('./src/Email/layout/footer.hbs', 'utf8'));
    const template = handlebars.compile(fs.readFileSync(`./src/Email/templates/${templateName}.hbs`, 'utf8'));
    const recipients = to.split(',').map(email => email.trim());
    data.url = process.env.API_URL;

    // Enregistrement des helpers handlebars de manière concise
    const helpers: Record<string, Handlebars.HelperDelegate> = {
        parseJSON: (context: string) => {
            try {
                return JSON.parse(context);
            } catch (error) {
                console.error('Erreur de parsing JSON:', error);
                return [];
            }
        },
        json: (context: any) => JSON.stringify(context, null, 2),
        log: (context: any) => { console.log(context); return ''; },
        getNameRole: (index: number) => data.roles?.[index]?.name,
        getByRoleId: (index: number) => data.roles?.[index]?._id,
        siteUrl: () => process.env.SITE_URL,
        token: () => data.token,
    };
    Object.entries(helpers).forEach(([key, fn]) => handlebars.registerHelper(key, fn));

    const html = template({ header: headerTemplate, footer: footerTemplate, ...data });
    await Promise.all(
        recipients.map(recipient =>
            transporter.sendMail({ from: sender, to: recipient, subject, html })
        )
    );
}
