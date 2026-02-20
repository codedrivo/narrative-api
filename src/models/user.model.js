const mongoose = require('mongoose');
const validator = require('validator');
const { toJSON, paginate } = require('./plugins');
const bcrypt = require('bcrypt');
const ApiError = require('../helpers/apiErrorConverter');

// ================= LIFE STAGE LOCATION SCHEMA =================
const lifeStageLocationSchema = new mongoose.Schema(
  {
    cityState: {
      type: String,
      trim: true,
      default: "",
    },

    areaType: {
      type: String,
      enum: ["Urban", "Rural", "Suburban", "Other"],
      default: undefined,
    },

    neighborhoodClass: {
      type: String,
      enum: [
        "Humble",
        "Working Class",
        "Middle Class",
        "Upper Class",
        "Other",
      ],
      default: undefined,
    },

    livingSpace: {
      type: String,
      enum: [
        "Home",
        "Apartment building",
        "Townhouse",
        "Condominium",
        "RV Style",
        "Other",
      ],
      default: undefined,
    },

    livingSpaceOther: {
      type: String,
      trim: true,
      default: "",
    },

    maritalStatus: {
      type: String,
      enum: [
        "",
        "Single",
        "Married",
        "Divorced",
        "Widowed",
        "Domestic Partner",
        "Separated",
      ],
      default: undefined,
    },
  },
  { _id: false }
);

// ================= SIBLINGS SCHEMA =================

const siblingSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Brother", "Sister"],
      required: true,
    },

    order: {
      type: String,
      enum: ["Older", "Younger"],
      required: true,
    },
  },
  { _id: false }
);

// ================= STORY HIGHLIGHT SCHEMA =================
const storyHighlightSchema = new mongoose.Schema(
  {
    momentType: {
      type: String,
      default: "",
    },

    momentOther: {
      type: String,
      default: "",
    },

    impactType: {
      type: String,
      default: "",
    },

    impactOther: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

/* ================= USER ================= */
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      required: true
    },
    lastName: {
      type: String,
      trim: true,
      required: true
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      required: true,
      index: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new ApiError("Invalid email", 400);
        }
      },
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    isProfileCompleted: {
      type: Boolean,
      default: false
    },
    terms: {
      type: Boolean,
      default: true
    },
    password: {
      type: String,
      trim: true,
      minlength: 8,
      private: true,
      required: true
    },
    profileimageurl: {
      type: String
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: undefined,
    },
    ageGroup: {
      type: String,
      enum: [
        "Under 50 years old",
        "50-59 years old",
        "60-69 years old",
        "70-79 years old",
        "80-89 years old",
        "90-100 years old",
      ],
      default: undefined,
    },
    ethnicity: {
      type: String,
      default: "",
    },
    paternalEthnicity: {
      type: String,
      default: "",
    },

    maternalEthnicity: {
      type: String,
      default: "",
    },

    // Siblings
    siblings: {
      type: [siblingSchema],
      default: [],
    },

    // Childhood
    earlyChildhood: {
      type: lifeStageLocationSchema,
      default: () => ({}),
    },
    lateChildhood: {
      type: lifeStageLocationSchema,
      default: () => ({}),
    },
    sameAsEarlyChildhood: {
      type: Boolean,
      default: false,
    },

    // Adulthood
    earlyAdulthood: {
      type: lifeStageLocationSchema,
      default: () => ({}),
    },
    lateAdulthood: {
      type: lifeStageLocationSchema,
      default: () => ({}),
    },
    sameAsEarlyAdulthood: {
      type: Boolean,
      default: false,
    },

    // Story Highlight
    storyHighlight: {
      type: storyHighlightSchema,
      default: () => ({}),
    },

    shareStory: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ email: 'text' });

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);

// add apgination plugin
userSchema.plugin(paginate);

// copy data when same as early
userSchema.pre("save", function (next) {

  if (this.sameAsEarlyChildhood) {
    this.lateChildhood = this.earlyChildhood;
  }

  if (this.sameAsEarlyAdulthood) {
    this.lateAdulthood = this.earlyAdulthood;
  }

  next();
});

// check is user password is matching
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

// hash the user password before saving data to db
userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

// login user
userSchema.statics.loginUser = async function (email, password) {
  const user = await this.findOne({ email });

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  if (!(await user.isPasswordMatch(password))) {
    throw new ApiError('Invalid email or password', 400);
  }

  /* if (user.block) {
    throw new ApiError('You are blocked by admin', 400);
  } */

  return user;
};

userSchema.set('toObject', { virtuals: true });
userSchema.set('toJSON', { virtuals: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
