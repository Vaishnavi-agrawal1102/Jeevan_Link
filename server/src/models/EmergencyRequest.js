
const mongoose = require("mongoose");
const {
  REQUEST_STATUS,
  REQUEST_URGENCY,
  REQUEST_TYPE,
} = require("../constants");

const emergencyRequestSchema = new mongoose.Schema(
  {
    victim: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    source: {
      type: String,
      enum: ["web", "web_sos", "sms", "mobile_sos"],
      default: "web",
    },

    reporterName: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    reporterPhone: {
      type: String,
      trim: true,
      maxlength: 20,
    },

    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    ngo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    type: {
      type: String,
      enum: Object.values(REQUEST_TYPE),
      required: true,
    },

    urgency: {
      type: String,
      enum: Object.values(REQUEST_URGENCY),
      default: REQUEST_URGENCY.MEDIUM,
    },

    mlPredictions: {
      assistance: {
        type: [String],
        default: [],
      },
      urgency: {
        type: String,
        enum: Object.values(REQUEST_URGENCY),
        default: null,
      },
      urgencyProbabilities: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },
      etaMinutes: {
        type: Number,
        default: null,
      },
    },

    // NGO response information
    ngoResponse: {
      responseEtaMinutes: {
        type: Number,
        min: 0,
        default: null,
      },

      teamDispatched: {
        type: Boolean,
        default: false,
      },

      foodDelivered: {
        type: Boolean,
        default: false,
      },

      waterDelivered: {
        type: Boolean,
        default: false,
      },

      medicalAssistance: {
        type: String,
        enum: ["not_started", "in_progress", "delivered"],
        default: "not_started",
      },

      rescueStatus: {
        type: String,
        enum: ["not_started", "in_progress", "completed"],
        default: "not_started",
      },

      latestUpdate: {
        type: String,
        trim: true,
        maxlength: 500,
        default: "",
      },

      updatedAt: {
        type: Date,
        default: null,
      },
    },

    status: {
      type: String,
      enum: Object.values(REQUEST_STATUS),
      default: REQUEST_STATUS.PENDING,
    },

    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },

    numberOfPeople: {
      type: Number,
      default: 1,
      min: 1,
    },

    state: {
      type: String,
      default: "Assam",
    },

    district: {
      type: String,
      trim: true,
      default: "",
    },

    address: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
        validate: {
          validator: function (coordinates) {
            if (!coordinates || coordinates.length === 0) return true;

            return (
              coordinates.length === 2 &&
              coordinates.every(Number.isFinite) &&
              coordinates[0] >= -180 &&
              coordinates[0] <= 180 &&
              coordinates[1] >= -90 &&
              coordinates[1] <= 90
            );
          },
          message: "Coordinates must contain valid longitude and latitude.",
        },
      },
    },

    media: [
      {
        url: String,
        publicId: String,
        type: {
          type: String,
        },
      },
    ],

    acceptedAt: {
      type: Date,
    },

    completedAt: {
      type: Date,
    },

    cancelReason: {
      type: String,
    },
  },
  { timestamps: true }
);

emergencyRequestSchema.index({ location: "2dsphere" });
emergencyRequestSchema.index({ status: 1, district: 1 });
emergencyRequestSchema.index({ source: 1, createdAt: -1 });
emergencyRequestSchema.index({ ngo: 1, status: 1 });

module.exports = mongoose.model(
  "EmergencyRequest",
  emergencyRequestSchema
);
