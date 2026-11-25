
const asyncHandler = require("express-async-handler");
const EmergencyRequest = require("../models/EmergencyRequest");
const {
  REQUEST_TYPE,
  REQUEST_URGENCY,
} = require("../constants");

// @desc Receive a simulated SMS SOS
// @route POST /api/sms/simulate
// @access Protected by SMS simulation token
const receiveSimulatedSMS = asyncHandler(async (req, res) => {
  const {
    phone,
    type,
    description,
    state,
    district,
    address,
    people,
    urgency,
  } = req.body;

  // Verify the private simulation token
  const token = req.get("x-sms-token");

  if (
    !process.env.SMS_SIMULATION_TOKEN ||
    token !== process.env.SMS_SIMULATION_TOKEN
  ) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized SMS simulation request",
    });
  }

  // Validate phone number
  if (
    typeof phone !== "string" ||
    !/^\+?[0-9]{10,15}$/.test(phone.trim())
  ) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid sender phone number",
    });
  }

  // Validate emergency type
  if (!Object.values(REQUEST_TYPE).includes(type)) {
    return res.status(400).json({
      success: false,
      message: "Invalid emergency type",
    });
  }

  // Validate description
  if (
    typeof description !== "string" ||
    description.trim().length < 5 ||
    description.trim().length > 1000
  ) {
    return res.status(400).json({
      success: false,
      message: "Description must contain 5 to 1000 characters",
    });
  }

  const numberOfPeople = Number(people ?? 1);

  if (
    !Number.isInteger(numberOfPeople) ||
    numberOfPeople < 1 ||
    numberOfPeople > 1000
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid number of people",
    });
  }

  if (
    urgency &&
    !Object.values(REQUEST_URGENCY).includes(urgency)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid urgency",
    });
  }

  const request = await EmergencyRequest.create({
    victim: null,
    source: "sms",
    reporterPhone: phone.trim(),
    type,
    urgency: urgency || "medium",
    description: description.trim(),
    numberOfPeople,
    state: typeof state === "string" ? state.trim() : "Assam",
    district: typeof district === "string" ? district.trim() : "",
    address: typeof address === "string" ? address.trim() : "",
  });

  // Notify connected responder dashboards
  const io = req.app.get("io");

  if (io) {
    io.emit("newEmergency", request);
  }

  return res.status(201).json({
    success: true,
    message: "Simulated SMS SOS saved successfully",
    request,
  });
});

module.exports = {
  receiveSimulatedSMS,
};
