// ContactForm.js
import { Box, Button, TextField } from "@mui/material";
import { Formik } from "formik";
import * as React from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { ADD_CONTACT } from "../../utils/mutations";
import { GET_CONTACTS } from "../../utils/queries";
import { useMutation } from "@apollo/client";
import AUTH from "../../utils/auth";
import { useNavigate } from "react-router-dom";

const initialValues = {
  firstName: "",
  lastName: "",
  companyName: "",
  email: "",
  phone: "",
  address1: "",
  address2: "",
};

const ContactForm = ({ refetch, onSuccess }) => {
  const navigate = useNavigate();
  const isNotMobile = useMediaQuery("(min-width: 600px)");
  const [addContact] = useMutation(ADD_CONTACT, {
    update(cache, { data: { addContact } }) {
      try {
        const { contacts } =
          cache.readQuery({
            query: GET_CONTACTS,
            variables: { _id: AUTH.getProfile().data._id },
          }) || {};

        if (contacts && contacts.length > 0) {
          cache.writeQuery({
            query: GET_CONTACTS,
            variables: { _id: AUTH.getProfile().data._id },
            data: {
              contacts: [...contacts, addContact],
            },
          });
        }
      } catch (error) {
        console.error("Error updating cache:", error);
      }
    },
  });

  const handleFormSubmit = async (values) => {
    try {
      const { data } = await addContact({
        variables: {
          _id: AUTH.getProfile().data._id,
          firstName: values.firstName,
          lastName: values.lastName,
          companyName: values.companyName,
          email: values.email,
          phone: values.phone,
          address1: values.address1,
          address2: values.address2,
        },
      });
      refetch();
      onSuccess();
      navigate("/contacts");
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancel = () => {
    onSuccess();
  };

  return (
    <Box m="20px">
      <Header title="Create Contact" subtitle="Create new lead!" />

      <Formik onSubmit={handleFormSubmit} initialValues={initialValues}>
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
        }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNotMobile ? undefined : "span 4" },
              }}
            >
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="First Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.firstName}
                name="firstName"
                error={!!touched.firstName && !!errors.firstName}
                helperText={touched.firstName && errors.firstName}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Last Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.lastName}
                name="lastName"
                error={!!touched.lastName && !!errors.lastName}
                helperText={touched.lastName && errors.lastName}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Company Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.companyName}
                name="companyName"
                error={!!touched.companyName && !!errors.companyName}
                helperText={touched.companyName && errors.companyName}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Email"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
                name="email"
                error={!!touched.email && !!errors.email}
                helperText={touched.email && errors.email}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Phone Number"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.phone}
                name="phone"
                error={!!touched.phone && !!errors.phone}
                helperText={touched.phone && errors.phone}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Address 1"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.address1}
                name="address1"
                error={!!touched.address1 && !!errors.address1}
                helperText={touched.address1 && errors.address1}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Address 2"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.address2}
                name="address2"
                error={!!touched.address2 && !!errors.address2}
                helperText={touched.address2 && errors.address2}
                sx={{ gridColumn: "span 4" }}
              />
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button
                type="submit"
                color="secondary"
                variant="contained"
                value="Submit"
                sx={{ mr: "10px" }}
              >
                Create New Contact
              </Button>
              <Button
                type="button"
                color="secondary"
                variant="contained"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default ContactForm;
