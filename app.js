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
const { Oder}           = require('./models/oder-coll');
const { RoomFavorite }   = require('./models/room-favorite-coll');
const { Note }          = require('./models/stickynote-coll'); 
const { Image }         = require('./models/image-coll');

var admin = require('./helper');

app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({}));
app.use(cors({origin: true, credentials: true}));

const multer = require('multer');
const storage = multer.diskStorage({
    destination(req, file, callback) {
      callback(null, './uploads');
    },
    filename(req, file, callback) {
      callback(null, `${file.fieldname}_${Date.now()}_${file.originalname}`);
    },
  });
const upload = multer({ storage });

app.use('/uploads', express.static('uploads'));


app.get('/', (req, res) => {
    res.send("Welcome NodeJs");
})



//---------------------------------------->LOCATION<------------------------------------
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

//---------------------------------------->HOTEL<------------------------------------
//Thêm data hotel
app.post('/add-hotel', async (req, res) => {
    try {
      let { location, type, nameRoom, img, detailLocation, typeRoom, numberBedRoom, numberBathRoom, 
            numberBed, numberPeople, detailRoom, priceMon_Fri, priceWeb_Sun, priceDiscount, detailRules  } = req.body;
      let newHotel = new Hotel({ location, type, nameRoom, img, detailLocation, typeRoom, numberBedRoom, numberBathRoom, 
                                 numberBed, numberPeople, detailRoom, priceMon_Fri, priceWeb_Sun, priceDiscount, detailRules });
      let hotelAfterSave = await newHotel.save();
      res.json(hotelAfterSave)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
   
})

//Lấy danh sách hotel, lấy theo id : '/list-hotel?hotelID=" " '
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



app.post('/upload-img', upload.array('pstay', 2), async (req, res) => {
    let listImage = (req.files);
    await Promise.all(listImage.map(async(item) => {
        const newImage = new Image({
            img: {
                data: item.filename,
                contentType: 'image/png',
            }
        })
        let imgNew = await newImage.save();
        res.status(200).json({message: 'success!', imgNew});
    }))
});

app.post('/upload', upload.single('pstays'), async (req, res, next) => {
    /* let imgNew = req.file;
    res.status(200).json({message: 'success!', imgNew}); */
    const newImage = new Image({
        img: {
            data: req.file.filename,
            contentType: 'image/png',
        }
    })
    let imgNew = await newImage.save();
    res.status(200).json({message: 'success!', imgNew});
  })

app.get('/get-img', async (req, res) => {
    listImg = await Image.find();

    /* const binaryImage = [112,115,116,97,121,115,95,49,54,56,52,51,52,50,52,48,57,48,49,56,95,112,114,111,112,101,114,116,121,46,112,110,103]
    const result= reader.readAsDataURL(binaryImage); */

    res.json({listImg});
});
   


//---------------------------------------->USER<------------------------------------
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

// Thêm danh sách phòng yêu thích theo User
app.post('/add-room-favorite', async (req, res) => {
    try {
        let { user, hotel } = req.body;
        let newRoomFavorite = new RoomFavorite({ user, hotel});
        let newRoomFavoriteAfterSave = await newRoomFavorite.save();
        res.json(newRoomFavoriteAfterSave)
    } catch (e) {
        res.json({error: e.message})
    }
})

// Lấy danh sách phòng yêu thích theo User
app.get('/room-favorite-by-user', async (req, res) => {
    try{
        let { userID } = req.query;
        let listFavorite = await RoomFavorite.find({user: userID})
        let listHotelFavorite = [];
        await Promise.all(listFavorite.map(async(item) => {
            let hotelFavorite = await Hotel.findById(item.hotel);
            listHotelFavorite.push(hotelFavorite)
        }))
        res.json(listHotelFavorite);
    } catch (e) {
        res.json({error: e.message})
    }
})

// Xóa phòng yêu thích theo User
app.post('/delete-room-favorite', async (req, res) => {
    let { hotel, user } = req.body;
    let roomRemove = await RoomFavorite.findOneAndDelete({ hotel, user});
    res.json({message: 'Xóa thành công', roomRemove: roomRemove});
})


//---------------------------------------->ODER<------------------------------------
//Thêm đơn đặt phòng
app.post('/add-oder', async (req, res) => {
    try {
        let { totalPrice, dayOder, dayReturn, dateOder, dateReturn, numberPeople, numberChildren, status_booking, status_payment, status_confirm, hotel, user } = req.body;
        let newOder = new Oder({ totalPrice, dayOder, dayReturn, dateOder, dateReturn, numberPeople, numberChildren, status_booking, status_payment, status_confirm, hotel, user });
        let oderAfterSave = await newOder.save();
        if(oderAfterSave){
            res.json({message: 'Thêm thành công', data: oderAfterSave})
        }else{
            res.json({message: 'Thêm thất bại'})
        }
    } catch (e) {
        res.json({error: e.message})
    }
})
// lấy đơn đặt phòng, lấy theo ID_Oder : '/list-oder?oderID=" "
app.get('/list-oder', async (req, res) => {
    try {
        let { oderID } = req.query;
        let listOder;
        if(oderID){
            listOder = await Oder.findById(oderID)
        } else listOder = await Oder.find();
        res.json(listOder);
    } catch (error) {
        res.json({ error: error.message });
    }
})

//Lấy danh sách phòng đã đặt theo User
app.get('/list-oder-by-user/:userID', async (req, res) => {
    try {
        let { userID } = req.params;
        let listOder = await Oder.find({ user: userID });
        let listHotelOder = []; 
        await Promise.all(listOder.map(async(item) => {
            let hotelInfo = await Hotel.findById(item.hotel);
            item.hotel = hotelInfo;
            listHotelOder.push(item);
        }))
        res.json(listHotelOder);
    } catch (error) {
        res.json({ error: error.message });
    }
})


// Tìm kiếm địa danh và khách sạn theo keyword
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




app.get('/notification', async (req, res) => {
    try {
        const result = await admin.messaging().send({
           notification: {
            "title" : 'Thong bao',
            "body": 'Day la thong bao',
           },
           "android": {
            "notification": {
                "sound": "default",
            }
           },
           "apns": {
            "payload" : {
                "aps": {
                    "sound" : "default",
                }
            }
           },
            token: 'dbuAEBcGTDGRyYq8PYlUjM:APA91bHfjnaQs_OoOun7UNQ4OHnGvakxTaz9flYMRdJMN5bVetjagB4nPZix0Pq4GOHs4BAntoHbz7lrTZ5VAaBC-4kxPFEFJ4zCR9-x4ouDBLWXeK-2WAIAvYPAeGa1Q0MM6rpryJOM'
          });
          res.json(result);
    } catch (error) {
        res.json({ error: error.message });
    }
})

//Check tài khoản đã tồn tại chưa
app.post('/check-user', async (req, res) => {
    try {
        let { username } = req.body;
        let result = await User.findOne({ username });
        res.json(result);
    } catch (error) {
        res.json({ error: error.message });
    }
})

//Đặt lại password theo SDT
app.post('/forgot-password', async (req, res) => {
    try {
        let { username, password } = req.body;
        const hashedPassword = await hash(password, 8);
        let result = await User.findOne({ username });
        let newUserUpdate = await User.findByIdAndUpdate(result.id, {password: hashedPassword});
        res.json(newUserUpdate);
    } catch (error) {
        res.json({ error: error.message });
    }
})







//---------------------------------------->STICKYNOTE<------------------------------------


app.post('/add-note', async (req, res) => {
    try {
        let { title, detail } = req.body;
        let newNote = new Note({ title, detail });
        let noteAfterSave = await newNote.save();
        if(noteAfterSave){
            res.json({message: 'Thêm thành công', data: noteAfterSave})
        }else{
            res.json({message: 'Thêm thất bại'})
        }
    } catch (e) {
        res.json({error: e.message})
    }
})

app.get('/list-note', async (req, res) => {
    try {
        let { noteID } = req.query;
        let listNote;
        if(noteID){
            listNote = await Note.findById(noteID)
        } else listNote = await Note.find();
        res.json(listNote);
    } catch (error) {
        res.json({ error: error.message });
    }
})



mongoose.set("strictQuery", false);
mongoose.connect(uri);
mongoose.connection.once('open', () => {
    console.log(`mongo client connected`)
    app.listen(process.env.PORT || 3000, () => console.log(`server started at port 3000`));
});



