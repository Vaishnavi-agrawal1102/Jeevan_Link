
const { REQUEST_TYPE, REQUEST_URGENCY } = require("../constants");

const validateCreateRequest = (req, res, next) => {
  const { type, description, district, lng, lat, urgency } = req.body;
  const errors = [];

  if (!type || !Object.values(REQUEST_TYPE).includes(type)) {
    errors.push("A valid request type is required");
  }

  if (
    typeof description !== "string" ||
    description.trim().length < 5 ||
    description.trim().length > 1000
  ) {
    errors.push("Description must be between 5 and 1000 characters");
  }

  // District and GPS are optional only for anonymous website SOS.
  if (req.sosAccess !== true) {
    if (typeof district !== "string" || !district.trim()) {
      errors.push("District is required");
    }

    if (
      lng === undefined ||
      lat === undefined ||
      !Number.isFinite(Number(lng)) ||
      !Number.isFinite(Number(lat)) ||
      Number(lng) < -180 ||
      Number(lng) > 180 ||
      Number(lat) < -90 ||
      Number(lat) > 90
    ) {
      errors.push("Valid longitude and latitude coordinates are required");
    }
  } else if (district !== undefined && typeof district !== "string") {
    errors.push("District must be text");
  }

  if (urgency && !Object.values(REQUEST_URGENCY).includes(urgency)) {
    errors.push("Invalid urgency level");
  }

  if (errors.length) {
    return res.status(400).json({
      success: false,
      message: errors.join(". "),
    });
  }

  next();
};

module.exports = { validateCreateRequest };
