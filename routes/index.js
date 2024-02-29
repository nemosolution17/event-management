var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var passport = require('passport');
var {ensureAuthenticated} = require('../config/auth');
var multer = require('multer');
var path = require('path');
var async = require('async');
var nodemailer = require('nodemailer');
var crypto = require('crypto');
var moment = require('moment');





// Mysql connectionString
var mysql = require('mysql');
var db = mysql.createPool({
  host: 'xxxxxxx',
  user: 'xxxxx',
  password: 'xxxxx',
  database: 'xxxxxxxx',

});



/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/test');
});

//test mysql connection
router.get('/testconn', function(req, res, next) {
  if(db != null) {
    res.send('it is connected');
  }
  else{
    res.send('connect fail');
  }
});

// get data for homepage brfore login
router.get('/test',  function(req, res, next) {
  db.query('SELECT partyid,  city_name, state_name, party_name, price, startDate, startTime, endDate, endTime, image, address, full_name  FROM register natural join party where userid = id', function (err, rs) {
    if(!req.user){
      
    res.render('test', {party: rs, moment:moment});
    }
    if(req.user){
    res.render('profile', {party: rs, moment:moment});
    }
    if (err){
    res.send(err);
    }
  });
});

// get data for homepage after login

router.get('/profile',  function(req, res, next) {
  db.query('SELECT partyid,  city_name, state_name, party_name, price, startDate, startTime, endDate, endTime, image, address, full_name  FROM register natural join party where userid = id', function (err, rs) {
    if(!req.user){
      
      res.render('test', {party: rs, moment:moment});
      }
      if(req.user){
      res.render('profile', {party: rs, moment:moment});
      }
      if (err){
      res.send(err);
      }
  });
});

router.get('/profile/:offset',  function(req, res, next) {
  var num = req.param.offset
  console.log(num)
  db.query('SELECT  city_name, state_name, party_name, price, image, address, full_name  FROM register natural join party where userid = id LIMIT 10 OFFSET ', function (err, rs) {
    if(!err){
    res.render('profile', {party: rs});
    }
    else{
    res.send(err);
    }
  });
});

/*
router.get('k',  function(req, res, next) {
  db.query('SELECT  city_name, state_name, party_name, price, image, address, full_name  FROM register natural join party where userid = id', function (err, rs) {
    if(!err){
    res.render('click', {party: rs});
    }
    else{
    res.send(err);
    }
  });
});
*/

router.get('/click', function(req, res, next) {
      db.query('SELECT  city_name, state_name, party_name, price, image, startDate, startTime, endDate, endTime, address, full_name, aditional  FROM register natural join party where userid = id  ', function (err, rs) {
        if(!err){
          console.log(rs.aditional);
          console.log(rs[0].aditional);
        res.render('click', {party: rs, moment:moment});
        }
        else{
        res.send(err);
        }
      });


});

router.get('/details/:token', function(req, res) {

  if(!req.user){
    req.flash('error', 'For security reason,  you have to Login to view event details.');
    return res.redirect('/login');
  }

else{
  db.query('SELECT  city_name, state_name, party_name, price, image, startDate, startTime, endDate, endTime, address, full_name,aditional  FROM register natural join party where userid = id and partyid = ?  ',[req.params.token] ,function (err, rs) {
    if(!err){
    res.render('click', {party: rs, moment:moment});
    }
    else{
    res.send(err);
    }
  });
}



  
});



// picture upload with multer
//set storage
const storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null,'./uploads/');
  },
  filename: function(req, file, cb){
    cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init Upload
const upload = multer({
  storage: storage,
  limits:{fileSize: 1000000000},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('MyImage');

function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
  }
}

// Inserting Parties
router.get('/insertme',  function (req, res, next){
  if(!req.user){
    req.flash('error', 'For everyone safety reason,  you have to Register or Login to create events.');
    return res.redirect('/login');
  }
  else{

    res.render('insertme');

  }
  
 
});


router.post('/insertme', function (req, res, next){


  upload(req, res, (err) => {
    var states = req.body.state_name;
    console.log(req.body.ttime);
    /*
    var cit = ['Ada, Minnesota',	'Adams, Minnesota',	'Adrian, Minnesota',	'Afton, Minnesota',	'Aitkin, Minnesota',	'Akeley, Minnesota',	'Albany, Minnesota',	'Alberta, Minnesota',
    'Albert Lea, Minnesota',	'Albertville, Minnesota',	'Alden, Minnesota',	'Aldrich, Minnesota',	'Alexandria, Minnesota',	'Alpha, Minnesota',	'Altura, Minnesota',	'Alvarado, Minnesota',	'Amboy, Minnesota',	'Andover, Minnesota',	'Annandale, Minnesota',	'Anoka, Minnesota',	'Appleton, Minnesota',	'Apple Valley, Minnesota',	'Arco, Minnesota',	'Arden Hills, Minnesota',	'Argyle, Minnesota',	'Arlington, Minnesota',	'Arnold, Minnesota',	'Ashby, Minnesota',	'Askov, Minnesota',	'Atwater, Minnesota',	'Audubon, Minnesota',	'Aurora, Minnesota',	'Austin, Minnesota',	'Avoca, Minnesota',	'Avon, Minnesota',	'Babbitt, Minnesota',	'Backus, Minnesota',	'Badger, Minnesota',	'Bagley, Minnesota',	'Balaton, Minnesota',	'Barnesville, Minnesota',	'Barnum, Minnesota',	'Barrett, Minnesota',	'Barry, Minnesota',	'Battle Lake, Minnesota',	'Baudette, Minnesota',	'Baxter, Minnesota',	'Bayport, Minnesota',	'Beardsley, Minnesota',	'Beaver Bay, Minnesota',	'Beaver Creek, Minnesota',	'Becker, Minnesota',	'Bejou, Minnesota',	'Belgrade, Minnesota',	'Bellechester, Minnesota',	'Belle Plaine, Minnesota',	'Bellingham, Minnesota',	'Beltrami, Minnesota',	'Belview, Minnesota',	'Bemidji, Minnesota',	'Bena, Minnesota',	'Benson, Minnesota',	'Bertha, Minnesota',	'Bethel, Minnesota',	'Bigelow, Minnesota',	'Big Falls, Minnesota',	'Bigfork, Minnesota',	'Big Lake, Minnesota',	'Bingham Lake, Minnesota',	'Birchwood Village, Minnesota',	'Bird Island, Minnesota',	'Biscay, Minnesota',	'Biwabik, Minnesota',	'Blackduck, Minnesota',	'Blaine, Minnesota',	'Blomkest, Minnesota',	'Blooming Prairie, Minnesota',	'Bloomington, Minnesota',	'Blue Earth, Minnesota',	'Bluffton, Minnesota',	'Bock, Minnesota',	'Borup, Minnesota',	'Bovey, Minnesota',	'Bowlus, Minnesota',	'Boyd, Minnesota',	'Boy River, Minnesota',	'Braham, Minnesota',	'Brainerd, Minnesota',	'Brandon, Minnesota',	'Breckenridge, Minnesota',	'Breezy Point, Minnesota',	'Brewster, Minnesota',	'Bricelyn, Minnesota',	'Brooklyn Center, Minnesota',	'Brooklyn Park, Minnesota',	'Brook Park, Minnesota',	'Brooks, Minnesota',	'Brookston, Minnesota',	'Brooten, Minnesota',	'Browerville, Minnesota',	'Brownsdale, Minnesota',	'Browns Valley, Minnesota',	'Brownsville, Minnesota',	'Brownton, Minnesota',	'Bruno, Minnesota',	'Buckman, Minnesota',	'Buffalo, Minnesota',	'Buffalo Lake, Minnesota',	'Buhl, Minnesota',	'Burnsville, Minnesota',	'Burtrum, Minnesota',	'Butterfield, Minnesota',	'Byron, Minnesota',	'Caledonia, Minnesota',	'Callaway, Minnesota',	'Calumet, Minnesota',	'Cambridge, Minnesota',	'Campbell, Minnesota',	'Canby, Minnesota',	'Cannon Falls, Minnesota',	'Canton, Minnesota',	'Carlos, Minnesota',	'Carlton, Minnesota',	'Carver, Minnesota',	'Cass Lake, Minnesota',	'Cedar Mills, Minnesota',	'Center City, Minnesota',	'Centerville, Minnesota',	'Ceylon, Minnesota',	'Champlin, Minnesota',	'Chandler, Minnesota',	'Chanhassen, Minnesota',	'Chaska, Minnesota',	'Chatfield, Minnesota',	'Chickamaw Beach, Minnesota',	'Chisago City, Minnesota',	'Chisholm, Minnesota',	'Chokio, Minnesota',	'Circle Pines, Minnesota',	'Clara City, Minnesota',	'Claremont, Minnesota',	'Clarissa, Minnesota',	'Clarkfield, Minnesota',	'Clarks Grove, Minnesota',	'Clearbrook, Minnesota',	'Clear Lake, Minnesota',	'Clearwater, Minnesota',	'Clements, Minnesota',	'Cleveland, Minnesota',	'Climax, Minnesota',	'Clinton, Minnesota',	'Clitherall, Minnesota',	'Clontarf, Minnesota',	'Cloquet, Minnesota',	'Coates, Minnesota',	'Cobden, Minnesota',	'Cohasset, Minnesota',	'Cokato, Minnesota',	'Cold Spring, Minnesota',	'Coleraine, Minnesota',	'Cologne, Minnesota',	'Columbia Heights, Minnesota',	'Comfrey, Minnesota',	'Comstock, Minnesota',	'Conger, Minnesota',	'Cook, Minnesota',	'Coon Rapids, Minnesota',	'Corcoran, Minnesota',	'Correll, Minnesota',	'Cosmos, Minnesota',	'Cottage Grove, Minnesota',	'Cottonwood, Minnesota',	'Courtland, Minnesota',	'Cromwell, Minnesota',	'Crookston, Minnesota',	'Crosby, Minnesota',	'Crosslake, Minnesota',	'Crystal, Minnesota',	'Currie, Minnesota',	'Cuyuna, Minnesota',	'Cyrus, Minnesota',	'Dakota, Minnesota',	'Dalton, Minnesota',	'Danube, Minnesota',	'Danvers, Minnesota',	'Darfur, Minnesota',	'Darwin, Minnesota',	'Dassel, Minnesota',	'Dawson, Minnesota',	'Dayton, Minnesota',	'Deephaven, Minnesota',	'Deer Creek, Minnesota',	'Deer River, Minnesota',	'Deerwood, Minnesota',	'De Graff, Minnesota',	'Delano, Minnesota',	'Delavan, Minnesota',	'Delhi, Minnesota',	'Dellwood, Minnesota',	'Denham, Minnesota',	'Dennison, Minnesota',	'Dent, Minnesota',	'Detroit Lakes, Minnesota',	'Dexter, Minnesota',	'Dilworth, Minnesota',	'Dodge Center, Minnesota',	'Donaldson, Minnesota',	'Donnelly, Minnesota',	'Doran, Minnesota',	'Dover, Minnesota',	'Dovray, Minnesota',	'Duluth, Minnesota',	'Dumont, Minnesota',	'Dundas, Minnesota',	'Dundee, Minnesota',	'Dunnell, Minnesota',	'Eagan, Minnesota',	'Eagle Bend, Minnesota',	'Eagle Lake, Minnesota',	'East Bethel, Minnesota',	'East Grand Forks, Minnesota',	'East Gull Lake, Minnesota',	'Easton, Minnesota',	'Echo, Minnesota',	'Eden Prairie, Minnesota',	'Eden Valley, Minnesota',	'Edgerton, Minnesota',	'Edina, Minnesota',	'Effie, Minnesota',	'Eitzen, Minnesota',	'Elba, Minnesota',	'Elbow Lake, Minnesota',	'Elbow Lake, Minnesota',	'Elgin, Minnesota',	'Elizabeth, Minnesota',	'Elko, Minnesota',	'Elk River, Minnesota',	'Elkton, Minnesota',	'Ellendale, Minnesota',	'Ellsworth, Minnesota',	'Elmdale, Minnesota',	'Elmore, Minnesota',	'Elrosa, Minnesota',	'Ely, Minnesota',	'Elysian, Minnesota',	'Emily, Minnesota',	'Emmons, Minnesota',	'Erhard, Minnesota',	'Erskine, Minnesota',	'Evan, Minnesota',	'Evansville, Minnesota',	'Eveleth, Minnesota',	'Excelsior, Minnesota',	'Eyota, Minnesota',	'Fairfax, Minnesota',	'Fairmont, Minnesota',	'Falcon Heights, Minnesota',	'Faribault, Minnesota',	'Farmington, Minnesota',	'Farwell, Minnesota',	'Federal Dam, Minnesota',	'Felton, Minnesota',	'Fergus Falls, Minnesota',	'Fertile, Minnesota',	'Fifty Lakes, Minnesota',	'Finlayson, Minnesota',	'Fisher, Minnesota',	'Flensburg, Minnesota',	'Floodwood, Minnesota',	'Florence, Minnesota',	'Foley, Minnesota',	'Forada, Minnesota',	'Forest Lake, Minnesota',	'Foreston, Minnesota',	'Fort Ripley, Minnesota',	'Fosston, Minnesota',	'Fountain, Minnesota',	'Foxhome, Minnesota',	'Franklin, Minnesota',	'Frazee, Minnesota',	'Freeborn, Minnesota',	'Freeport, Minnesota',	'Fridley, Minnesota',	'Frost, Minnesota',	'Fulda, Minnesota',	'Funkley, Minnesota',	'Garfield, Minnesota',	'Garrison, Minnesota',	'Garvin, Minnesota',	'Gary, Minnesota',	'Gaylord, Minnesota',	'Gem Lake, Minnesota',	'Geneva, Minnesota',	'Genola, Minnesota',	'Georgetown, Minnesota',	'Ghent, Minnesota',	'Gibbon, Minnesota',	'Gilbert, Minnesota',	'Gilman, Minnesota',	'Glencoe, Minnesota',	'Glenville, Minnesota',	'Glenwood, Minnesota',	'Glyndon, Minnesota',	'Golden Valley, Minnesota',	'Gonvick, Minnesota',	'Goodhue, Minnesota',	'Goodridge, Minnesota',	'Good Thunder, Minnesota',	'Goodview, Minnesota',	'Graceville, Minnesota',	'Granada, Minnesota',	'Grand Marais, Minnesota',	'Grand Meadow, Minnesota',	'Grand Rapids, Minnesota',	'Granite Falls, Minnesota',	'Grant, Minnesota',	'Grasston, Minnesota',	'Greenbush, Minnesota',	'Greenfield, Minnesota',	'Green Isle, Minnesota',	'Greenwald, Minnesota',	'Greenwood, Minnesota',	'Grey Eagle, Minnesota',	'Grove City, Minnesota',	'Grygla, Minnesota',	'Gully, Minnesota',	'Hackensack, Minnesota',	'Hadley, Minnesota',	'Hallock, Minnesota',	'Halma, Minnesota',	'Halstad, Minnesota',	'Hamburg, Minnesota',	'Ham Lake, Minnesota',	'Hammond, Minnesota',	'Hampton, Minnesota',	'Hancock, Minnesota',	'Hanley Falls, Minnesota',	'Hanover, Minnesota',	'Hanska, Minnesota',	'Harding, Minnesota',	'Hardwick, Minnesota',	'Harmony, Minnesota',	'Harris, Minnesota',	'Hartland, Minnesota',	'Hastings, Minnesota',	'Hatfield, Minnesota',	'Hawley, Minnesota',	'Hayfield, Minnesota',	'Hayward, Minnesota',	'Hazel Run, Minnesota',	'Hector, Minnesota',	'Heidelberg, Minnesota',	'Henderson, Minnesota',	'Hendricks, Minnesota',	'Hendrum, Minnesota',	'Henning, Minnesota',	'Henriette, Minnesota',	'Herman, Minnesota',	'Hermantown, Minnesota',	'Heron Lake, Minnesota',	'Hewitt, Minnesota',	'Hibbing, Minnesota',	'Hill City, Minnesota',	'Hillman, Minnesota',	'Hills, Minnesota',	'Hilltop, Minnesota',	'Hinckley, Minnesota',	'Hitterdal, Minnesota',	'Hoffman, Minnesota',	'Hokah, Minnesota',	'Holdingford, Minnesota',	'Holland, Minnesota',	'Hollandale, Minnesota',	'Holloway, Minnesota',	'Holt, Minnesota',	'Hopkins, Minnesota',	'Houston, Minnesota',	'Howard Lake, Minnesota',	'Hoyt Lakes, Minnesota',	'Hugo, Minnesota',	'Humboldt, Minnesota',	'Hutchinson, Minnesota',	'Ihlen, Minnesota',	'Independence, Minnesota',	'International Falls, Minnesota',	'Inver Grove Heights, Minnesota',	'Iona, Minnesota',	'Iron Junction, Minnesota',	'Ironton, Minnesota',	'Isanti, Minnesota',	'Isle, Minnesota',	'Ivanhoe, Minnesota',	'Jackson, Minnesota',	'Janesville, Minnesota',	'Jasper, Minnesota',	'Jeffers, Minnesota',	'Jenkins, Minnesota',	'Johnson, Minnesota',	'Jordan, Minnesota',	'Kandiyohi, Minnesota',	'Karlstad, Minnesota',	'Kasota, Minnesota',	'Kasson, Minnesota',	'Keewatin, Minnesota',	'Kelliher, Minnesota',	'Kellogg, Minnesota',	'Kennedy, Minnesota',	'Kenneth, Minnesota',	'Kensington, Minnesota',	'Kent, Minnesota',	'Kenyon, Minnesota',	'Kerkhoven, Minnesota',	'Kerrick, Minnesota',	'Kettle River, Minnesota',	'Kiester, Minnesota',	'Kilkenny, Minnesota',	'Kimball, Minnesota',	'Kinbrae, Minnesota',	'Kingston, Minnesota',	'Kinney, Minnesota',	'La Crescent, Minnesota',	'Lafayette, Minnesota',	'Lake Benton, Minnesota',	'Lake Bronson, Minnesota',	'Lake City, Minnesota',	'Lake Crystal, Minnesota',	'Lake Elmo, Minnesota',	'Lakefield, Minnesota',	'Lake Henry, Minnesota',	'Lakeland, Minnesota',	'Lakeland Shores, Minnesota',	'Lake Lillian, Minnesota',	'Lake Park, Minnesota',	'Lake St. Croix Beach, Minnesota',	'Lake Shore, Minnesota',	'Lakeville, Minnesota',	'Lake Wilson, Minnesota',	'Lamberton, Minnesota',	'Lancaster, Minnesota',	'Landfall, Minnesota',	'Lanesboro, Minnesota',	
    'Laporte, Minnesota',	'La Prairie, Minnesota',	'La Salle, Minnesota',	'Lastrup, Minnesota',	'Lauderdale, Minnesota',	'Le Center, Minnesota',	'Lengby, Minnesota',	'Leonard, Minnesota',	'Leonidas, Minnesota',	'Leota, Minnesota',	'Le Roy, Minnesota',	'Lester Prairie, Minnesota',	'Le Sueur, Minnesota',	'Lewiston, Minnesota',	'Lewisville, Minnesota',	'Lexington, Minnesota',	'Lilydale, Minnesota',	'Lindstrom, Minnesota',	'Lino Lakes, Minnesota',	'Lismore, Minnesota',	'Litchfield, Minnesota',	'Little Canada, Minnesota',	'Little Falls, Minnesota',	'Littlefork, Minnesota',	'Little Rock, Minnesota',	'Long Beach, Minnesota',	'Long Lake, Minnesota',	'Long Prairie, Minnesota',	'Longville, Minnesota',	'Lonsdale, Minnesota',	'Loretto, Minnesota',	'Louisburg, Minnesota',	'Lowry, Minnesota',	'Lucan, Minnesota',	'Luverne, Minnesota',	'Lyle, Minnesota',	'Lynd, Minnesota',	'Mabel, Minnesota',	'McGrath, Minnesota',	'McGregor, Minnesota',	'McIntosh, Minnesota',	'McKinley, Minnesota',	'Madelia, Minnesota',	'Madison, Minnesota',	'Madison Lake, Minnesota',	'Magnolia, Minnesota',	'Mahnomen, Minnesota',	'Mahtomedi, Minnesota',	'Manchester, Minnesota',	'Manhattan Beach, Minnesota',	'Mankato, Minnesota',	'Mantorville, Minnesota',	'Maple Grove, Minnesota',	'Maple Lake, Minnesota',	'Maple Plain, Minnesota',	'Mapleton, Minnesota',	'Mapleview, Minnesota',	'Maplewood, Minnesota',	'Marble, Minnesota',	'Marietta, Minnesota',	'Marine on St. Croix, Minnesota',	'Marshall, Minnesota',	'Mayer, Minnesota',	'Maynard, Minnesota',	'Mazeppa, Minnesota',	'Meadowlands, Minnesota',	'Medford, Minnesota',	'Medicine Lake, Minnesota',	'Medina, Minnesota',	'Meire Grove, Minnesota',	'Melrose, Minnesota',	'Menahga, Minnesota',	'Mendota, Minnesota',	'Mendota Heights, Minnesota',	'Mentor, Minnesota',	'Middle River, Minnesota',	'Miesville, Minnesota',	'Milaca, Minnesota',	'Milan, Minnesota',	'Millerville, Minnesota',	'Millville, Minnesota',	'Milroy, Minnesota',	'Miltona, Minnesota',	'Minneapolis, Minnesota',	'Minneiska, Minnesota',	'Minneota, Minnesota',	'Minnesota City, Minnesota',	'Minnesota Lake, Minnesota',	'Minnetonka, Minnesota',	'Minnetonka Beach, Minnesota',	'Minnetrista, Minnesota',	'Mizpah, Minnesota',	'Montevideo, Minnesota',	'Montgomery, Minnesota',	'Monticello, Minnesota',	'Montrose, Minnesota',	'Moorhead, Minnesota',	'Moose Lake, Minnesota',	'Mora, Minnesota',	'Morgan, Minnesota',	'Morris, Minnesota',	'Morristown, Minnesota',	'Morton, Minnesota',	'Motley, Minnesota',	'Mound, Minnesota',	'Mounds View, Minnesota',	'Mountain Iron, Minnesota',	'Mountain Lake, Minnesota',	'Murdock, Minnesota',	'Myrtle, Minnesota',	'Nashua, Minnesota',	'Nashwauk, Minnesota',	'Nassau, Minnesota',	'Naytahwaush, Minnesota',	'Nelson, Minnesota',	'Nerstrand, Minnesota',	'Nevis, Minnesota',	'New Auburn, Minnesota',	'New Brighton, Minnesota',	'Newfolden, Minnesota',	'New Germany, Minnesota',	'New Hope, Minnesota',	'New London, Minnesota',	'New Market, Minnesota',	'New Munich, Minnesota',	'Newport, Minnesota',	'New Prague, Minnesota',	'New Richland, Minnesota',	'New Trier, Minnesota',	'New Ulm, Minnesota',	'New York Mills, Minnesota',	'Nicollet, Minnesota',	'Nielsville, Minnesota',	'Nimrod, Minnesota',	'Nisswa, Minnesota',	'Norcross, Minnesota',	'North Branch, Minnesota',	'Northfield, Minnesota',	'North Mankato, Minnesota',	'North Oaks, Minnesota',	'Northome, Minnesota',	'Northrop, Minnesota',	'North St. Paul, Minnesota',	'Norwood Young America, Minnesota',	'Oakdale, Minnesota',	'Oak Grove, Minnesota',	'Oak Park Heights, Minnesota',	'Oakport, Minnesota',	'Odessa, Minnesota',	'Odin, Minnesota',	'Ogema, Minnesota',	'Ogilvie, Minnesota',	'Okabena, Minnesota',	'Oklee, Minnesota',	'Olivia, Minnesota',	'Onamia, Minnesota',	'Ormsby, Minnesota',	'Orono, Minnesota',	'Oronoco, Minnesota',	'Orr, Minnesota',	'Ortonville, Minnesota',	'Osakis, Minnesota',	'Oslo, Minnesota',	'Osseo, Minnesota',	'Ostrander, Minnesota',	'Otsego, Minnesota',	'Ottertail, Minnesota',	'Owatonna, Minnesota',	'Palisade, Minnesota',	'Parkers Prairie, Minnesota',	'Park Rapids, Minnesota',	'Paynesville, Minnesota',	'Pease, Minnesota',	'Pelican Rapids, Minnesota',	'Pemberton, Minnesota',	'Pennock, Minnesota',	'Pequot Lakes, Minnesota',	'Perham, Minnesota',	'Perley, Minnesota',	'Peterson, Minnesota',	'Pierz, Minnesota',	'Pillager, Minnesota',	'Pine City, Minnesota',	'Pine Island, Minnesota',	'Pine Point, Minnesota',	'Pine River, Minnesota',	'Pine Springs, Minnesota',	'Pipestone, Minnesota',	'Plainview, Minnesota',	'Plato, Minnesota',	'Pleasant Lake, Minnesota',	'Plummer, Minnesota',	'Plymouth, Minnesota',	'Ponemah, Minnesota',	'Porter, Minnesota',	'Preston, Minnesota',	'Princeton, Minnesota',	'Prinsburg, Minnesota',	'Prior Lake, Minnesota',	'Proctor, Minnesota',	'Quamba, Minnesota',	'Racine, Minnesota',	'Ramsey, Minnesota',	'Randall, Minnesota',	'Randolph, Minnesota',	'Ranier, Minnesota',	'Raymond, Minnesota',	'Redby, Minnesota',	'Red Lake, Minnesota',	'Red Lake Falls, Minnesota',	'Red Wing, Minnesota',	'Redwood Falls, Minnesota',	'Regal, Minnesota',	'Remer, Minnesota',	'Renville, Minnesota',	'Revere, Minnesota',	'Rice, Minnesota',	'Rice Lake, Minnesota',	'Richfield, Minnesota',	'Richmond, Minnesota',	'Richville, Minnesota',	'Riverton, Minnesota',	'Robbinsdale, Minnesota',	'Rochester, Minnesota',	'Rock Creek, Minnesota',	'Rockford, Minnesota',	'Rockville, Minnesota',	'Rogers, Minnesota',	'Rollingstone, Minnesota',	'Ronneby, Minnesota',	'Roosevelt, Minnesota',	'Roscoe, Minnesota',	'Roseau, Minnesota',	'Rose Creek, Minnesota',	'Rosemount, Minnesota',	'Roseville, Minnesota',	'Rothsay, Minnesota',	'Round Lake, Minnesota',	'Royalton, Minnesota',	'Rush City, Minnesota',	'Rushford, Minnesota',	'Rushford Village, Minnesota',	'Rushmore, Minnesota',	'Russell, Minnesota',	'Ruthton, Minnesota',	'Rutledge, Minnesota',	'Sabin, Minnesota',	'Sacred Heart, Minnesota',	'St. Anthony city (Hennepin County), Minnesota',	'St. Anthony city (Stearns County), Minnesota',	'St. Bonifacius, Minnesota',	'St. Charles, Minnesota',	'St. Clair, Minnesota',	'St. Cloud, Minnesota',	'St. Francis, Minnesota',	'St. Hilaire, Minnesota',	'St. James, Minnesota',	'St. Joseph, Minnesota',	'St. Leo, Minnesota',	'St. Louis Park, Minnesota',	'St. Martin, Minnesota',	'St. Marys Point, Minnesota',	'St. Michael, Minnesota',	'St. Paul, Minnesota',	'St. Paul Park, Minnesota',	'St. Peter, Minnesota',	'St. Rosa, Minnesota',	'St. Stephen, Minnesota',	'St. Vincent, Minnesota',	'Sanborn, Minnesota',	'Sandstone, Minnesota',	'Sargeant, Minnesota',	'Sartell, Minnesota',	'Sauk Centre, Minnesota',	'Sauk Rapids, Minnesota',	'Savage, Minnesota',	'Scanlon, Minnesota',	'Seaforth, Minnesota',	'Sebeka, Minnesota',	'Sedan, Minnesota',	'Shafer, Minnesota',	'Shakopee, Minnesota',	'Shelly, Minnesota',	'Sherburn, Minnesota',	'Shevlin, Minnesota',	'Shoreview, Minnesota',	'Shorewood, Minnesota',	'Silver Bay, Minnesota',	'Silver Lake, Minnesota',	'Skyline, Minnesota',	'Slayton, Minnesota',	'Sleepy Eye, Minnesota',	'Sobieski, Minnesota',	'Solway, Minnesota',	'South Haven, Minnesota',	'South St. Paul, Minnesota',	'Spicer, Minnesota',	'Springfield, Minnesota',	'Spring Grove, Minnesota',	'Spring Hill, Minnesota',	'Spring Lake Park, Minnesota',	'Spring Park, Minnesota',	'Spring Valley, Minnesota',	'Squaw Lake, Minnesota',	'Stacy, Minnesota',	'Staples, Minnesota',	'Starbuck, Minnesota',	'Steen, Minnesota',	'Stephen, Minnesota',	'Stewart, Minnesota',	'Stewartville, Minnesota',	'Stillwater, Minnesota',	'Stockton, Minnesota',	'Storden, Minnesota',	'Strandquist, Minnesota',	'Strathcona, Minnesota',	'Sturgeon Lake, Minnesota',	'Sunburg, Minnesota',	'Sunfish Lake, Minnesota',	'Swanville, Minnesota',	'Taconite, Minnesota',	'Tamarack, Minnesota',	'Taopi, Minnesota',	'Taunton, Minnesota',	'Taylors Falls, Minnesota',	'Tenney, Minnesota',	'Tenstrike, Minnesota',	'The Lakes, Minnesota',	'Thief River Falls, Minnesota',	'Thomson, Minnesota',	'Tintah, Minnesota',	'Tonka Bay, Minnesota',	'Tower, Minnesota',	'Tracy, Minnesota',	'Trail, Minnesota',	'Trimont, Minnesota',	'Trommald, Minnesota',	'Trosky, Minnesota',	'Truman, Minnesota',	'Turtle River, Minnesota',	'Twin Lakes, Minnesota',	'Twin Valley, Minnesota',	'Two Harbors, Minnesota',	'Tyler, Minnesota',	'Ulen, Minnesota',	'Underwood, Minnesota',	'Upsala, Minnesota',	'Urbank, Minnesota',	'Utica, Minnesota',	'Vadnais Heights, Minnesota',	'Vergas, Minnesota',	'Vermillion, Minnesota',	'Verndale, Minnesota',	'Vernon Center, Minnesota',	'Vesta, Minnesota',	'Victoria, Minnesota',	'Viking, Minnesota',	'Villard, Minnesota',	'Vineland, Minnesota',	'Vining, Minnesota',	'Virginia, Minnesota',	'Wabasha, Minnesota',	'Wabasso, Minnesota',	'Waconia, Minnesota',	'Wadena, Minnesota',	'Wahkon, Minnesota',	'Waite Park, Minnesota',	'Waldorf, Minnesota',	'Walker, Minnesota',	'Walnut Grove, Minnesota',	'Walters, Minnesota',	'Waltham, Minnesota',	'Wanamingo, Minnesota',	'Wanda, Minnesota',	'Warba, Minnesota',	'Warren, Minnesota',	'Warroad, Minnesota',	'Waseca, Minnesota',	'Watertown, Minnesota',	'Waterville, Minnesota',	'Watkins, Minnesota',	'Watson, Minnesota',	'Waubun, Minnesota',	'Waverly, Minnesota',	'Wayzata, Minnesota',	'Welcome, Minnesota',	'Wells, Minnesota',	'Wendell, Minnesota',	'Westbrook, Minnesota',	'West Concord, Minnesota',	'Westport, Minnesota',	'West St. Paul, Minnesota',	'West Union, Minnesota',	'Whalan, Minnesota',	'Wheaton, Minnesota',	'White Bear Lake, Minnesota',	'White Earth, Minnesota',	'Wilder, Minnesota',	'Willernie, Minnesota',	'Williams, Minnesota',	'Willmar, Minnesota',	'Willow River, Minnesota',	'Wilmont, Minnesota',	'Wilton, Minnesota',	'Windom, Minnesota',	'Winger, Minnesota',	'Winnebago, Minnesota',	'Winona, Minnesota',	'Winsted, Minnesota',	'Winthrop, Minnesota',	'Winton, Minnesota',	'Wolf Lake, Minnesota',	'Wolverton, Minnesota',	'Woodbury, Minnesota',	'Wood Lake, Minnesota',	'Woodland, Minnesota',	'Woodstock, Minnesota',	
    'Worthington, Minnesota',	'Wrenshall, Minnesota',	'Wright, Minnesota',	'Wykoff, Minnesota',	'Wyoming, Minnesota',	'Zemple, Minnesota',	'Zimmerman, Minnesota',	'Zumbrota, Minnesota']*/
    //var cit = ['ADA','ADAMS','ADRIAN','AFTON','AITKIN','AKELEY','ALBANY','ALBERTA','ALBERT LEA','ALBERTVILLE','ALDEN','ALDRICH','ALEXANDRIA','ALPHA','ALTURA','ALVARADO','AMBOY','ANDOVER','ANNANDALE','ANOKA','APPLETON','APPLE VALLEY','ARCO','ARDEN HILLS','ARGYLE','ARLINGTON','ARNOLD','ASHBY','ASKOV','ATWATER','AUDUBON','AURORA','AUSTIN','AVOCA','AVON','BABBITT','BACKUS','BADGER','BAGLEY','BALATON','BARNESVILLE','BARNUM','BARRETT','BARRY','BATTLE LAKE','BAUDETTE','BAXTER','BAYPORT','BEARDSLEY','BEAVER BAY','BEAVER CREEK','BECKER','BEJOU','BELGRADE','BELLECHESTER','BELLE PLAINE','BELLINGHAM','BELTRAMI','BELVIEW','BEMIDJI','BENA','BENSON','BERTHA','BETHEL','BIGELOW','BIG FALLS','BIGFORK','BIG LAKE','BINGHAM LAKE','BIRCHWOOD VILLAGE','BIRD ISLAND','BISCAY','BIWABIK','BLACKDUCK','BLAINE','BLOMKEST','BLOOMING PRAIRIE','BLOOMINGTON','BLUE EARTH','BLUFFTON','BOCK','BORUP','BOVEY','BOWLUS','BOYD','BOY RIVER','BRAHAM','BRAINERD','BRANDON','BRECKENRIDGE','BREEZY POINT','BREWSTER','BRICELYN','BROOKLYN CENTER','BROOKLYN PARK','BROOK PARK','BROOKS','BROOKSTON','BROOTEN','BROWERVILLE','BROWNSDALE','BROWNS VALLEY','BROWNSVILLE','BROWNTON','BRUNO','BUCKMAN','BUFFALO','BUFFALO LAKE','BUHL','BURNSVILLE','BURTRUM','BUTTERFIELD','BYRON','CALEDONIA','CALLAWAY','CALUMET','CAMBRIDGE','CAMPBELL','CANBY','CANNON FALLS','CANTON','CARLOS','CARLTON','CARVER','CASS LAKE','CEDAR MILLS','CENTER CITY','CENTERVILLE','CEYLON','CHAMPLIN','CHANDLER','CHANHASSEN','CHASKA','CHATFIELD','CHICKAMAW BEACH','CHISAGO CITY','CHISHOLM','CHOKIO','CIRCLE PINES','CLARA CITY','CLAREMONT','CLARISSA','CLARKFIELD','CLARKS GROVE','CLEARBROOK','CLEAR LAKE','CLEARWATER','CLEMENTS','CLEVELAND','CLIMAX','CLINTON','CLITHERALL','CLONTARF','CLOQUET','COATES','COBDEN','COHASSET','COKATO','COLD SPRING','COLERAINE','COLOGNE','COLUMBIA HEIGHTS','COMFREY','COMSTOCK','CONGER','COOK','COON RAPIDS','CORCORAN','CORRELL','COSMOS','COTTAGE GROVE','COTTONWOOD','COURTLAND','CROMWELL','CROOKSTON','CROSBY','CROSSLAKE','CRYSTAL','CURRIE','CUYUNA','CYRUS','DAKOTA','DALTON','DANUBE','DANVERS','DARFUR','DARWIN','DASSEL','DAWSON','DAYTON','DEEPHAVEN','DEER CREEK','DEER RIVER','DEERWOOD','DE GRAFF','DELANO','DELAVAN','DELHI','DELLWOOD','DENHAM','DENNISON','DENT','DETROIT LAKES','DEXTER','DILWORTH','DODGE CENTER','DONALDSON','DONNELLY','DORAN','DOVER','DOVRAY','DULUTH','DUMONT','DUNDAS','DUNDEE','DUNNELL','EAGAN','EAGLE BEND','EAGLE LAKE','EAST BETHEL','EAST GRAND FORKS','EAST GULL LAKE','EASTON','ECHO','EDEN PRAIRIE','EDEN VALLEY','EDGERTON','EDINA','EFFIE','EITZEN','ELBA','ELBOW LAKE','ELBOW LAKE','ELGIN','ELIZABETH','ELKO','ELK RIVER','ELKTON','ELLENDALE','ELLSWORTH','ELMDALE','ELMORE','ELROSA','ELY','ELYSIAN','EMILY','EMMONS','ERHARD','ERSKINE','EVAN','EVANSVILLE','EVELETH','EXCELSIOR','EYOTA','FAIRFAX','FAIRMONT','FALCON HEIGHTS','FARIBAULT','FARMINGTON','FARWELL','FEDERAL DAM','FELTON','FERGUS FALLS','FERTILE','FIFTY LAKES','FINLAYSON','FISHER','FLENSBURG','FLOODWOOD','FLORENCE','FOLEY','FORADA','FOREST LAKE','FORESTON','FORT RIPLEY','FOSSTON','FOUNTAIN','FOXHOME','FRANKLIN','FRAZEE','FREEBORN','FREEPORT','FRIDLEY','FROST','FULDA','FUNKLEY','GARFIELD','GARRISON','GARVIN','GARY','GAYLORD','GEM LAKE','GENEVA','GENOLA','GEORGETOWN','GHENT','GIBBON','GILBERT','GILMAN','GLENCOE','GLENVILLE','GLENWOOD','GLYNDON','GOLDEN VALLEY','GONVICK','GOODHUE','GOODRIDGE','GOOD THUNDER','GOODVIEW','GRACEVILLE','GRANADA','GRAND MARAIS','GRAND MEADOW','GRAND RAPIDS','GRANITE FALLS','GRANT','GRASSTON','GREENBUSH','GREENFIELD','GREEN ISLE','GREENWALD','GREENWOOD','GREY EAGLE','GROVE CITY','GRYGLA','GULLY','HACKENSACK','HADLEY','HALLOCK','HALMA','HALSTAD','HAMBURG','HAM LAKE','HAMMOND','HAMPTON','HANCOCK','HANLEY FALLS','HANOVER','HANSKA','HARDING','HARDWICK','HARMONY','HARRIS','HARTLAND','HASTINGS','HATFIELD','HAWLEY','HAYFIELD','HAYWARD','HAZEL RUN','HECTOR','HEIDELBERG','HENDERSON','HENDRICKS','HENDRUM','HENNING','HENRIETTE','HERMAN','HERMANTOWN','HERON LAKE','HEWITT','HIBBING','HILL CITY','HILLMAN','HILLS','HILLTOP','HINCKLEY','HITTERDAL','HOFFMAN','HOKAH','HOLDINGFORD','HOLLAND','HOLLANDALE','HOLLOWAY','HOLT','HOPKINS','HOUSTON','HOWARD LAKE','HOYT LAKES','HUGO','HUMBOLDT','HUTCHINSON','IHLEN','INDEPENDENCE','INTERNATIONAL FALLS','INVER GROVE HEIGHTS','IONA','IRON JUNCTION','IRONTON','ISANTI','ISLE','IVANHOE','JACKSON','JANESVILLE','JASPER','JEFFERS','JENKINS','JOHNSON','JORDAN','KANDIYOHI','KARLSTAD','KASOTA','KASSON','KEEWATIN','KELLIHER','KELLOGG','KENNEDY','KENNETH','KENSINGTON','KENT','KENYON','KERKHOVEN','KERRICK','KETTLE RIVER','KIESTER','KILKENNY','KIMBALL','KINBRAE','KINGSTON','KINNEY','LA CRESCENT','LAFAYETTE','LAKE BENTON','LAKE BRONSON','LAKE CITY','LAKE CRYSTAL','LAKE ELMO','LAKEFIELD','LAKE HENRY','LAKELAND','LAKELAND SHORES','LAKE LILLIAN','LAKE PARK','LAKE ST. CROIX BEACH','LAKE SHORE','LAKEVILLE','LAKE WILSON','LAMBERTON','LANCASTER','LANDFALL','LANESBORO','LAPORTE','LA PRAIRIE','LA SALLE','LASTRUP','LAUDERDALE','LE CENTER','LENGBY','LEONARD','LEONIDAS','LEOTA','LE ROY','LESTER PRAIRIE','LE SUEUR','LEWISTON','LEWISVILLE','LEXINGTON','LILYDALE','LINDSTROM','LINO LAKES','LISMORE','LITCHFIELD','LITTLE CANADA','LITTLE FALLS','LITTLEFORK','LITTLE ROCK','LONG BEACH','LONG LAKE','LONG PRAIRIE','LONGVILLE','LONSDALE','LORETTO','LOUISBURG','LOWRY','LUCAN','LUVERNE','LYLE','LYND','MABEL','MCGRATH','MCGREGOR','MCINTOSH','MCKINLEY','MADELIA','MADISON','MADISON LAKE','MAGNOLIA','MAHNOMEN','MAHTOMEDI','MANCHESTER','MANHATTAN BEACH','MANKATO','MANTORVILLE','MAPLE GROVE','MAPLE LAKE','MAPLE PLAIN','MAPLETON','MAPLEVIEW','MAPLEWOOD','MARBLE','MARIETTA','MARINE ON ST. CROIX','MARSHALL','MAYER','MAYNARD','MAZEPPA','MEADOWLANDS','MEDFORD','MEDICINE LAKE','MEDINA','MEIRE GROVE','MELROSE','MENAHGA','MENDOTA','MENDOTA HEIGHTS','MENTOR','MIDDLE RIVER','MIESVILLE','MILACA','MILAN','MILLERVILLE','MILLVILLE','MILROY','MILTONA','MINNEAPOLIS','MINNEISKA','MINNEOTA','MINNESOTA CITY','MINNESOTA LAKE','MINNETONKA','MINNETONKA BEACH','MINNETRISTA','MIZPAH','MONTEVIDEO','MONTGOMERY','MONTICELLO','MONTROSE','MOORHEAD','MOOSE LAKE','MORA','MORGAN','MORRIS','MORRISTOWN','MORTON','MOTLEY','MOUND','MOUNDS VIEW','MOUNTAIN IRON','MOUNTAIN LAKE','MURDOCK','MYRTLE','NASHUA','NASHWAUK','NASSAU','NAYTAHWAUSH','NELSON','NERSTRAND','NEVIS','NEW AUBURN','NEW BRIGHTON','NEWFOLDEN','NEW GERMANY','NEW HOPE','NEW LONDON','NEW MARKET','NEW MUNICH','NEWPORT','NEW PRAGUE','NEW RICHLAND','NEW TRIER','NEW ULM','NEW YORK MILLS','NICOLLET','NIELSVILLE','NIMROD','NISSWA','NORCROSS','NORTH BRANCH','NORTHFIELD','NORTH MANKATO','NORTH OAKS','NORTHOME','NORTHROP','NORTH ST. PAUL','NORWOOD YOUNG AMERICA','OAKDALE','OAK GROVE','OAK PARK HEIGHTS','OAKPORT','ODESSA','ODIN','OGEMA','OGILVIE','OKABENA','OKLEE','OLIVIA','ONAMIA','ORMSBY','ORONO','ORONOCO','ORR','ORTONVILLE','OSAKIS','OSLO','OSSEO','OSTRANDER','OTSEGO','OTTERTAIL','OWATONNA','PALISADE','PARKERS PRAIRIE','PARK RAPIDS','PAYNESVILLE','PEASE','PELICAN RAPIDS','PEMBERTON','PENNOCK','PEQUOT LAKES','PERHAM','PERLEY','PETERSON','PIERZ','PILLAGER','PINE CITY','PINE ISLAND','PINE POINT','PINE RIVER','PINE SPRINGS','PIPESTONE','PLAINVIEW','PLATO','PLEASANT LAKE','PLUMMER','PLYMOUTH','PONEMAH','PORTER','PRESTON','PRINCETON','PRINSBURG','PRIOR LAKE','PROCTOR','QUAMBA','RACINE','RAMSEY','RANDALL','RANDOLPH','RANIER','RAYMOND','REDBY','RED LAKE','RED LAKE FALLS','RED WING','REDWOOD FALLS','REGAL','REMER','RENVILLE','REVERE','RICE','RICE LAKE','RICHFIELD','RICHMOND','RICHVILLE','RIVERTON','ROBBINSDALE','ROCHESTER','ROCK CREEK','ROCKFORD','ROCKVILLE','ROGERS','ROLLINGSTONE','RONNEBY','ROOSEVELT','ROSCOE','ROSEAU','ROSE CREEK','ROSEMOUNT','ROSEVILLE','ROTHSAY','ROUND LAKE','ROYALTON','RUSH CITY','RUSHFORD','RUSHFORD VILLAGE','RUSHMORE','RUSSELL','RUTHTON','RUTLEDGE','SABIN','SACRED HEART','ST. ANTHONY','ST. ANTHONY','ST. BONIFACIUS','ST. CHARLES','ST. CLAIR','ST. CLOUD','ST. FRANCIS','ST. HILAIRE','ST. JAMES','ST. JOSEPH','ST. LEO','ST. LOUIS PARK','ST. MARTIN','ST. MARYS POINT','ST. MICHAEL','ST. PAUL','ST. PAUL PARK','ST. PETER','ST. ROSA','ST. STEPHEN','ST. VINCENT','SANBORN','SANDSTONE','SARGEANT','SARTELL','SAUK CENTRE','SAUK RAPIDS','SAVAGE','SCANLON','SEAFORTH','SEBEKA','SEDAN','SHAFER','SHAKOPEE','SHELLY','SHERBURN','SHEVLIN','SHOREVIEW','SHOREWOOD','SILVER BAY','SILVER LAKE','SKYLINE','SLAYTON','SLEEPY EYE','SOBIESKI','SOLWAY','SOUTH HAVEN','SOUTH ST. PAUL','SPICER','SPRINGFIELD','SPRING GROVE','SPRING HILL','SPRING LAKE PARK','SPRING PARK','SPRING VALLEY','SQUAW LAKE','STACY','STAPLES','STARBUCK','STEEN','STEPHEN','STEWART','STEWARTVILLE','STILLWATER','STOCKTON','STORDEN','STRANDQUIST','STRATHCONA','STURGEON LAKE','SUNBURG','SUNFISH LAKE','SWANVILLE','TACONITE','TAMARACK','TAOPI','TAUNTON','TAYLORS FALLS','TENNEY','TENSTRIKE','THE LAKES','THIEF RIVER FALLS','THOMSON','TINTAH','TONKA BAY','TOWER','TRACY','TRAIL','TRIMONT','TROMMALD','TROSKY','TRUMAN','TURTLE RIVER','TWIN LAKES','TWIN VALLEY','TWO HARBORS','TYLER','ULEN','UNDERWOOD','UPSALA','URBANK','UTICA','VADNAIS HEIGHTS','VERGAS','VERMILLION','VERNDALE','VERNON CENTER','VESTA','VICTORIA','VIKING','VILLARD','VINELAND','VINING','VIRGINIA','WABASHA','WABASSO','WACONIA','WADENA','WAHKON','WAITE PARK','WALDORF','WALKER','WALNUT GROVE','WALTERS','WALTHAM','WANAMINGO','WANDA','WARBA','WARREN','WARROAD','WASECA','WATERTOWN','WATERVILLE','WATKINS','WATSON','WAUBUN','WAVERLY','WAYZATA','WELCOME','WELLS','WENDELL','WESTBROOK','WEST CONCORD','WESTPORT','WEST ST. PAUL','WEST UNION','WHALAN','WHEATON','WHITE BEAR LAKE','WHITE EARTH','WILDER','WILLERNIE','WILLIAMS','WILLMAR','WILLOW RIVER','WILMONT','WILTON','WINDOM','WINGER','WINNEBAGO','WINONA','WINSTED','WINTHROP','WINTON','WOLF LAKE','WOLVERTON','WOODBURY','WOOD LAKE','WOODLAND','WOODSTOCK','WORTHINGTON','WRENSHALL','WRIGHT','WYKOFF','WYOMING','ZEMPLE','ZIMMERMAN','ZUMBRO FALLS','ZUMBROTA'];
    var cit = ['Ada',	'Adams',	'Adrian',	'Afton',	'Aitkin',	'Akeley',	'Albany',	'Alberta',	'Albert Lea',	'Albertville',	'Alden',	'Aldrich',	'Alexandria',	'Alpha',	'Altura',	'Alvarado',	'Amboy',	'Andover',	'Annandale',	'Anoka',	'Appleton',	'Apple Valley',	'Arco',	'Arden Hills',	'Argyle',	'Arlington',	'Arnold',	'Ashby',	'Askov',	'Atwater',	'Audubon',	'Aurora',	'Austin',	'Avoca',	'Avon',	'Babbitt',	'Backus',	'Badger',	'Bagley',	'Balaton',	'Barnesville',	'Barnum',	'Barrett',	'Barry',	'Battle Lake',	'Baudette',	'Baxter',	'Bayport',	'Beardsley',	'Beaver Bay',	'Beaver Creek',	'Becker',	'Bejou',	'Belgrade',	'Bellechester',	'Belle Plaine',	'Bellingham',	'Beltrami',	'Belview',	'Bemidji',	'Bena',	'Benson',	'Bertha',	'Bethel',	'Bigelow',	'Big Falls',	'Bigfork',	'Big Lake',	'Bingham Lake',	'Birchwood Village',	'Bird Island',	'Biscay',	'Biwabik',	'Blackduck',	'Blaine',	'Blomkest',	'Blooming Prairie',	'Bloomington',	'Blue Earth',	'Bluffton',	'Bock',	'Borup',	'Bovey',	'Bowlus',	'Boyd',	'Boy River',	'Braham',	'Brainerd',	'Brandon',	'Breckenridge',	'Breezy Point',	'Brewster',	'Bricelyn',	'Brooklyn Center',	'Brooklyn Park',	'Brook Park',	'Brooks',	'Brookston',	'Brooten',	'Browerville',	'Brownsdale',	'Browns Valley',	'Brownsville',	'Brownton',	'Bruno',	'Buckman',	'Buffalo',	'Buffalo Lake',	'Buhl',	'Burnsville',	'Burtrum',	'Butterfield',	'Byron',	'Caledonia',	'Callaway',	'Calumet',	'Cambridge',	'Campbell',	'Canby',	'Cannon Falls',	'Canton',	'Carlos',	'Carlton',	'Carver',	'Cass Lake',	'Cedar Mills',	'Center City',	'Centerville',	'Ceylon',	'Champlin',	'Chandler',	'Chanhassen',	'Chaska',	'Chatfield',	'Chickamaw Beach',	'Chisago City',	'Chisholm',	'Chokio',	'Circle Pines',	'Clara City',	'Claremont',	'Clarissa',	'Clarkfield',	'Clarks Grove',	'Clearbrook',	'Clear Lake',	'Clearwater',	'Clements',	'Cleveland',	'Climax',	'Clinton',	'Clitherall',	'Clontarf',	'Cloquet',	'Coates',	'Cobden',	'Cohasset',	'Cokato',	'Cold Spring',	'Coleraine',	'Cologne',	'Columbia Heights',	'Comfrey',	'Comstock',	'Conger',	'Cook',	'Coon Rapids',	'Corcoran',	'Correll',	'Cosmos',	'Cottage Grove',	'Cottonwood',	'Courtland',	'Cromwell',	'Crookston',	'Crosby',	'Crosslake',	'Crystal',	'Currie',	'Cuyuna',	'Cyrus',	'Dakota',	'Dalton',	'Danube',	'Danvers',	'Darfur',	'Darwin',	'Dassel',	'Dawson',	'Dayton',	'Deephaven',	'Deer Creek',	'Deer River',	'Deerwood',	'De Graff',	'Delano',	'Delavan',	'Delhi',	'Dellwood',	'Denham',	'Dennison',	'Dent',	'Detroit Lakes',	'Dexter',	'Dilworth',	'Dodge Center',	'Donaldson',	'Donnelly',	'Doran',	'Dover',	'Dovray',	'Duluth',	'Dumont',	'Dundas',	'Dundee',	'Dunnell',	'Eagan',	'Eagle Bend',	'Eagle Lake',	'East Bethel',	'East Grand Forks',	'East Gull Lake',	'Easton',	'Echo',	'Eden Prairie',	'Eden Valley',	'Edgerton',	'Edina',	'Effie',	'Eitzen',	'Elba',	'Elbow Lake',	'Elbow Lake',	'Elgin',	'Elizabeth',	'Elko',	'Elk River',	'Elkton',	'Ellendale',	'Ellsworth',	'Elmdale',	'Elmore',	'Elrosa',	'Ely',	'Elysian',	'Emily',	'Emmons',	'Erhard',	'Erskine',	'Evan',	'Evansville',	'Eveleth',	'Excelsior',	'Eyota',	'Fairfax',	'Fairmont',	'Falcon Heights',	'Faribault',	'Farmington',	'Farwell',	'Federal Dam',	'Felton',	'Fergus Falls',	'Fertile',	'Fifty Lakes',	'Finlayson',	'Fisher',	'Flensburg',	'Floodwood',	'Florence',	'Foley',	'Forada',	'Forest Lake',	'Foreston',	'Fort Ripley',	'Fosston',	'Fountain',	'Foxhome',	'Franklin',	'Frazee',	'Freeborn',	'Freeport',	'Fridley',	'Frost',	'Fulda',	'Funkley',	'Garfield',	'Garrison',	'Garvin',	'Gary',	'Gaylord',	'Gem Lake',	'Geneva',	'Genola',	'Georgetown',	'Ghent',	'Gibbon',	'Gilbert',	'Gilman',	'Glencoe',	'Glenville',	'Glenwood',	'Glyndon',	'Golden Valley',	'Gonvick',	'Goodhue',	'Goodridge',	'Good Thunder',	'Goodview',	'Graceville',	'Granada',	'Grand Marais',	'Grand Meadow',	'Grand Rapids',	'Granite Falls',	'Grant',	'Grasston',	'Greenbush',	'Greenfield',	'Green Isle',	'Greenwald',	'Greenwood',	'Grey Eagle',	'Grove City',	'Grygla',	'Gully',	'Hackensack',	'Hadley',	'Hallock',	'Halma',	'Halstad',	'Hamburg',	'Ham Lake',	'Hammond',	'Hampton',	'Hancock',	'Hanley Falls',	'Hanover',	'Hanska',	'Harding',	'Hardwick',	'Harmony',	'Harris',	'Hartland',	'Hastings',	'Hatfield',	'Hawley',	'Hayfield',	'Hayward',	'Hazel Run',	'Hector',	'Heidelberg',	'Henderson',	'Hendricks',	'Hendrum',	'Henning',	'Henriette',	'Herman',	'Hermantown',	'Heron Lake',	'Hewitt',	'Hibbing',	'Hill City',	'Hillman',	'Hills',	'Hilltop',	'Hinckley',	'Hitterdal',	'Hoffman',	'Hokah',	'Holdingford',	'Holland',	'Hollandale',	'Holloway',	'Holt',	'Hopkins',	'Houston',	'Howard Lake',	'Hoyt Lakes',	'Hugo',	'Humboldt',	'Hutchinson',	'Ihlen',	'Independence',	'International Falls',	'Inver Grove Heights',	'Iona',	'Iron Junction',	'Ironton',	'Isanti',	'Isle',	'Ivanhoe',	'Jackson',	'Janesville',	'Jasper',	'Jeffers',	'Jenkins',	'Johnson',	'Jordan',	'Kandiyohi',	'Karlstad',	'Kasota',	'Kasson',	'Keewatin',	'Kelliher',	'Kellogg',	'Kennedy',	'Kenneth',	'Kensington',	'Kent',	'Kenyon',	'Kerkhoven',	'Kerrick',	'Kettle River',	'Kiester',	'Kilkenny',	'Kimball',	'Kinbrae',	'Kingston',	'Kinney',	'La Crescent',	'Lafayette',	'Lake Benton',	'Lake Bronson',	'Lake City',	'Lake Crystal',	'Lake Elmo',	'Lakefield',	'Lake Henry',	'Lakeland',	'Lakeland Shores',	'Lake Lillian',	'Lake Park',	'Lake St. Croix Beach',	'Lake Shore',	'Lakeville',	'Lake Wilson',	'Lamberton',	'Lancaster',	'Landfall',	'Lanesboro',	'Laporte',	'La Prairie',	'La Salle',	'Lastrup',	'Lauderdale',	'Le Center',	'Lengby',	'Leonard',	'Leonidas',	'Leota',	'Le Roy',	'Lester Prairie',	'Le Sueur',	'Lewiston',	'Lewisville',	'Lexington',	'Lilydale',	'Lindstrom',	'Lino Lakes',	'Lismore',	'Litchfield',	'Little Canada',	'Little Falls',	'Littlefork',	'Little Rock',	'Long Beach',	'Long Lake',	'Long Prairie',	'Longville',	'Lonsdale',	'Loretto',	'Louisburg',	'Lowry',	'Lucan',	'Luverne',	'Lyle',	'Lynd',	'Mabel',	'McGrath',	'McGregor',	'McIntosh',	'McKinley',	'Madelia',	'Madison',	'Madison Lake',	'Magnolia',	'Mahnomen',	'Mahtomedi',	'Manchester',	'Manhattan Beach',	'Mankato',	'Mantorville',	'Maple Grove',	'Maple Lake',	'Maple Plain',	'Mapleton',	'Mapleview',	'Maplewood',	'Marble',	'Marietta',	'Marine on St. Croix',	'Marshall',	'Mayer',	'Maynard',	'Mazeppa',	'Meadowlands',	'Medford',	'Medicine Lake',	'Medina',	'Meire Grove',	'Melrose',	'Menahga',	'Mendota',	'Mendota Heights',	'Mentor',	'Middle River',	'Miesville',	'Milaca',	'Milan',	'Millerville',	'Millville',	'Milroy',	'Miltona',	'Minneapolis',	'Minneiska',	'Minneota',	'Minnesota City',	'Minnesota Lake',	'Minnetonka',	'Minnetonka Beach',	'Minnetrista',	'Mizpah',	'Montevideo',	'Montgomery',	'Monticello',	'Montrose',	'Moorhead',	'Moose Lake',	'Mora',	'Morgan',	'Morris',	'Morristown',	'Morton',	'Motley',	'Mound',	'Mounds View',	'Mountain Iron',	'Mountain Lake',	'Murdock',	'Myrtle',	'Nashua',	'Nashwauk',	'Nassau',	'Naytahwaush',	'Nelson',	'Nerstrand',	'Nevis',	'New Auburn',	'New Brighton',	'Newfolden',	'New Germany',	'New Hope',	'New London',	'New Market',	'New Munich',	'Newport',	'New Prague',	'New Richland',	'New Trier',	'New Ulm',	'New York Mills',	'Nicollet',	'Nielsville',	'Nimrod',	'Nisswa',	'Norcross',	'North Branch',	'Northfield',	'North Mankato',	'North Oaks',	'Northome',	'Northrop',	'North St. Paul',	'Norwood Young America',	'Oakdale',	'Oak Grove',	'Oak Park Heights',	'Oakport',	'Odessa',	'Odin',	'Ogema',	'Ogilvie',	'Okabena',	'Oklee',	'Olivia',	'Onamia',	'Ormsby',	'Orono',	'Oronoco',	'Orr',	'Ortonville',	'Osakis',	'Oslo',	'Osseo',	'Ostrander',	'Otsego',	'Ottertail',	'Owatonna',	'Palisade',	'Parkers Prairie',	'Park Rapids',	'Paynesville',	'Pease',	'Pelican Rapids',	'Pemberton',	'Pennock',	'Pequot Lakes',	'Perham',	'Perley',	'Peterson',	'Pierz',	'Pillager',	'Pine City',	'Pine Island',	'Pine Point',	'Pine River',	'Pine Springs',	'Pipestone',	'Plainview',	'Plato',	'Pleasant Lake',	'Plummer',	'Plymouth',	'Ponemah',	'Porter',	'Preston',	'Princeton',	'Prinsburg',	'Prior Lake',	'Proctor',	'Quamba',	'Racine',	'Ramsey',	'Randall',	'Randolph',	'Ranier',	'Raymond',	'Redby',	'Red Lake',	'Red Lake Falls',	'Red Wing',	'Redwood Falls',	'Regal',	'Remer',	'Renville',	'Revere',	'Rice',	'Rice Lake',	'Richfield',	'Richmond',	'Richville',	'Riverton',	'Robbinsdale',	'Rochester',	'Rock Creek',	'Rockford',	'Rockville',	'Rogers',	'Rollingstone',	'Ronneby',	'Roosevelt',	'Roscoe',	'Roseau',	'Rose Creek',	'Rosemount',	'Roseville',	'Rothsay',	'Round Lake',	'Royalton',	'Rush City',	'Rushford',	'Rushford Village',	'Rushmore',	'Russell',	'Ruthton',	'Rutledge',	'Sabin',	'Sacred Heart',	'St. Anthony city (Hennepin County)',	'St. Anthony city (Stearns County)',	'St. Bonifacius',	'St. Charles',	'St. Clair',	'St. Cloud',	'St. Francis',	'St. Hilaire',	'St. James',	'St. Joseph',	'St. Leo',	'St. Louis Park',	'St. Martin',	'St. Marys Point',	'St. Michael',	'St. Paul',	'St. Paul Park',	'St. Peter',	'St. Rosa',	'St. Stephen',	'St. Vincent',	'Sanborn',	'Sandstone',	'Sargeant',	'Sartell',	'Sauk Centre',	'Sauk Rapids',	'Savage',	'Scanlon',	'Seaforth',	'Sebeka',	'Sedan',	'Shafer',	'Shakopee',	'Shelly',	'Sherburn',	'Shevlin',	'Shoreview',	'Shorewood',	'Silver Bay',	'Silver Lake',	'Skyline',	'Slayton',	'Sleepy Eye',	'Sobieski',	'Solway',	'South Haven',	'South St. Paul',	'Spicer',	'Springfield',	'Spring Grove',	'Spring Hill',	'Spring Lake Park',	'Spring Park',	'Spring Valley',	'Squaw Lake',	'Stacy',	'Staples',	'Starbuck',	'Steen',	'Stephen',	'Stewart',	'Stewartville',	'Stillwater',	'Stockton',	'Storden',	'Strandquist',	'Strathcona',	'Sturgeon Lake',	'Sunburg',	'Sunfish Lake',	'Swanville',	'Taconite',	'Tamarack',	'Taopi',	'Taunton',	'Taylors Falls',	'Tenney',	'Tenstrike',	'The Lakes',	'Thief River Falls',	'Thomson',	'Tintah',	'Tonka Bay',	'Tower',	'Tracy',	'Trail',	'Trimont',	'Trommald',	'Trosky',	'Truman',	'Turtle River',	'Twin Lakes',	'Twin Valley',	'Two Harbors',	'Tyler',	'Ulen',	'Underwood',	'Upsala',	'Urbank',	'Utica',	'Vadnais Heights',	'Vergas',	'Vermillion',	'Verndale',	'Vernon Center',	'Vesta',	'Victoria',	'Viking',	'Villard',	'Vineland',	'Vining',	'Virginia',	'Wabasha',	'Wabasso',	'Waconia',	'Wadena',	'Wahkon',	'Waite Park',	'Waldorf',	'Walker',	'Walnut Grove',	'Walters',	'Waltham',	'Wanamingo',	'Wanda',	'Warba',	'Warren',	'Warroad',	'Waseca',	'Watertown',	'Waterville',	'Watkins',	'Watson',	'Waubun',	'Waverly',	'Wayzata',	'Welcome',	'Wells',	'Wendell',	'Westbrook',	'West Concord',	'Westport',	'West St. Paul',	'West Union',	'Whalan',	'Wheaton',	'White Bear Lake',	'White Earth',	'Wilder',	'Willernie',	'Williams',	'Willmar',	'Willow River',	'Wilmont',	'Wilton',	'Windom',	'Winger',	'Winnebago',	'Winona',	'Winsted',	'Winthrop',	'Winton',	'Wolf Lake',	'Wolverton',	'Woodbury',	'Wood Lake',	'Woodland',	'Woodstock',	'Worthington',	'Wrenshall',	'Wright',	'Wykoff',	'Wyoming',	'Zemple',	'Zimmerman',	'Zumbro Falls',	'Zumbrota']
    var citi = req.body.city_name;
    var sta = req.body.city_name + ", " + req.body.state_name;

    if(err){
      res.render('insertme', {
        msg: err
      });
    }

    //validation
    if (!req.body.price || !req.body.party_name || !req.body.city_name || !req.body.address|| !req.body.additional || !req.body.startDate || !req.body.endDate  ){
      req.flash('error', 'Fill in all required fields')
      res.redirect('/insertme');
    }


    //
    //check if input state is minnesota
    if (states.toLowerCase().indexOf("minnesota") !== -1){
        if (cit.indexOf(citi) > -1) {

          if(req.file != undefined){
            
            console.log(sta);
            db.query("insert into `party` (party_name,address,city_name,state_name,userid,image,price,startDate, startTime, endDate, endTime, aditional) values ('"+req.body.party_name+"', '"+req.body.address+"','"+sta+"','"+req.body.state_name+"','"+req.user.id+"','"+req.file.filename+"','"+req.body.price+"', '"+req.body.startDate+"', '"+req.body.startTime+"', '"+req.body.endDate+"', '"+req.body.endTime+"', '"+req.body.additional+"')", function(err, rs){
              if (!err){
                req.flash('success_messages', 'Your event successfully added. Continue adding or go to homepage to view it.')
                res.redirect('/insertme');
              }
              else{
              res.send(err);
              }
            
            });
          }
          else{
            var defaults = "defaults.jpg";
            db.query("insert into `party` (party_name,address,city_name,state_name,userid, price, startDate, startTime, endDate, endTime, aditional, image) values ('"+req.body.party_name+"', '"+req.body.address+"','"+sta+"','"+req.body.state_name+"' ,'"+req.user.id+"','"+req.body.price+"',  '"+req.body.startDate+"', '"+req.body.startTime+"',  '"+req.body.endDate+"', '"+req.body.endTime+"','"+req.body.additional+"', '"+defaults+"' )", function(err, rs){
              if(!err){
                req.flash('success_messages', 'Your event successfully added. Continue adding or go to homepage to view it.')
                res.redirect('/insertme');
              }
              else{
                res.send(err);
              }
              
            });
            
          }
      } else {
        res.render('insertme', {
          msg: 'Error: Please, Select Only Cities Availble in the Dropdown !'
        });
      }
    }

    else{
      res.render('insertme', {
        msg: 'Error: Please Select Only Minnesota in State Field!'
      });
    }
  


  });
});
       
router.get('/delete', function (req, res, next){
  db.query('delete from state where id = ?')
});

//start here

// return homepage


// search function  

router.get('/search',function(req,res){
  let q = req.query.search;


  let v = req.query.date;
  console.log(v);

if (req.query.city && req.query.date ) {
  db.query('SELECT partyid,  city_name, state_name, party_name, aditional, price, startDate, startTime, endDate, endTime, image, address, full_name FROM register natural join party where userid = id and city_name LIKE "%'+req.query.city+'%" and startDate = "'+req.query.date+'" ',function(err, rs, fields) {
    if (err) throw err;

    if(!req.user){
      
      res.render('test', {party: rs, moment:moment});
      }
    if(req.user){
      res.render('profile', {party: rs, moment:moment});
    }

  });
}

if(!req.query.city){
  db.query('SELECT partyid,  city_name, aditional, state_name, party_name, price, startDate, startTime, endDate, endTime, image, address, full_name FROM register natural join party where userid = id  and startDate = "'+req.query.date+'" ',function(err, rs, fields) {
    if (err) throw err;
    if(!req.user){ 
      res.render('test', {party: rs, moment:moment});
    }
    if(req.user){
      res.render('profile', {party: rs, moment:moment});
    }

  });
}


if(!req.query.date){
  db.query('SELECT partyid,  city_name, state_name, aditional, party_name, price, startDate, startTime, endDate, endTime, image, address, full_name FROM register natural join party where userid = id and city_name LIKE "%'+req.query.city+'%" ',function(err, rs, fields) {
    if (err) throw err;
    if(!req.user){
      
      res.render('test', {party: rs, moment:moment});
    }
      if(req.user){
      res.render('profile', {party: rs, moment:moment});
    }

  });
}
});


router.get('/advert',function(req,res){
  res.render('advert');

});






router.get('/dash',function(req,res){
  res.render('dash');
});



router.get('/test',function(req,res){
  res.render('test');
});




//register user page
router.get('/register',function(req,res){
  res.render('register');
});


//register user post
router.post('/register', function(req,res){
  const {lname, fname, email, phone, address, city, state, password, password2} = req.body;
  let errors = [];




  if(!lname || !fname || !address || !city || !state || !email || !password || !password2) {
    errors.push({msg: 'Please fill in all required fields'});
  }

  if(password != password2){
    errors.push({msg: 'Password do not match'});
  }

  if(errors.length > 0) {
    res.render('register', {
      errors,
      lname,
      fname,
      address,
      city,
      state,
      email,
      phone,
      password,
      password2
    });
  }
  // validation passed
  else{
    db.query("select COUNT(*) AS cnt from users where email = ? ",
    email, function(err, data){
      if(err){
        res.send(err);
      }
      else{
        if(data[0].cnt >0) {
          errors.push({msg: 'Email is already Registered'});
          res.render('register', {
            errors,
            lname,
            fname,
            address,
            city,
            state,
            email,
            phone,
            password,
            password2
          });
        }
        else{    
          async.waterfall([
            function(done) {
              crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
             
                done(err, token);
              });
            },

            function(token, done) {
               bcrypt.genSalt(10,(err,salt)=>bcrypt.hash(password, salt, (err, hash)=>{
                 if(err) throw err;

                  //set pass to hash;
                let password = hash;

                db.query("insert into `users`(fname, lname,  email, phone_no, address, city, state, password, confirmtoken) values ('"+fname+"','"+lname+"', '"+email+"','"+phone+"','"+address+"','"+city+"', '"+state+"','"+password+"','"+token+"')", function(err, rs){
                  if(err){
                    req.flash('error', 'Account not Registered.Please try again')
                    res.redirect('/register');
                  }
                  else{
                    req.flash('success_msg', 'Please check your email inbox or junks to confirm your email to login')
                    res.redirect('/login');
                   }
                });

              }));

              done(err, token, data);
      
            },

            function(token, data, done) {
       
              var smtpTransport = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
               secure: true,
                //service: 'Gmail', 
                auth: {
                  type: 'OAuth2',
                  user: 'info@partifest.com',
                  serviceClient: "102086845611841503378",
                  privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCwORit6+APfwO/\nVj4ofvy1Jpr+VRQZJdc9vBRtB2TCSCi1Q7C20iiqHLL62b7x6JQECrFFYXMlF8RE\nZJxyZXaJeq8hrAZSY64JGvj8XNMzAElA/gDeSJ6gWSJv/KU2NcAt3OoVSzTwoEo3\nmdvnEld2sebjaIw+drvwS/TeWFJtXVvqqtb0FhYulxHmAQyyVtR6q42Cyfh/aroc\nVZVHywxiCViqztwnpw3UF/1mxx0b6aqjVjxlxHHMz5qyWUBez7Ksgn6Hcv2laEzb\n8H6qOlvlBmo495lpxm1+8BRS4nMm8P5OMXeS7DnoFZ6ToNRKD10TxlqqzSAqaOke\nWKhNmbcPAgMBAAECggEABMkNeNjulQfPnpLao0I3iI/Le7FBwiEQmZY8Pm20oxX5\n4lo74pW4ZvjaigyprmtbbEoCCwPyGtrCCKgWxisn2eSL/EUYnYTOxWPcc7Xtl5/1\nXUod1JYc60vLBJwpZwcfTd+G4nHQC+ITwd4au56i42VCA4DjoLqcBegky849hsdh\nBopgEq5O0qL/DBvZ0gOhoLhaWePvkoQPq8ahFu/S7bMMwFmN/Rts3XVWgnA3io/Q\nrIF9dS47ocCShNL2THboIxS9AjN1Fp/a/POVbzoNAQ4Q7M2XatbdEj+tsdh3ltHk\nTQX1TMHaX5GbzSJ+xkffqYE0L1LxsUc+nOCKgSY1KQKBgQDc7bGOWjMFgWbEbfuo\nekFKBRf1di0C+X4eyLhpk0Yj/l/0juoFXhp7cKo565OLzo65VCbxD3RSpbrRyA7P\nAQq9goi+CA09oDdEX9KSIF8L219J5xCZI9+BHfw9Ku2Lym2nprBq5wYVJus8cTef\njuOz+UD8xKQJB0AGvTyTBHISUwKBgQDMMp55yezSfpu0vGk7Sj1j25EjZvSv7poP\nPi97jgdM9YaccIclVBw7L5EPCH+qaU5k3koB1KfAaE97wY+RVbt5HxvtPirsQ/cF\nx43s5sKV7qW9FY5cCJUu3i74Qu2+qMdcX1n49RhgGk4yLKEgrDaNn0+pGmgLjLRi\nPfDfxW6o1QKBgBFgtP2whKDjO9UpnYj0DNyop+jL4eCBBXWgbjkHt5WvNZcEAs5n\nR4f8JbemmxV9KubTArklcQ3rMVW8+cU4nMKpWN4xvfDiAFblfqe12iQRnl4uybRy\nCOucEzIwhTzgsF1mlCvkfir9w7UeZrSrRafrbDw1r31yT4v4KKKbz+k3AoGASyfC\nTj70rBCvTFkgPhM3/x3cEHSfUHV4PG392fLPWxLvBXshMqr/bQU31ZmiK11w3g02\nne/gAiAiSQFXzv0H8C9z/uCnuafWLklhQjU4nyhj1fEuIU+DYOmjzfoMOOUz4xqx\nKcFDxHNKHotwjm7z8TIWhr3SV5Xk+lej5ShsbzUCgYEAxJ1p8LLOwnJhB675o5wu\nVdLphwPu4lDA3YotuSdLf5b1K59nNN6OhynTzu4tw/TqGrzJFwzCrLK1o93077DF\nUQYm5hzxcTTKyXu+jgBnzCC9uix1a/wy2nBbxgYzZ5QyUMXYAwIg178k6k1CVRn2\nahIfmPd5R8ntWjQsl6dIUq8=\n-----END PRIVATE KEY-----\n"
                },
               tls:{
              rejectUnauthorized:false
               }
              });
        
              
              console.log(token);
              var mailOptions = {
                
                to: email,
                from: 'tjlayan20@gmail.com',
                subject: 'PartiFest Email Confirmation',
                text: 'You are receiving this because you just register for an account with us.\n\n' +
                  'Please click on the following link, or paste this into your browser to confirm your email:\n\n' +
                  'http://' + req.headers.host + '/confirm/' + token + '\n\n' +
                  'Thanks.\n'
              };
              smtpTransport.sendMail(mailOptions, function(err) {
                console.log('mail sent');
        
                req.flash('success_messages', 'A confirmation e-mail has been sent to ' + email + ' with further instructions.');
                done(err, 'done');
            
              });
          
            }
        
          ],
        
          function(err){
            if (err) return next(err);
            res.redirect( '/login');
          });


        }
      }  
    });
  }

});

//register business page
router.get('/register-business',function(req,res){
  res.render('register-business');
});


//register user post
router.post('/register-business', function(req,res){
  const {bname, email, phone, address, city, state, password, password2} = req.body;
  let errors = [];

console.log( bname,
  address,
  city,
  state,
  email,
  phone,
  password,
  password2);


  if(!bname ||  !address || !city || !state || !email || !password || !password2) {
    errors.push({msg: 'Please fill in all required fields'});
  }

  if(password != password2){
    errors.push({msg: 'Password do not match'});
  }

  if(errors.length > 0) {
    res.render('register-business', {
      errors,
      bname,
      address,
      city,
      state,
      email,
      phone,
      password,
      password2
    });
  }
  // validation passed
  else{
    db.query("select COUNT(*) AS cnt from business where email = ? ",
    email, function(err, data){
      if(err){
        res.send(err);
      }
      else{
        if(data[0].cnt >0) {
          errors.push({msg: 'Email is already Registered'});
          res.render('register-business', {
            errors,
            bname,
            address,
            city,
            state,
            email,
            phone,
            password,
            password2
          });
        }
        else{    
          async.waterfall([
            function(done) {
              crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
             
                done(err, token);
              });
            },

            function(token, done) {
               bcrypt.genSalt(10,(err,salt)=>bcrypt.hash(password, salt, (err, hash)=>{
                 if(err) throw err;

                  //set pass to hash;
                let password = hash;

                db.query("insert into `business`(bus_name,  email, phone_no, address, city, state, password, confirmtoken) values ('"+bname+"', '"+email+"','"+phone+"','"+address+"','"+city+"', '"+state+"','"+password+"','"+token+"')", function(err, rs){
                  if(err){

                    res.render(err)
                    //req.flash('error', 'Account not Registered.Please try again')
                    //res.redirect('/register-business');
                  }
                  else{
                    req.flash('success_msg', 'Please check your email inbox or junks to confirm your email to login')
                    res.redirect('/login-business');
                   }
                });

              }));

              done(err, token, data);
      
            },

            function(token, data, done) {
       
              var smtpTransport = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
               secure: true,
                //service: 'Gmail', 
                auth: {
                  type: 'OAuth2',
                  user: 'info@partifest.com',
                  serviceClient: "102086845611841503378",
                  privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCwORit6+APfwO/\nVj4ofvy1Jpr+VRQZJdc9vBRtB2TCSCi1Q7C20iiqHLL62b7x6JQECrFFYXMlF8RE\nZJxyZXaJeq8hrAZSY64JGvj8XNMzAElA/gDeSJ6gWSJv/KU2NcAt3OoVSzTwoEo3\nmdvnEld2sebjaIw+drvwS/TeWFJtXVvqqtb0FhYulxHmAQyyVtR6q42Cyfh/aroc\nVZVHywxiCViqztwnpw3UF/1mxx0b6aqjVjxlxHHMz5qyWUBez7Ksgn6Hcv2laEzb\n8H6qOlvlBmo495lpxm1+8BRS4nMm8P5OMXeS7DnoFZ6ToNRKD10TxlqqzSAqaOke\nWKhNmbcPAgMBAAECggEABMkNeNjulQfPnpLao0I3iI/Le7FBwiEQmZY8Pm20oxX5\n4lo74pW4ZvjaigyprmtbbEoCCwPyGtrCCKgWxisn2eSL/EUYnYTOxWPcc7Xtl5/1\nXUod1JYc60vLBJwpZwcfTd+G4nHQC+ITwd4au56i42VCA4DjoLqcBegky849hsdh\nBopgEq5O0qL/DBvZ0gOhoLhaWePvkoQPq8ahFu/S7bMMwFmN/Rts3XVWgnA3io/Q\nrIF9dS47ocCShNL2THboIxS9AjN1Fp/a/POVbzoNAQ4Q7M2XatbdEj+tsdh3ltHk\nTQX1TMHaX5GbzSJ+xkffqYE0L1LxsUc+nOCKgSY1KQKBgQDc7bGOWjMFgWbEbfuo\nekFKBRf1di0C+X4eyLhpk0Yj/l/0juoFXhp7cKo565OLzo65VCbxD3RSpbrRyA7P\nAQq9goi+CA09oDdEX9KSIF8L219J5xCZI9+BHfw9Ku2Lym2nprBq5wYVJus8cTef\njuOz+UD8xKQJB0AGvTyTBHISUwKBgQDMMp55yezSfpu0vGk7Sj1j25EjZvSv7poP\nPi97jgdM9YaccIclVBw7L5EPCH+qaU5k3koB1KfAaE97wY+RVbt5HxvtPirsQ/cF\nx43s5sKV7qW9FY5cCJUu3i74Qu2+qMdcX1n49RhgGk4yLKEgrDaNn0+pGmgLjLRi\nPfDfxW6o1QKBgBFgtP2whKDjO9UpnYj0DNyop+jL4eCBBXWgbjkHt5WvNZcEAs5n\nR4f8JbemmxV9KubTArklcQ3rMVW8+cU4nMKpWN4xvfDiAFblfqe12iQRnl4uybRy\nCOucEzIwhTzgsF1mlCvkfir9w7UeZrSrRafrbDw1r31yT4v4KKKbz+k3AoGASyfC\nTj70rBCvTFkgPhM3/x3cEHSfUHV4PG392fLPWxLvBXshMqr/bQU31ZmiK11w3g02\nne/gAiAiSQFXzv0H8C9z/uCnuafWLklhQjU4nyhj1fEuIU+DYOmjzfoMOOUz4xqx\nKcFDxHNKHotwjm7z8TIWhr3SV5Xk+lej5ShsbzUCgYEAxJ1p8LLOwnJhB675o5wu\nVdLphwPu4lDA3YotuSdLf5b1K59nNN6OhynTzu4tw/TqGrzJFwzCrLK1o93077DF\nUQYm5hzxcTTKyXu+jgBnzCC9uix1a/wy2nBbxgYzZ5QyUMXYAwIg178k6k1CVRn2\nahIfmPd5R8ntWjQsl6dIUq8=\n-----END PRIVATE KEY-----\n"
                },
               tls:{
              rejectUnauthorized:false
               }
              });
        
              
              console.log(token);
              var mailOptions = {
                
                to: email,
                from: 'tjlayan20@gmail.com',
                subject: 'PartiFest Email Confirmation',
                text: 'You are receiving this because you just register for an account with us.\n\n' +
                  'Please click on the following link, or paste this into your browser to confirm your email:\n\n' +
                  'http://' + req.headers.host + '/confirm/' + token + '\n\n' +
                  'Thanks.\n'
              };
              smtpTransport.sendMail(mailOptions, function(err) {
                console.log('mail sent');
        
                req.flash('success_messages', 'A confirmation e-mail has been sent to ' + email + ' with further instructions.');
                done(err, 'done');
            
              });
          
            }
        
          ],
        
          function(err){
            if (err) return next(err);
            res.redirect( '/login-business');
          });


        }
      }  
    });
  }

});

router.get('/confrim-email', function(req, res) {


  db.query('SELECT partyid,  city_name, state_name, party_name, aditional, price, startDate, startTime, endDate, endTime, image, address, full_name FROM register natural join party where userid = id ',function(err, rows, fields) {
    if (err) throw err;
    console.log(rows[0].aditional);

  });


});

router.get('/confirm/:token', function(req, res) {
  db.query('select * from register where confirmtoken = ? ', [req.params.token ], function(err, data){

   if (!data.length) {
     req.flash('error', 'Email not successfully confirmed due to wrong confirmation link.');
     res.redirect('/register');
   }
   else{
     db.query('update register set status = "true" where confirmtoken = ? ', [req.params.token ], function(err, data){
       if (!err){
         req.flash('success_messages', 'Email successfully confirm. Please Login.');
         res.redirect('/login');
       }
     
    });
   }
 });
});



//forget password



//Login page
router.get('/login',function(req,res){
  res.render('login');
});

//Login business page
router.get('/login-business',function(req,res){
  res.render('login-business');
});



//login user post
router.post('/login', function(req, res, next) {
  passport.authenticate('localuser',{
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
    //session: false
  }) (req, res, next);
});

//business login
router.post('/login-business', function(req, res, next) {
  passport.authenticate('localbu',{
    successRedirect: '/profile',
    failureRedirect: '/login-business',
    failureFlash: true
    //session: false
  }) (req, res, next);
});

//logout
router.get('/logout',  function(req, res, next) {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/test');

});

// forget password page
router.get('/forget-password',function(req,res){
  res.render('forget-password');
});

// forget password post
router.post('/forget-password', function(req, res, next){
  const {email, atype} = req.body;
  let errors = [];

  if(!email || !atype) {
    errors.push({msg: 'Please fill in your email and choose account type'});
  }

  if(errors.length > 0) {
    res.render('forget-password', {
      errors,
      email
    });
  }
  // validation passed
  else{

    // users account

    if(atype == 'User Account'){

    db.query("select * from users where email = ? ",
    email, function(err, data){
      if(!data.length){
        errors.push({msg: 'That email is not registered '});
        res.render('forget-password', {
          errors,
          email
      
        });
      }
      else{
    
  
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
     
        done(err, token);
      });
    },
    function(token, done) {
  
        var d = new Date(Date.now()+3600000).toISOString().slice(0, 19).replace('T', ' ');
   
        db.query("update users set resetpasswordtoken = ?, resetpasswordexpire = ? where id = ?",
          [token, d, data[0].id], function(err, data){
            if(!err){
              console.log('inset me');
            }
            else{
              res.send(err);

            }
            
          });
        done(err, token, data);

    },


    function(token, data, done) {
     
      var smtpTransport = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        //service: 'Gmail', 
        auth: {
          type: 'OAuth2',
          user: 'info@partifest.com',
          serviceClient: "102086845611841503378",
          privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCwORit6+APfwO/\nVj4ofvy1Jpr+VRQZJdc9vBRtB2TCSCi1Q7C20iiqHLL62b7x6JQECrFFYXMlF8RE\nZJxyZXaJeq8hrAZSY64JGvj8XNMzAElA/gDeSJ6gWSJv/KU2NcAt3OoVSzTwoEo3\nmdvnEld2sebjaIw+drvwS/TeWFJtXVvqqtb0FhYulxHmAQyyVtR6q42Cyfh/aroc\nVZVHywxiCViqztwnpw3UF/1mxx0b6aqjVjxlxHHMz5qyWUBez7Ksgn6Hcv2laEzb\n8H6qOlvlBmo495lpxm1+8BRS4nMm8P5OMXeS7DnoFZ6ToNRKD10TxlqqzSAqaOke\nWKhNmbcPAgMBAAECggEABMkNeNjulQfPnpLao0I3iI/Le7FBwiEQmZY8Pm20oxX5\n4lo74pW4ZvjaigyprmtbbEoCCwPyGtrCCKgWxisn2eSL/EUYnYTOxWPcc7Xtl5/1\nXUod1JYc60vLBJwpZwcfTd+G4nHQC+ITwd4au56i42VCA4DjoLqcBegky849hsdh\nBopgEq5O0qL/DBvZ0gOhoLhaWePvkoQPq8ahFu/S7bMMwFmN/Rts3XVWgnA3io/Q\nrIF9dS47ocCShNL2THboIxS9AjN1Fp/a/POVbzoNAQ4Q7M2XatbdEj+tsdh3ltHk\nTQX1TMHaX5GbzSJ+xkffqYE0L1LxsUc+nOCKgSY1KQKBgQDc7bGOWjMFgWbEbfuo\nekFKBRf1di0C+X4eyLhpk0Yj/l/0juoFXhp7cKo565OLzo65VCbxD3RSpbrRyA7P\nAQq9goi+CA09oDdEX9KSIF8L219J5xCZI9+BHfw9Ku2Lym2nprBq5wYVJus8cTef\njuOz+UD8xKQJB0AGvTyTBHISUwKBgQDMMp55yezSfpu0vGk7Sj1j25EjZvSv7poP\nPi97jgdM9YaccIclVBw7L5EPCH+qaU5k3koB1KfAaE97wY+RVbt5HxvtPirsQ/cF\nx43s5sKV7qW9FY5cCJUu3i74Qu2+qMdcX1n49RhgGk4yLKEgrDaNn0+pGmgLjLRi\nPfDfxW6o1QKBgBFgtP2whKDjO9UpnYj0DNyop+jL4eCBBXWgbjkHt5WvNZcEAs5n\nR4f8JbemmxV9KubTArklcQ3rMVW8+cU4nMKpWN4xvfDiAFblfqe12iQRnl4uybRy\nCOucEzIwhTzgsF1mlCvkfir9w7UeZrSrRafrbDw1r31yT4v4KKKbz+k3AoGASyfC\nTj70rBCvTFkgPhM3/x3cEHSfUHV4PG392fLPWxLvBXshMqr/bQU31ZmiK11w3g02\nne/gAiAiSQFXzv0H8C9z/uCnuafWLklhQjU4nyhj1fEuIU+DYOmjzfoMOOUz4xqx\nKcFDxHNKHotwjm7z8TIWhr3SV5Xk+lej5ShsbzUCgYEAxJ1p8LLOwnJhB675o5wu\nVdLphwPu4lDA3YotuSdLf5b1K59nNN6OhynTzu4tw/TqGrzJFwzCrLK1o93077DF\nUQYm5hzxcTTKyXu+jgBnzCC9uix1a/wy2nBbxgYzZ5QyUMXYAwIg178k6k1CVRn2\nahIfmPd5R8ntWjQsl6dIUq8=\n-----END PRIVATE KEY-----\n"
        },
        tls:{
          rejectUnauthorized:false
        }
      
      });

      
      console.log(token);
      var mailOptions = {
        
        to: data[0].Email,
        from: 'tjlayan20@gmail.com',
        subject: 'PartiFest Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');

        if(!err){

        req.flash('success_messages', 'An e-mail has been sent to ' + data[0].Email + ' with further instructions.');
        done(err, 'done');

        }
    
      });
  
    }

  ],


  function(err){
    if (err) return next(err);
    res.redirect( '/forget-password');
  });

   }
  });

}

// business account
if (atype == 'Business Account'){

  db.query("select * from business where email = ? ",
    email, function(err, data){
      if(!data.length){
        errors.push({msg: 'That email is not registered '});
        res.render('forget-password', {
          errors,
          email
      
        });
      }
      else{
    
  
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
     
        done(err, token);
      });
    },
    function(token, done) {
  
        var d = new Date(Date.now()+3600000).toISOString().slice(0, 19).replace('T', ' ');
   
        db.query("update business set resetpasswordtoken = ?, resetpasswordexpire = ? where id = ?",
          [token, d, data[0].id], function(err, data){
            if(!err){
              console.log('inset me');
            }
            else{
              res.send(err);

            }
            
          });
        done(err, token, data);

    },


    function(token, data, done) {
     
      var smtpTransport = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        //service: 'Gmail', 
        auth: {
          type: 'OAuth2',
          user: 'info@partifest.com',
          serviceClient: "102086845611841503378",
          privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCwORit6+APfwO/\nVj4ofvy1Jpr+VRQZJdc9vBRtB2TCSCi1Q7C20iiqHLL62b7x6JQECrFFYXMlF8RE\nZJxyZXaJeq8hrAZSY64JGvj8XNMzAElA/gDeSJ6gWSJv/KU2NcAt3OoVSzTwoEo3\nmdvnEld2sebjaIw+drvwS/TeWFJtXVvqqtb0FhYulxHmAQyyVtR6q42Cyfh/aroc\nVZVHywxiCViqztwnpw3UF/1mxx0b6aqjVjxlxHHMz5qyWUBez7Ksgn6Hcv2laEzb\n8H6qOlvlBmo495lpxm1+8BRS4nMm8P5OMXeS7DnoFZ6ToNRKD10TxlqqzSAqaOke\nWKhNmbcPAgMBAAECggEABMkNeNjulQfPnpLao0I3iI/Le7FBwiEQmZY8Pm20oxX5\n4lo74pW4ZvjaigyprmtbbEoCCwPyGtrCCKgWxisn2eSL/EUYnYTOxWPcc7Xtl5/1\nXUod1JYc60vLBJwpZwcfTd+G4nHQC+ITwd4au56i42VCA4DjoLqcBegky849hsdh\nBopgEq5O0qL/DBvZ0gOhoLhaWePvkoQPq8ahFu/S7bMMwFmN/Rts3XVWgnA3io/Q\nrIF9dS47ocCShNL2THboIxS9AjN1Fp/a/POVbzoNAQ4Q7M2XatbdEj+tsdh3ltHk\nTQX1TMHaX5GbzSJ+xkffqYE0L1LxsUc+nOCKgSY1KQKBgQDc7bGOWjMFgWbEbfuo\nekFKBRf1di0C+X4eyLhpk0Yj/l/0juoFXhp7cKo565OLzo65VCbxD3RSpbrRyA7P\nAQq9goi+CA09oDdEX9KSIF8L219J5xCZI9+BHfw9Ku2Lym2nprBq5wYVJus8cTef\njuOz+UD8xKQJB0AGvTyTBHISUwKBgQDMMp55yezSfpu0vGk7Sj1j25EjZvSv7poP\nPi97jgdM9YaccIclVBw7L5EPCH+qaU5k3koB1KfAaE97wY+RVbt5HxvtPirsQ/cF\nx43s5sKV7qW9FY5cCJUu3i74Qu2+qMdcX1n49RhgGk4yLKEgrDaNn0+pGmgLjLRi\nPfDfxW6o1QKBgBFgtP2whKDjO9UpnYj0DNyop+jL4eCBBXWgbjkHt5WvNZcEAs5n\nR4f8JbemmxV9KubTArklcQ3rMVW8+cU4nMKpWN4xvfDiAFblfqe12iQRnl4uybRy\nCOucEzIwhTzgsF1mlCvkfir9w7UeZrSrRafrbDw1r31yT4v4KKKbz+k3AoGASyfC\nTj70rBCvTFkgPhM3/x3cEHSfUHV4PG392fLPWxLvBXshMqr/bQU31ZmiK11w3g02\nne/gAiAiSQFXzv0H8C9z/uCnuafWLklhQjU4nyhj1fEuIU+DYOmjzfoMOOUz4xqx\nKcFDxHNKHotwjm7z8TIWhr3SV5Xk+lej5ShsbzUCgYEAxJ1p8LLOwnJhB675o5wu\nVdLphwPu4lDA3YotuSdLf5b1K59nNN6OhynTzu4tw/TqGrzJFwzCrLK1o93077DF\nUQYm5hzxcTTKyXu+jgBnzCC9uix1a/wy2nBbxgYzZ5QyUMXYAwIg178k6k1CVRn2\nahIfmPd5R8ntWjQsl6dIUq8=\n-----END PRIVATE KEY-----\n"
        },
        tls:{
          rejectUnauthorized:false
        }
      
      });

      
      console.log(token);
      var mailOptions = {
        
        to: data[0].Email,
        from: 'tjlayan20@gmail.com',
        subject: 'PartiFest Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');

        if(!err){

        req.flash('success_messages', 'An e-mail has been sent to ' + data[0].Email + ' with further instructions.');
        done(err, 'done');

        }
    
      });
  
    }

  ],


  function(err){
    if (err) return next(err);
    res.redirect( '/forget-password');
  });

   }
  });

}


}
    
});

// reset token
router.get('/reset/:token', function(req, res) {
   db.query('select * from register where resetpasswordtoken = ? ', [req.params.token ], function(err, data){
     console.log(data);
    if (!data.length) {
      req.flash('error', 'Password reset link is invalid.');
      res.redirect('/forget-password');
    }
    else{
      res.render('reset', {token: req.params.token});
    }
  });
});

// reset token Post
router.post('/reset/:token', function(req, res) {

  const { password, password2} = req.body;
  let errors = [];

  if( !password || !password2) {
    errors.push({msg: 'Please fill in all required fields'});
    
  }

 
  if(password != password2){
    errors.push({msg: 'Password do not match'});
  }

  if(errors.length > 0) {
    res.render('reset', {token: req.params.token, errors

    });
  }

 

  // validation passed
  else{
          bcrypt.genSalt(10,(err,salt)=>bcrypt.hash(password, salt, (err, hash)=>{
            if(err) throw err;

            //set pass to hash;
            let password = hash;

            db.query("update register set password = ?  where resetpasswordtoken = ?",
            [password, req.params.token], function(err, rs){
              if(err){
                res.send('not inserted buddy')
              }
              else{
                req.flash('success_msg', 'Your password has been successfully changed. Please login with new password')
                res.redirect('/login');
              }
            });

          }));

        
        }
});


router.get('/page-not-found',function(req,res){
  res.render('page-not-found');
});


// print sticker business

router.get('/sticker', function(req,res){
  res.render('sticker');
})

router.get('/print', function(req,res){
  console.log(req.texts);
  res.render('print');
});


router.post('/print', function(req,res){
  console.log(req.texts);
  res.render('print');
});

  
module.exports = router;
