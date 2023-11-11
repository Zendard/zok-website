import nodemailer from 'nodemailer';
import { Address } from 'nodemailer/lib/mailer';

if(!Bun.env.EMAIL_NAME||!Bun.env.EMAIL_PASSWD||!Bun.env.EMAIL_TO||!Bun.env.CLIENT_ID||!Bun.env.CLIENT_SECRET||!Bun.env.REFRESH_TOKEN||!Bun.env.ACCES_TOKEN){
	throw new Error('Please set email name, passwd, client_id, client_secret, refresh token, to and/or refresh token env');
}

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        type: 'OAuth2',
        user: Bun.env.EMAIL_NAME,
        clientId: Bun.env.CLIENT_ID,
        clientSecret: Bun.env.CLIENT_SECRET,
        refreshToken: Bun.env.REFRESH_TOKEN,
        accessToken: Bun.env.ACCES_TOKEN
    }
});

const sendMail = (name:string|Address|undefined, subject:string, text:string, cb:any) => {
	const mailOptions = {
		sender: name,
		from: Bun.env.EMAIL_NAME,
		to: Bun.env.EMAIL_TO,
		subject: subject,
		text: text
	};

	transporter.sendMail(mailOptions);
	transporter.close()};

export default sendMail;
