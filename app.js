const express           = require('express');
const app               = express();
const bodyParser        = require('body-parser');
const mongoose          = require('mongoose');
const cors              = require('cors');
const cookieParser      = require('cookie-parser');
const { hash, compare } = require('bcryptjs');
const {sign}               = require('jsonwebtoken');
//const uri               = 'mongodb://localhost:27017/BookingHotel';
const uri               = 'mongodb+srv://tophat:phat123@cluster0.fe3z9.mongodb.net/BookingHotel';
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
    res.json(listLocation);
})

//Xóa địa danh
app.get('/delete-location/:locationID', async (req, res) => {
    let { locationID } = req.params;
    let locationRemove = await Location.findByIdAndDelete({ _id: locationID });
    res.json({message: 'Xóa thành công', locationRemove: locationRemove});
})


//Thêm data hotel
app.post('/add-hotel', async (req, res) => {
    try {
      let { location, user, type, nameRoom, img, detailLocation, typeRoom, numberBedRoom, numberBathRoom, 
            numberBed, numberPeople, detailRoom, priceMon_Fri, priceWeb_Sun, priceDiscount, detailRules  } = req.body;
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
    let listHotel;
    
    if(hotelID){
        listHotel = await Hotel.findById(hotelID);
    }else{
        listHotel = await Hotel.find();
    }

    res.json(listHotel);
})



//Lấy danh sách hotel theo địa danh
app.get('/list-hotel/:locationID', async (req, res) => {
    let { locationID } = req.params;
    let listHotel = await Hotel.find({ location: locationID });
    res.json(listHotel);
})

// Chỉnh sửa hotel theo id
app.post('/update-hotel/:hotelID', async (req, res) => {
    try {
        let { hotelID } = req.params;
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
        const newUser = await new User({ username, name, email, password: hashedPassword,})
        //save to database
        const userAfterSave = await newUser.save();
        res.json(userAfterSave)

    } catch (error) {
        res.status(400).json({message: error.message});
    }
})

// Đăng nhập user
 app.post('/login', async (req, res) => {
    let {username, password} = req.body;
    const infoUser = await User.findOne({ username });
    if (!infoUser)
        return res.status(404).json({message: 'Tài khoản không tồn tại'});           
    const checkPass = await compare(password, infoUser.password);
    if (!checkPass)
        return res.status(404).json({message: 'Sai mật khẩu'});

    if( infoUser && checkPass){
        const accessToken = sign({ 
            username: infoUser.username,
            name: infoUser.name,
            email: infoUser.email,  
            role: infoUser.role,    
        }, 'token');
        const {password, ...other} = infoUser._doc;
        return res.json({...other, accessToken});
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

app.post('/search', async (req, res) => {
    try {
        let { keyword } = req.body;
        let listLocationByKeyword = await Location.find({ "name" : { $regex: keyword, $options: 'i' } });
        listLocationByKeyword.map(item => {delete item.image; return item});

        let listDetailLocationOfHotelByKeyWord = await Hotel.find({ "detailLocation" : { $regex: keyword, $options: 'i' } });
        let listResultDetailLocation = listDetailLocationOfHotelByKeyWord.map(item => item.detailLocation);
        listResultDetailLocation = Array.from(new Set(listResultDetailLocation));

        let listHotelByKeyWord = await Hotel.find({ "nameRoom" : { $regex: keyword, $options: 'i' } }).limit(10);
        let resultListHotel = [];
        listHotelByKeyWord.map(item => {
            var hotel = new Object();
            hotel.id = item._id;
            hotel.nameRoom = item.nameRoom;
            resultListHotel.push(hotel);
        });

        //res.json(resultListHotel);
        res.json({location : listLocationByKeyword, detailLocation: listResultDetailLocation, hotel: resultListHotel});

    } catch (error) {
        res.json({ error: error.message });
    }
})

const convertText = (str) => {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    return str;
}



mongoose.connect(uri);
mongoose.connection.once('open', () => {
    console.log(`mongo client connected`)
    app.listen(process.env.PORT, () => console.log(`server started at port 3000`));
});



