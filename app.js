const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const uri               = 'mongodb://localhost:27017/BookingHotel';
const { Hotel }         = require('./database/hotel-coll');
const { Location }      = require('./database/location-coll.js');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({}));
app.use(cors({origin: true, credentials: true}));

app.get('/', (req, res) => {
    res.send("Welcome NodeJs");
})


//Thêm địa danh
app.post('/add-location', async (req, res) => {
    try {
        let { name, image } = req.body;
        console.log({ name, image });
        let newLocation = new Location({ name, image });
        let locationAfterSave = await newLocation.save();
        if(locationAfterSave){
            res.json({message: 'Thêm thành công', data: locationAfterSave})
        }else{
            res.json({message: 'Thêm thất bại'})
        }
    } catch (e) {
        res.json({message: 'Thêm thất bại'})
    }
})

//Xóa địa danh
app.get('/location/:locationID', async (req, res) => {
    let { locationID } = req.params;
    console.log({ locationID });
    let locationRemove = await Location.findByIdAndDelete({ _id: locationID });
    res.json({message: 'Xóa thành công', locationRemove: locationRemove});
})

//Thêm data hotel
app.post('/add-hotel', async (req, res) => {
    let { nameRoom, img, detailLocation, detailRoom, price, location } = req.body;
    console.log({ nameRoom, location }, );
    let newHotel = new Hotel({ nameRoom, img, detailLocation, detailRoom, price, location });
    let hotelAfterSave = await newHotel.save();
    res.json(hotelAfterSave)
})

//Lấy danh sách hotel
app.get('/list-hotel', async (req, res) => {
    let { locationID} = req.query;
    console.log({ locationID});
    let listHotel;
    
    if(locationID){
        listHotel = await Hotel.find({ location: locationID });
    }else{
        listHotel = await Hotel.find();
    }

    console.log({ listHotel });

    res.json(listHotel);
})
// Chỉnh sửa hotel theo id
app.patch('/update-hotel/:hotelID', async (req, res) => {
    try {
        let { hotelID } = req.params;
        console.log({hotelID});
        let {nameRoom, img, detailRoom, detailLocation, price} = req.body;
        const options = { new: true };
        let updateHotel = await Hotel.findByIdAndUpdate( {_id: hotelID}, {nameRoom, img, detailRoom, detailLocation, price}, options);
        res.send(updateHotel);
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
    
})

//Lấy danh sách hotel theo địa danh
app.get('/list-hotel/:locationID', async (req, res) => {
    let { locationID } = req.params;
    console.log({ locationID });
    let listHotel = await Hotel.find({ location: locationID });
    res.json(listHotel);
})

//Lấy danh sách địa danh
app.get('/location', async (req, res) => {
    let listLocation = await Location.find();
    let result = listLocation.map(item => item.name)
   /*  listLocation.map((item, index) =>{
        nameListLocation.push(item.name);
    })  
    nameListLocation = Array.from(new Set(nameListLocation)); */
    console.log({ result });
    res.json(listLocation);
})

mongoose.connect(uri);
mongoose.connection.once('open', () => {
    console.log(`mongo client connected`)
    app.listen(3000, () => console.log(`server started at port 3000`));
});



