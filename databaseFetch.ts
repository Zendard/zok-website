import { FileSystemRouter } from 'bun';
import { UploadedFile } from 'express-fileupload';
import mongoose, { AnyObject } from 'mongoose';
import fs from 'fs';

const mongoUri=Bun.env.MONGODB_URI||'';

const inschrijvingStructure = {
	name: String,
	lid: Boolean,
	email: String,
	riziv: String
};

const kalenderItemStructure = {
	title: String,
	name:String,
	descr:String,
	date: Date,
	img: String,
	location:String,
	time:String,
	cost:Number,
	costMember:Number,
	pqk:Number,
	inschrijven:String
};
const berichtenItemStructure={
	title:String,
	name:String,
	descr:String,
	img:String
};

const kalenderItemSchema = new mongoose.Schema(kalenderItemStructure);
const kalenderItem = mongoose.model('kalenderItem', kalenderItemSchema);
const berichtenItemSchema = new mongoose.Schema(berichtenItemStructure);
const berichtenItem = mongoose.model('berichtenItem', berichtenItemSchema);
const inschrijvingSchema = new mongoose.Schema(inschrijvingStructure);
const inschrijvingItem = mongoose.model('inschrijving', inschrijvingSchema);

async function getKalender(){
	await mongoose.connect(mongoUri);
	const items = await kalenderItem.find();
	console.log('kalender:')
	console.log(items)
	return items;
}

async function getItemInfo(name:string){
	await mongoose.connect(mongoUri);
	const items = await kalenderItem.find({name:name});
	return items[0];
}

async function getBerichtInfo(name:string){
	await mongoose.connect(mongoUri);
	const items = await berichtenItem.find({name:name});
	return items[0];
}

async function addKalender(formdata:AnyObject,img:UploadedFile) {
	const imgPath= `uploads/${formdata.name}${img.name}`;
	img.mv(`./public/${imgPath}`);
	const newItem=new kalenderItem({
		title:formdata.title,
		name:formdata.name,
		descr:formdata.descr,
		date:formdata.date,
		img:imgPath||undefined,
		location:formdata.location,
		time:`${formdata.timeStart.toString()} - ${formdata.timeEnd.toString()}`,
		cost:formdata.cost,
		costMember:formdata.costMember,
		pqk:formdata.pqk,
		inschrijven:formdata.inschrijven
	});
	await mongoose.connect(mongoUri);
	await newItem.save();
}

async function deleteKalender(name:string) {
	await mongoose.connect(mongoUri);
	const items = await kalenderItem.find({name:name});
	const item = items[0];
	if(item.img){
		await fs.unlink(`./public/${item.img}`,(err)=>{if (err) console.log(err);});
	}
	await item.deleteOne();
}

async function getBerichten() {
	await mongoose.connect(mongoUri);
	const items = await berichtenItem.find();
	console.log('berichten:')
	console.log(items)
	return items;
}

async function getBerichtenItemInfo(name:string){
	await mongoose.connect(mongoUri);
	const items = await berichtenItem.find({name:name});
	return items[0];
}

async function addBerichten(formdata:AnyObject,img:UploadedFile) {
	const imgPath= `uploads/${formdata.name}${img.name}`;
	img.mv(`./public/${imgPath}`);
	const newItem=new berichtenItem({
		title:formdata.title,
		name:formdata.name,
		descr:formdata.descr,
		img:imgPath||undefined});
	await mongoose.connect(mongoUri);
	await newItem.save();
}

async function deleteBerichten(name:string) {
	await mongoose.connect(mongoUri);
	const items = await berichtenItem.find({name:name});
	const item = items[0];
	if(item.img){
		await fs.unlink(`./public/${item.img}`,(err)=>{if (err) console.log(err);});
	}
	await item.deleteOne();
}

async function addInschrijving(formdata:AnyObject, kalenderName:string) {
	await mongoose.connect(mongoUri);
	if((await inschrijvingItem.find({riziv:formdata.riziv})).length>0){
		return 'double';
	} else{
		const newItem=new inschrijvingItem({
			name:formdata.name,
			lid:(formdata.lid=='lid')?true:false,
			email:formdata.email,
			riziv:formdata.riziv,
			kalenderName:kalenderName
		});
		await newItem.save();
		return 'success';
	}
}

async function getInschrijving(kalenderName:string) {
	await mongoose.connect(mongoUri);
	const items=await inschrijvingItem.find({kalenderName:kalenderName});
	return items;
}

export {getInschrijving, addInschrijving, getKalender, addKalender, getItemInfo, getBerichtInfo, deleteKalender,getBerichten,getBerichtenItemInfo,addBerichten,deleteBerichten, kalenderItem};