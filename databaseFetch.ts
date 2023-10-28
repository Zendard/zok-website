import { FileSystemRouter } from 'bun';
import { UploadedFile } from 'express-fileupload';
import mongoose, { AnyObject } from 'mongoose';
import fs from 'fs'

const mongoUri=Bun.env.MONGODB_URI||''

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
};
const berichtenItemStructure={
	title:String,
	name:String,
	descr:String,
	img:String
}

const kalenderItemSchema = new mongoose.Schema(kalenderItemStructure);
const kalenderItem = mongoose.model('kalenderItem', kalenderItemSchema);
const berichtenItemSchema = new mongoose.Schema(berichtenItemStructure);
const berichtenItem = mongoose.model('berichtenItem', berichtenItemSchema);

async function getKalender(){
	await mongoose.connect(mongoUri);
	const items = await kalenderItem.find();
	return items;
}

async function getItemInfo(name:String){
	await mongoose.connect(mongoUri);
	const items = await kalenderItem.find({name:name});
	return items[0];
}

async function addKalender(formdata:AnyObject,img:UploadedFile) {
	const imgPath= `uploads/${formdata.name}${img.name}`
	img.mv(`./public/${imgPath}`)
	const newItem=new kalenderItem({title:formdata.title,name:formdata.name,descr:formdata.descr.replaceAll('\n','<br>'),date:formdata.date,img:imgPath||undefined,location:formdata.location,time:`${formdata.timeStart.toString()} - ${formdata.timeEnd.toString()}`,cost:formdata.cost,costMember:formdata.costMember})
	console.log(newItem)
	await mongoose.connect(mongoUri);
	await newItem.save();
}

async function deleteKalender(name:String) {
	await mongoose.connect(mongoUri);
	const items = await kalenderItem.find({name:name})
	const item = items[0]
	if(item.img){
		await fs.unlink(`./public/${item.img}`,(err)=>{if (err) console.log(err);})
	}
	await item.deleteOne()
}

async function getBerichten() {
	await mongoose.connect(mongoUri);
	const items = await berichtenItem.find();
	return items;
}

async function getBerichtenItemInfo(name:String){
	await mongoose.connect(mongoUri);
	const items = await berichtenItem.find({name:name});
	return items[0];
}

async function addBerichten(formdata:AnyObject,img:UploadedFile) {
	const imgPath= `uploads/${formdata.name}${img.name}`
	img.mv(`./public/${imgPath}`)
	const newItem=new berichtenItem({title:formdata.title,name:formdata.name,descr:formdata.descr.replaceAll('\n','<br>'),img:imgPath||undefined})
	await mongoose.connect(mongoUri);
	await newItem.save();
}

async function deleteBerichten(name:String) {
	await mongoose.connect(mongoUri);
	const items = await berichtenItem.find({name:name})
	const item = items[0]
	if(item.img){
		await fs.unlink(`./public/${item.img}`,(err)=>{if (err) console.log(err);})
	}
	await item.deleteOne()
}

export {getKalender, addKalender, getItemInfo, deleteKalender,getBerichten,getBerichtenItemInfo,addBerichten,deleteBerichten};