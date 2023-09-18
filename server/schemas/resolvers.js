const { AuthenticationError } = require("apollo-server-express");
const {
  User,
  Calendar,
  Contacts,
  Applications,
  ProfilePicture,
} = require("../models");
const { signToken } = require("../auth/auth");
const { ObjectId } = require("mongodb");

const resolvers = {
  Query: {
    users: async () => {
      return User.find();
    },
    user: async (parent, { email }) => {
      return User.findOne({ email });
    },
    calendars: async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }
      return Calendar.find({ user: context.user._id });
    },
    contacts: async (parent, { _id }) => {
      return User.findOne({ _id }).populate("contacts");
    },
    applications: async (parent, { _id }) => {
      return User.findOne({ _id }).populate("applications");
    },
    profilePicture: async (parent, { _id }) => {
      return User.findOne({ _id }).populate("profilePicture");
    },
  },
  // users: async () => {
  //   return User.find().populate('thoughts');
  // },
  // user: async (parent, { username }) => {
  //   return User.findOne({ username }).populate('thoughts');
  // },
  // thoughts: async (parent, { username }) => {
  //   const params = username ? { username } : {};
  //   return Thought.find(params).sort({ createdAt: -1 });
  // },
  // thought: async (parent, { thoughtId }) => {
  //   return Thought.findOne({ _id: thoughtId });
  // },
  // },

  Mutation: {
    addUser: async (parent, { firstName, lastName, email, password }) => {
      const user = await User.create({ firstName, lastName, email, password });
      const token = signToken(user);

      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
      console.log(user);
      if (!user) {
        throw new AuthenticationError("No user found with this email address");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const token = signToken(user);

      return { token, user };
    },
    addCalendarEvent: async (parent, { todo, date }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }
      const event = await Calendar.create({
        todo,
        date,
        user: context.user._id,
      });
      return event;
    },
    deleteEvent: async (parent, { id }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }
      const deleted = await Calendar.findOneAndRemove({
        _id: new ObjectId(id),
        user: context.user._id,
      });
      return { id: deleted._id };
    },
    editCalendarEvent: async (parent, { id, todo, date }, context) => {
      console.log("Edit Calendar Event Mutation called"); // Log a message to indicate the resolver is being executed
      console.log("Input Parameters:", id, todo, date);
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }
      console.log("User:", context.user._id);
      const event = await Calendar.findOneAndUpdate(
        { _id: id, user: context.user._id },
        { todo, date: new Date(date) },
        { new: true }
      );
      console.log("Event:", event);
      return event;
    },

    addContact: async (
      parent,
      { firstName, lastName, companyName, phone, email, address1, address2 },
      context
    ) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }
      const updateContacts = await User.findOneAndUpdate(
        { _id: context.user._id },
        {
          $push: {
            contacts: {
              firstName,
              lastName,
              companyName,
              phone,
              email,
              address1,
              address2,
            },
          },
        }
      );
      return updateContacts;
    },

    deleteContact: async (parent, { _id, contactsId }, context) => {
      console.log(_id);
      console.log(contactsId);
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }
      const deleted = await User.updateOne(
        {
          _id: _id,
          // user: context.user._id,
        },
        {
          $pull: {
            contacts: { _id: contactsId },
          },
        }
      );
      return { id: deleted._id };
    },

    updateContact: async (
      parent,
      {
        firstName,
        lastName,
        companyName,
        phone,
        email,
        address1,
        address2,
        contactsId,
      },
      context
    ) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }
      const updatedContact = await User.updateOne(
        {
          _id: _id,
          // user: context.user._id,
          "contacts._id": contactsId,
        },
        {
          firstName,
          lastName,
          companyName,
          phone,
          email,
          address1,
          address2,
        }
      );
      return updatedContact;
    },

    addApplication: async (
      parent,
      { contactName, position, companyName, appliedOn },
      context
    ) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }
      const updateApplications = await User.findOneAndUpdate(
        { _id: context.user._id },
        {
          $push: {
            applications: {
              contactName,
              appliedOn,
              companyName,
              position,
            },
          },
        }
      );
      return updateApplications;
    },

    deleteApplication: async (parent, { _id, applicationsId }, context) => {
      console.log(_id);
      console.log(applicationsId);
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }
      const deleted = await User.updateOne(
        {
          _id: _id,
          // user: context.user._id,
        },
        {
          $pull: {
            applications: { _id: applicationsId },
          },
        }
      );
      return { id: deleted._id };
    },

    addProfilePicture: async (parent, { pictureUrl }, context) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }
      const updateProfilePicture = await User.findOneAndUpdate(
        { _id: context.user._id },
        {
          // update @ 0 index
          $set: {
            "profilePicture.0.pictureUrl": pictureUrl,
          },
        }
      );
      return updateProfilePicture;
    },

    // addProfilePicture: async (parent, { pictureUrl }, context) => {
    //   if (!context.user) {
    //     throw new AuthenticationError("You need to be logged in!");
    //   }
    //   const updateProfilePicture = await User.findOneAndUpdate(
    //     { _id: context.user._id },
    //     {
    //       // update @ 0 index
    //       $push: {
    //         profilePicture: {
    //           pictureUrl,
    //         },
    //       },
    //     }
    //   );
    //   return updateProfilePicture;
    // },

    //     deleteApplication: async (parent, { id }, context) => {
    //       if (!context.user) {
    //         throw new AuthenticationError("You need to be logged in!");
    //       }
    //       const deleted = await applicationSchema.findOneAndRemove({
    //         _id: new ObjectId(id),
    //         user: context.user._id,
    //       });
    //       return { id: deleted._id };
    //     },
  },
};

module.exports = resolvers;
