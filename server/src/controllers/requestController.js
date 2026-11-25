
const asyncHandler = require("express-async-handler");
const EmergencyRequest = require("../models/EmergencyRequest");
const Notification = require("../models/Notification");
const { uploadBuffer } = require("../services/CloudinaryService");

const {
  ROLES,
  REQUEST_STATUS,
  REQUEST_TYPE,
  REQUEST_URGENCY,
} = require("../constants");

// @desc Create a registered or anonymous website emergency request
// @route POST /api/request/create
// @route POST /api/request/sos
const createRequest = asyncHandler(async (req, res) => {
  const {
    type,
    urgency,
    description,
    numberOfPeople,
    state,
    district,
    address,
    lng,
    lat,
    reporterName,
    reporterPhone,
  } = req.body;

  const isAnonymousSOS = req.sosAccess === true;

  if (!type || !Object.values(REQUEST_TYPE).includes(type)) {
    res.status(400);
    throw new Error("A valid emergency request type is required");
  }

  if (
    !description ||
    typeof description !== "string" ||
    description.trim().length < 5 ||
    description.trim().length > 1000
  ) {
    res.status(400);
    throw new Error("Description must be between 5 and 1000 characters");
  }

  if (urgency && !Object.values(REQUEST_URGENCY).includes(urgency)) {
    res.status(400);
    throw new Error("Invalid urgency level");
  }

  const hasCoordinates =
    lng !== undefined &&
    lat !== undefined &&
    lng !== "" &&
    lat !== "" &&
    Number.isFinite(Number(lng)) &&
    Number.isFinite(Number(lat)) &&
    Number(lng) >= -180 &&
    Number(lng) <= 180 &&
    Number(lat) >= -90 &&
    Number(lat) <= 90;

  const cleanDistrict =
    typeof district === "string" ? district.trim() : "";

  const cleanAddress =
    typeof address === "string" ? address.trim() : "";

  if (!isAnonymousSOS && (!req.user || !cleanDistrict || !hasCoordinates)) {
    res.status(400);
    throw new Error(
      "A registered request requires a district and valid GPS coordinates"
    );
  }

  if (
    isAnonymousSOS &&
    !cleanDistrict &&
    !cleanAddress &&
    !hasCoordinates
  ) {
    res.status(400);
    throw new Error(
      "Please provide a district, address, or GPS location"
    );
  }

  const people = Number(numberOfPeople ?? 1);

  if (!Number.isSafeInteger(people) || people < 1) {
    res.status(400);
    throw new Error("Number of people must be a positive whole number");
  }

  if (
    isAnonymousSOS &&
    reporterPhone !== undefined &&
    (typeof reporterPhone !== "string" ||
      reporterPhone.trim().length > 20)
  ) {
    res.status(400);
    throw new Error("Invalid contact phone number");
  }

  if (
    isAnonymousSOS &&
    reporterName !== undefined &&
    (typeof reporterName !== "string" ||
      reporterName.trim().length > 100)
  ) {
    res.status(400);
    throw new Error("Reporter name must be 100 characters or fewer");
  }

  const requestData = {
    victim: req.user?._id || null,
    source: isAnonymousSOS ? "web_sos" : "web",
    type,
    urgency: urgency || "medium",
    description: description.trim(),
    numberOfPeople: people,
    state:
      typeof state === "string"
        ? state.trim()
        : req.user?.state || "",
    district: cleanDistrict,
    address: cleanAddress,
  };

  if (isAnonymousSOS) {
    requestData.reporterName =
      typeof reporterName === "string" ? reporterName.trim() : "";

    requestData.reporterPhone =
      typeof reporterPhone === "string" ? reporterPhone.trim() : "";
  }

  if (hasCoordinates) {
    requestData.location = {
      type: "Point",
      coordinates: [Number(lng), Number(lat)],
    };
  }

  // ==========================================
  // MACHINE LEARNING: ASSISTANCE, URGENCY, ETA
  // ==========================================

  const mlPredictions = {
    assistance: [],
    urgency: null,
    urgencyProbabilities: null,
    etaMinutes: null,
  };

  const mlBaseUrl =
    process.env.ML_API_URL || "http://127.0.0.1:8000";

  const message = description.trim().toLowerCase();

  const hasAny = (...words) =>
    words.some((word) => message.includes(word));

  // Derive available indicators from the SOS description.
  const waterLevel = hasAny("rapidly rising", "rising rapidly")
    ? "Rapidly_Rising"
    : hasAny("water rising", "rising water", "increasing water")
    ? "Rising"
    : "Stable";

  const buildingCondition = hasAny(
    "collapsing",
    "collapsed",
    "building falling"
  )
    ? "Collapsing"
    : hasAny("damaged", "cracked", "broken building")
    ? "Damaged"
    : "Unknown";

  const locationRisk = hasAny(
    "dangerous",
    "high risk",
    "severe flood",
    "deep water"
  )
    ? "High"
    : "Medium";

  const medicalEmergency = hasAny(
    "medical",
    "hospital",
    "injured",
    "injury",
    "unconscious",
    "bleeding",
    "sick"
  );

  const rescueRequired = hasAny(
    "trapped",
    "stranded",
    "rescue",
    "stuck"
  );

  const foodRequired = hasAny("food", "hungry", "ration");

  const waterRequired = hasAny(
    "drinking water",
    "water needed",
    "thirsty"
  );

  const shelterRequired = hasAny(
    "shelter",
    "homeless",
    "roof"
  );

  // 1. ASSISTANCE MODEL
  try {
    const response = await fetch(
      `${mlBaseUrl}/predict/assistance`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: description.trim(),
        }),
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!response.ok) {
      throw new Error(`Assistance API returned ${response.status}`);
    }

    const result = await response.json();

    if (Array.isArray(result.predictions)) {
      mlPredictions.assistance = result.predictions;
    }
  } catch (error) {
    console.error("Assistance ML prediction failed:", error.message);
  }

  // 2. URGENCY MODEL
  let predictedUrgencyLabel = "Medium";

  const urgencyFeatures = {
    people_affected: people,
    people_trapped: rescueRequired ? people : 0,
    injuries_reported: hasAny(
      "injured",
      "injury",
      "bleeding"
    ) ? 1 : 0,
    medical_emergency: medicalEmergency ? 1 : 0,
    rescue_required: rescueRequired ? 1 : 0,
    food_required: foodRequired ? 1 : 0,
    water_required: waterRequired ? 1 : 0,
    shelter_required: shelterRequired ? 1 : 0,

    water_level_Rapidly_Rising:
      waterLevel === "Rapidly_Rising" ? 1 : 0,
    water_level_Rising:
      waterLevel === "Rising" ? 1 : 0,
    water_level_Stable:
      waterLevel === "Stable" ? 1 : 0,

    building_condition_Collapsing:
      buildingCondition === "Collapsing" ? 1 : 0,
    building_condition_Damaged:
      buildingCondition === "Damaged" ? 1 : 0,
    building_condition_Intact:
      buildingCondition === "Intact" ? 1 : 0,
    building_condition_Unknown:
      buildingCondition === "Unknown" ? 1 : 0,

    location_risk_High:
      locationRisk === "High" ? 1 : 0,
    location_risk_Low:
      locationRisk === "Low" ? 1 : 0,
    location_risk_Medium:
      locationRisk === "Medium" ? 1 : 0,
  };

  try {
    const response = await fetch(
      `${mlBaseUrl}/predict/urgency`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          features: urgencyFeatures,
        }),
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!response.ok) {
      throw new Error(`Urgency API returned ${response.status}`);
    }

    const result = await response.json();

    if (result.urgency) {
      predictedUrgencyLabel = String(result.urgency);

      const normalizedUrgency =
        predictedUrgencyLabel.toLowerCase();

      if (
        Object.values(REQUEST_URGENCY).includes(normalizedUrgency)
      ) {
        mlPredictions.urgency = normalizedUrgency;
      }
    }

    if (result.probabilities) {
      mlPredictions.urgencyProbabilities =
        result.probabilities;
    }
  } catch (error) {
    console.error("Urgency ML prediction failed:", error.message);
  }

  // 3. ETA MODEL
  const etaFeatures = {
    urgency_label: predictedUrgencyLabel,
    people_affected: people,
    people_trapped: rescueRequired ? people : 0,

    injuries_reported: hasAny(
      "injured",
      "injury",
      "bleeding"
    ) ? 1 : 0,

    medical_emergency: medicalEmergency ? 1 : 0,
    water_level: waterLevel,
    building_condition: buildingCondition,
    rescue_required: rescueRequired ? 1 : 0,
    location_risk: locationRisk,

    // Fallback environmental values.
    // These are not live measurements.
    context_peak_flood_level_m: 0,
    context_event_duration_days: 0,
    context_rainfall_t1d: 24.395896,
    context_percent_flooded_area: 1.137269,
    context_dfsi: 14.084755,

    flood_type: hasAny("severe flood", "extreme flood")
      ? "Severe Flood"
      : hasAny("flood", "flooded", "flooding")
      ? "Flood"
      : "Unknown",

    peak_discharge_q_cumec: 1242,
    flood_volume_cumec: 2328.47,
    time_to_peak_days: 1,
    recession_time_day: 2,
    drainage_area: 8086.739746,
    catchment_relief: 1047,
    drainage_density: 0.000159,
    annual_precipitation: 1305.466625,
    road_density: 360.825806,
    population_density: 286.953622,
    urban_percentage: 13.356766,
    synthetic_route_distance_km: 10.85,
  };

  try {
    const response = await fetch(
      `${mlBaseUrl}/predict/eta`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          features: etaFeatures,
        }),
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!response.ok) {
      throw new Error(`ETA API returned ${response.status}`);
    }

    const result = await response.json();

    if (
      Number.isFinite(Number(result.predicted_travel_minutes))
    ) {
      mlPredictions.etaMinutes =
        Number(result.predicted_travel_minutes);
    }
  } catch (error) {
    console.error("ETA ML prediction failed:", error.message);
  }

  // Save all three predictions with the emergency request.
  requestData.mlPredictions = mlPredictions;

  // Create emergency request.
  const request = await EmergencyRequest.create(requestData);

  const io = req.app.get("io");

  if (io) {
    io.emit("newEmergency", request);
  }

  res.status(201).json({
    success: true,
    message: "Emergency request submitted successfully",
    request,
  });
});

// @desc Get requests, with filters
// @route GET /api/request/all
// @access Private
const getRequests = asyncHandler(async (req, res) => {
  const { status, district, urgency, type } = req.query;
  const filter = {};

  if (req.user.role === ROLES.VICTIM) {
    filter.victim = req.user._id;
  }

  if (req.user.role === ROLES.VOLUNTEER && status === "assigned") {
    filter.volunteer = req.user._id;
  }

  // NGOs can view requests only from their registered state/district.
  if (req.user.role === ROLES.NGO) {
    const ngoState = req.user.state?.trim();
    const ngoDistrict = req.user.district?.trim();

    if (ngoState) {
      filter.state = new RegExp(`^${ngoState}$`, "i");
    }

    if (ngoDistrict) {
      filter.district = new RegExp(`^${ngoDistrict}$`, "i");
    }

    // Do not accidentally expose every request if the NGO has no region.
    if (!ngoState && !ngoDistrict) {
      filter._id = { $exists: false };
    }
  }

  if (status && status !== "assigned") {
    filter.status = status;
  }

  if (district && req.user.role !== ROLES.NGO) {
    filter.district = district;
  }

  if (urgency) filter.urgency = urgency;
  if (type) filter.type = type;

  const requests = await EmergencyRequest.find(filter)
    .populate("victim", "name phone")
    .populate("volunteer", "name phone")
    .populate("ngo", "name organizationName state district")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: requests.length,
    requests,
  });
});

// @desc Get nearby pending requests for volunteers
// @route GET /api/request/nearby?lng=&lat=&maxDistance=
// @access Private (Volunteer)

const getNearbyRequests = asyncHandler(async (req, res) => {
  const lng = Number(req.query.lng);
  const lat = Number(req.query.lat);
  const maxDistance = Number(req.query.maxDistance ?? 15000);

  const hasValidCoordinates =
    req.query.lng !== undefined &&
    req.query.lat !== undefined &&
    Number.isFinite(lng) &&
    Number.isFinite(lat) &&
    lng >= -180 &&
    lng <= 180 &&
    lat >= -90 &&
    lat <= 90 &&
    Number.isFinite(maxDistance) &&
    maxDistance > 0;

  const volunteer = req.user;

  // Volunteers must have a registered state.
  const volunteerState = volunteer.state?.trim();
  const volunteerDistrict = volunteer.district?.trim();

  if (!volunteerState) {
    res.status(400);
    throw new Error(
      "Please update your profile with your state before viewing nearby emergencies."
    );
  }

  const escapeRegex = (value) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const pendingFilter = {
    status: REQUEST_STATUS.PENDING,
  };

  // Restrict requests to the volunteer's registered region.
  const regionFilter = {
    state: {
      $regex: `^${escapeRegex(volunteerState)}$`,
      $options: "i",
    },
  };

  if (volunteerDistrict) {
    regionFilter.district = {
      $regex: `^${escapeRegex(volunteerDistrict)}$`,
      $options: "i",
    };
  }

  let gpsRequests = [];

  // GPS search also respects state and district.
  if (hasValidCoordinates) {
    gpsRequests = await EmergencyRequest.find({
      ...pendingFilter,
      ...regionFilter,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: maxDistance,
        },
      },
    }).populate("victim", "name phone");
  }

  // Regional search retrieves all pending requests
  // in the volunteer's registered region.
  const regionRequests = await EmergencyRequest.find({
    ...pendingFilter,
    ...regionFilter,
  }).populate("victim", "name phone");

  // Combine results without duplicates.
  const combinedRequests = [
    ...gpsRequests,
    ...regionRequests,
  ];

  const uniqueRequests = Array.from(
    new Map(
      combinedRequests.map((request) => [
        request._id.toString(),
        request,
      ])
    ).values()
  ).sort(
    (a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
  );

  res.json({
    success: true,
    count: uniqueRequests.length,
    requests: uniqueRequests,
  });
});


// @desc Update an emergency request
// @route PUT /api/request/update/:id
// @access Private
const updateRequest = asyncHandler(async (req, res) => {
  const request = await EmergencyRequest.findById(req.params.id);

  if (!request) {
    res.status(404);
    throw new Error("Request not found");
  }

  const { status, ...rest } = req.body;

  if (status && !Object.values(REQUEST_STATUS).includes(status)) {
    res.status(400);
    throw new Error("Invalid request status");
  }

  const isNGO = req.user.role === ROLES.NGO;
  const isVolunteer = req.user.role === ROLES.VOLUNTEER;
  const isAdmin = req.user.role === ROLES.ADMIN;

  // Accept a pending request as either an NGO or a volunteer.
  if (status === REQUEST_STATUS.ACCEPTED) {
    if (!isNGO && !isVolunteer) {
      res.status(403);
      throw new Error("Only NGOs and volunteers can accept requests");
    }

    if (request.status !== REQUEST_STATUS.PENDING) {
      res.status(400);
      throw new Error("Only pending requests can be accepted");
    }

    if (request.volunteer || request.ngo) {
      res.status(400);
      throw new Error("This request has already been assigned");
    }

    if (isNGO) {
      const ngoState = req.user.state?.trim().toLowerCase();
      const requestState = request.state?.trim().toLowerCase();
      const ngoDistrict = req.user.district?.trim().toLowerCase();
      const requestDistrict = request.district?.trim().toLowerCase();

      if (ngoState && requestState && ngoState !== requestState) {
        res.status(403);
        throw new Error("You can only accept requests in your state");
      }

      if (
        ngoDistrict &&
        requestDistrict &&
        ngoDistrict !== requestDistrict
      ) {
        res.status(403);
        throw new Error("You can only accept requests in your district");
      }

      request.ngo = req.user._id;
      } else {
  // Check whether this volunteer already has an active request.
  const existingActiveRequest = await EmergencyRequest.findOne({
    volunteer: req.user._id,
    status: {
      $in: [
        REQUEST_STATUS.ACCEPTED,
        REQUEST_STATUS.IN_PROGRESS,
      ],
    },
    _id: { $ne: request._id },
  });

  if (existingActiveRequest) {
    res.status(400);
    throw new Error(
      "You already have an active emergency request. Complete it before accepting another."
    );
  }

  request.volunteer = req.user._id;
}

    request.acceptedAt = new Date();
  }

  // NGO operational updates are allowed only for the NGO assigned to this request.
  const ngoResponseFields = [
    "responseEtaMinutes",
    "teamDispatched",
    "foodDelivered",
    "waterDelivered",
    "medicalAssistance",
    "rescueStatus",
    "latestUpdate",
  ];

  const isUpdatingNGOResponse = ngoResponseFields.some(
    (field) => rest[field] !== undefined
  );

  if (isUpdatingNGOResponse) {
    const isAssignedNGO =
      request.ngo &&
      request.ngo.toString() === req.user._id.toString();

    if (!isAssignedNGO && !isAdmin) {
      res.status(403);
      throw new Error(
        "Only the assigned NGO can update NGO response details"
      );
    }

    for (const field of ngoResponseFields) {
      if (rest[field] !== undefined) {
        request.set(`ngoResponse.${field}`, rest[field]);
      }
    }

    request.set("ngoResponse.updatedAt", new Date());
  }

  if (status === REQUEST_STATUS.COMPLETED) {
    const isAssignedVolunteer =
      request.volunteer &&
      request.volunteer.toString() === req.user._id.toString();

    const isAssignedNGO =
      request.ngo &&
      request.ngo.toString() === req.user._id.toString();

    if (!isAssignedVolunteer && !isAssignedNGO && !isAdmin) {
      res.status(403);
      throw new Error(
        "Only the assigned volunteer, NGO, or admin can complete this request"
      );
    }

    request.completedAt = new Date();
  }

  if (status) {
    request.status = status;
  }

  const allowedFields = [
    "description",
    "urgency",
    "numberOfPeople",
    "district",
    "address",
    "cancelReason",
  ];

  for (const field of allowedFields) {
    if (rest[field] !== undefined) {
      request[field] = rest[field];
    }
  }

  const updated = await request.save();
  const io = req.app.get("io");

  if (io) {
    if (status === REQUEST_STATUS.ACCEPTED) {
      io.emit("requestAccepted", updated);
    }

    if (status === REQUEST_STATUS.COMPLETED) {
      io.emit("requestCompleted", updated);
    }
  }

  if (updated.victim) {
    const notification = await Notification.create({
      user: updated.victim,
      title: "Request update",
      message: `Your ${updated.type} request is now "${updated.status}".`,
      type: "request",
      relatedId: updated._id,
    });

    if (io) {
      io.to(updated.victim.toString()).emit(
        "newNotification",
        notification
      );
    }
  }

  res.json({
    success: true,
    request: updated,
  });
});

// @desc Delete a request
// @route DELETE /api/request/delete/:id
// @access Private
const deleteRequest = asyncHandler(async (req, res) => {
  const request = await EmergencyRequest.findById(req.params.id);

  if (!request) {
    res.status(404);
    throw new Error("Request not found");
  }

  const isOwner =
    request.victim &&
    request.victim.toString() === req.user._id.toString();

  if (!isOwner && req.user.role !== ROLES.ADMIN) {
    res.status(403);
    throw new Error("Not authorized to delete this request");
  }

  await request.deleteOne();

  res.json({
    success: true,
    message: "Request deleted",
  });
});

// @desc Attach photo/video evidence to a registered request
// @route POST /api/request/:id/media
// @access Private
const addRequestMedia = asyncHandler(async (req, res) => {
  const request = await EmergencyRequest.findById(req.params.id);

  if (!request) {
    res.status(404);
    throw new Error("Request not found");
  }

  if (
    !request.victim ||
    request.victim.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("Not authorized to add media to this request");
  }

  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error("No files uploaded");
  }

  const uploaded = await Promise.all(
    req.files.map((file) =>
      uploadBuffer(file.buffer, {
        folder: "jalrakshak/requests",
      })
    )
  );

  request.media.push(...uploaded);
  await request.save();

  res.status(201).json({
    success: true,
    media: request.media,
  });
});

module.exports = {
  createRequest,
  getRequests,
  getNearbyRequests,
  updateRequest,
  deleteRequest,
  addRequestMedia,
};
