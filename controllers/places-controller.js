const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const getCoordsFromAddress = require("../util/location"); // updated
const Place = require("../models/place");

let DUMMY_PLACES = [
  {
    id: "p1",
    title: "Empire State Building",
    description: "One of the most famous sky scrapers in the world!",
    imageUrl:
      "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200",
    address: "20 W 34th St, New York, NY 10001, United States",
    location: {
      lat: 40.7484405,
      lng: -73.9856644,
    },
    creator: "u1",
  },
];








// GET by placeId
const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a place.",
      500
    );

    return next(error);
  }

  if (!place) {
    const error = new HttpError(
      "Could not find a place for the provided id.",
      404
    );
    return next(error);
  }
    
  res.json({ place: place.toObject({ getters: true }) });
};











// GET by userId
const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let places;
  try {
    places = await Place.find({ creator: userId }); // ✅ await added
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find places.",
      500
    );
    return next(error);
  }

  if (!places || places.length === 0) {
    return next(
      new HttpError("Could not find places for the provided user id.", 404)
    );
  }

  res.json({
    places: places.map((place) =>
      place.toObject({ getters: true })
    ),
  });
};









// CREATE place
const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422),
    );
  }

  const { title, description, address, creator, image } = req.body;
  
  console.log("Creating place for creator:", creator); // DEBUG LOG

  let coordinates;
  try {
    coordinates = await getCoordsFromAddress(address);
  } catch (error) {
    console.error("Location fetching failed:", error.message);
    // Fallback coordinates if service fails
    coordinates = { lat: 0, lng: 0 }; 
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: image || "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200",
    creator,
  });

  try {
    await createdPlace.save();
    console.log("Place saved successfully!");
  } catch (err) {
    console.error("Database Save Error:", err); // VERY IMPORTANT LOG
    const error = new HttpError(
      `Creating place failed: ${err.message}`,
      500,
    );
    return next(error);
  }
  res.status(201).json({ place: createdPlace });
};




// UPDATE
const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title, description, image } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId); // ✅ await
  } catch (err) {
    return next(
      new HttpError("Something went wrong, could not update place.", 500)
    );
  }

  if (!place) {
    return next(
      new HttpError("Could not find place for this id.", 404)
    );
  }

  // update values
  place.title = title;
  place.description = description;
  if (image) {
    place.image = image;
  }


  try {
    await place.save(); // ✅ correct
  } catch (err) {
    return next(
      new HttpError("Something went wrong, could not update place.", 500)
    );
  }

  res.status(200).json({
    place: place.toObject({ getters: true }),
  });
};







const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    return next(
      new HttpError("Something went wrong, could not delete place.", 500)
    );
  }

  if (!place) {
    return next(
      new HttpError("Could not find place for this id.", 404)
    );
  }

 try {
  await place.deleteOne();
} catch (err) {
  const error = new HttpError(
    "Something went wrong, could not delete place.",
    500
  );
  return next(error);
}

  res.status(200).json({ message: "Deleted place." });
};



exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
