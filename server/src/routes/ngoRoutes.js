
const express = require("express");

const {
  createAnnouncement,
  getAnnouncements,
  createResourceAlias,
  getOwnResources,
  createShelterAlias,
} = require("../controllers/ngoController");

const {
  protect,
} = require("../middleware/authMiddleware");

const {
  allowRoles,
} = require("../middleware/roleMiddleware");

const {
  ROLES,
} = require("../constants");

const {
  getRequests,
  updateRequest,
} = require("../controllers/requestController");

const router = express.Router();

// ==========================================
// NGO ANNOUNCEMENTS
// ==========================================

router.get("/announcement", getAnnouncements);

router.post(
  "/announcement",
  protect,
  allowRoles(ROLES.NGO, ROLES.ADMIN),
  createAnnouncement
);

// ==========================================
// NGO RESOURCES
// ==========================================

router.post(
  "/resource",
  protect,
  allowRoles(ROLES.NGO),
  createResourceAlias
);

router.get(
  "/resources",
  protect,
  allowRoles(ROLES.NGO),
  getOwnResources
);

// ==========================================
// NGO SHELTERS
// ==========================================

router.post(
  "/shelter",
  protect,
  allowRoles(ROLES.NGO),
  createShelterAlias
);

// ==========================================
// NGO EMERGENCY REQUESTS
// ==========================================

// View emergency requests in NGO's registered region
router.get(
  "/requests",
  protect,
  allowRoles(ROLES.NGO),
  getRequests
);

// Accept requests and update NGO response progress
router.put(
  "/requests/:id",
  protect,
  allowRoles(ROLES.NGO),
  updateRequest
);

module.exports = router;
