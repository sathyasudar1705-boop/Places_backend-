const axios = require("axios");
const HttpError = require("../models/http-error");

async function getCoordsFromAddress(address) {
  try {
    const response = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: address,
        format: "json",
      },
      headers: {
        "User-Agent": "YourAppNameHere", // mandatory for Nominatim
      },
    });

    const data = response.data;

    if (!data || data.length === 0) {
      throw new HttpError(
        "Could not find location for the specified address.",
        422
      );
    }

    const coordinates = {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };

    return coordinates;
  } catch (err) {
    throw new HttpError("Fetching location failed. Please try again.", 500);
  }
}

module.exports = getCoordsFromAddress;