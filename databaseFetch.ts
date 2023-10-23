import mongoose from 'mongoose';

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
	await mongoose.connect(Bun.env.MONGODB_URI||'');
	const items = await kalenderItem.find();
	return items;
}

async function getItemInfo(title:string){
	await mongoose.connect(Bun.env.MONGODB_URI||'');
	const items = await kalenderItem.find({name:title});
	return items[0];
}

async function postKalender(item:typeof kalenderItemStructure) {
	await mongoose.connect(Bun.env.MONGODB_URI||'');
	const newItem=new kalenderItem(item);
	await newItem.save();
}

export {getKalender, postKalender, getItemInfo};