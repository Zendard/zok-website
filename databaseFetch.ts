import mongoose, { AnyObject } from 'mongoose';

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
const kalenderItemSchema = new mongoose.Schema(kalenderItemStructure);
const kalenderItem = mongoose.model('kalenderItem', kalenderItemSchema);

async function getKalender(){
	await mongoose.connect(mongoUri);
	const items = await kalenderItem.find();
	return items;
}

async function getItemInfo(title:String){
	await mongoose.connect(mongoUri);
	const items = await kalenderItem.find({name:title});
	return items[0];
}

async function addKalender(formdata:AnyObject) {
	const newItem=new kalenderItem({title:formdata.title,name:formdata.name,descr:formdata.descr.replaceAll('\n','<br>'),date:formdata.date,img:formdata.img,location:formdata.location,time:`${formdata.timeStart.toString()} - ${formdata.timeEnd.toString()}`,cost:formdata.cost,costMember:formdata.costMember})
	await mongoose.connect(mongoUri);
	await newItem.save();
}

async function deleteKalender(name:String) {
	await mongoose.connect(mongoUri);
	const item = await kalenderItem.find({name:name})
	await item[0].deleteOne()
}

export {getKalender, addKalender, getItemInfo, deleteKalender};