import mongoose from 'mongoose';

const kalenderItemSchema = new mongoose.Schema({
	title: String,
	name:String,
	descr:String,
	date: Date,
	img: String,
	location:String,
	time:String,
	cost:Number,
	costMember:Number,
});
const kalenderItem = mongoose.model('kalenderItem', kalenderItemSchema);

async function getKalender(){
	await mongoose.connect(Bun.env.MONGODB_URI||'');
	const items = await kalenderItem.find();
	return items;
}

export {getKalender};