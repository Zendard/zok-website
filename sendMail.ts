import nodemailer from 'nodemailer';
import { Address } from 'nodemailer/lib/mailer';

// if(!Bun.env.EMAIL_NAME||!Bun.env.EMAIL_PASSWD||!Bun.env.EMAIL_TO){
// 	throw new Error('Please set email name, passwd and/or to env');
// }

const transporter = nodemailer.createTransport({
	port:587,
	host:'smtp.office365.com',
	auth: {
		user: Bun.env.EMAIL_NAME,
		pass: Bun.env.EMAIL_PASSWD
	},
	debug:true,
	logger:true
});

const sendMail = (name:string|Address|undefined, subject:string, text:string, cb:any) => {
	const mailOptions = {
		sender: name,
		from: Bun.env.EMAIL_NAME,
		to: Bun.env.EMAIL_TO,
		subject: subject,
		text: text
	};

	transporter.sendMail(mailOptions);};

export default sendMail;