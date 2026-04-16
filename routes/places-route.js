const express = require("express");
const { check } = require("express-validator");

const placesControllers = require("../controllers/places-controller");

const router = express.Router();

// GET /api/places/:pid

router.get("/:pid", placesControllers.getPlaceById);

// GET /api/places/user/:uid

router.get("/user/:uid", placesControllers.getPlacesByUserId);

// POST /api/places
router.post(
  "/",
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
    check("creator").not().isEmpty(), // Add creator validation
  ],
  placesControllers.createPlace
);

// PATCH /api/places/:pid
router.patch(
  "/:pid",
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
  ],
  placesControllers.updatePlace
);

// DELETE /api/places/:pid
router.delete("/:pid", placesControllers.deletePlace);

module.exports = router;