const express           = require('express');
const app               = express();
const bodyParser        = require('body-parser');
const mongoose          = require('mongoose');
const cors              = require('cors');
const cookieParser      = require('cookie-parser');
const { hash, compare, genSalt } = require('bcryptjs');
const { sign, verify } = require('jsonwebtoken');
const uri               = 'mongodb://localhost:27017/BookingHotel';
const { Hotel }         = require('./models/hotel-coll');
const { Location }      = require('./models/location-coll.js');
const { User }          = require('./models/user-coll');

app.use(bodyParser.json());
app.use(cookieParser());
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

//Lấy danh sách địa danh
app.get('/location', async (req, res) => {
    let listLocation = await Location.find();
    let result = listLocation.map(item => item.name)
    console.log({ result });
    res.json(listLocation);
})

//Xóa địa danh
app.get('/delete-location/:locationID', async (req, res) => {
    let { locationID } = req.params;
    console.log({ locationID });
    let locationRemove = await Location.findByIdAndDelete({ _id: locationID });
    res.json({message: 'Xóa thành công', locationRemove: locationRemove});
})


//Thêm data hotel
app.post('/add-hotel', async (req, res) => {
    try {
      let { location, user, type, nameRoom, img, detailLocation, typeRoom, numberBedRoom, numberBathRoom, 
            numberBed, numberPeople, detailRoom, priceMon_Fri, priceWeb_Sun, priceDiscount, detailRules  } = req.body;
      console.log({ nameRoom, location }, );
      let newHotel = new Hotel({ location, user, type, nameRoom, img, detailLocation, typeRoom, numberBedRoom, numberBathRoom, 
                                 numberBed, numberPeople, detailRoom, priceMon_Fri, priceWeb_Sun, priceDiscount, detailRules });
      let hotelAfterSave = await newHotel.save();
      res.json(hotelAfterSave)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
   
})

//Lấy danh sách hotel
app.get('/list-hotel', async (req, res) => {
    let { hotelID} = req.query;
    console.log({ hotelID});
    let listHotel;
    
    if(hotelID){
        listHotel = await Hotel.findById(hotelID);
    }else{
        listHotel = await Hotel.find();
    }

    console.log({ listHotel });

    res.json(listHotel);
})



//Lấy danh sách hotel theo địa danh
app.get('/list-hotel/:locationID', async (req, res) => {
    let { locationID } = req.params;
    console.log({ locationID });
    let listHotel = await Hotel.find({ location: locationID });
    res.json(listHotel);
})

// Chỉnh sửa hotel theo id
app.post('/update-hotel/:hotelID', async (req, res) => {
    try {
        let { hotelID } = req.params;
        console.log({hotelID});
        let {nameRoom, img, detailRoom, detailLocation, priceMon_Fri, priceDiscount, detailRules} = req.body;
        let updateHotel = await Hotel.findByIdAndUpdate( hotelID, {nameRoom, img, detailRoom, detailLocation, priceDiscount, priceMon_Fri, detailRules}, {new : true});
        res.json(updateHotel);
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

//Xóa hotel
app.get('/delete-hotel/:hotelID', async (req, res) => {
    let { hotelID } = req.params;
    console.log({ hotelID });
    let hotelRemove = await Hotel.findByIdAndDelete({ _id: hotelID });
    res.json({message: 'Xóa thành công', hotelRemove: hotelRemove});
})

// Đăng kí user
app.post('/register', async( req, res) =>{
    try {
        let {username, name, email, password} = req.body;
        //hashed password
        const hashedPassword = await hash(password, 8);
        //create a new user
        const newUser = await new User({
            username,
            name,
            email,
            password: hashedPassword,
        })
        //save to database
        const userAfterSave = await newUser.save();
        res.json(userAfterSave)

    } catch (error) {
        res.status(400).json({message: error.message});
    }
})

// Đăng nhập user
 app.post('/login', async (req, res) => {
    try {

        let {username, password} = req.body;
        const user = await User.findOne({username})
        
        const validPassword = await compare( password, user.password )// return true or false
        if(user && validPassword){
            await delete user.password;
            const accessToken = await sign({user});
            res.json({user, accessToken})
        }
    } catch (error) {
        res.status(400).json({message: 'Sai thong tin tai khoan hoac mat khau'});
    }
 })

// Lấy danh sách User
app.get('/list-user', async (req, res) => {
    try {
        let { userID } = req.query;
        let listUser;
        if(userID){
            listUser = await User.findById(userID)
        } else listUser = await User.find();
        res.json(listUser);
    } catch (error) {
        res.json({ error: error.message });
    }
})




// Lấy danh sách hotel đã đặt từ Customer
app.get('/list-hotel-customer/:userID', async (req, res) => {
    try {
       let { userID } = req.params;
       let listHotelOfUser = await Hotel.find({user: userID})
       res.json(listHotelOfUser);
      } catch (error) {
          res.status(400).json({ error: error.message })
      }
}) 


mongoose.connect(uri);
mongoose.connection.once('open', () => {
    console.log(`mongo client connected`)
    app.listen(3000, () => console.log(`server started at port 3000`));
});



